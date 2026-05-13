import math
import re
from datetime import datetime, timezone

import httpx

from app.core.config import settings


class RAGService:
    def chunk_text(self, text: str, chunk_size: int = 900, overlap: int = 180) -> list[str]:
        normalized = re.sub(r"\s+", " ", (text or "")).strip()
        if not normalized:
            return []
        chunks: list[str] = []
        start = 0
        while start < len(normalized):
            end = min(start + chunk_size, len(normalized))
            chunks.append(normalized[start:end])
            if end >= len(normalized):
                break
            start = max(0, end - overlap)
        return chunks

    @staticmethod
    def _tokenize(text: str) -> set[str]:
        return set(re.findall(r"[a-zA-Z0-9_]{3,}", text.lower()))

    async def _embed_text(self, text: str) -> list[float] | None:
        if not settings.gemini_api_key:
            return None
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"text-embedding-004:embedContent?key={settings.gemini_api_key}"
        )
        payload = {"content": {"parts": [{"text": text[:8000]}]}}
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                body = response.json()
                return body.get("embedding", {}).get("values")
            except Exception:
                return None

    @staticmethod
    def _cosine(a: list[float], b: list[float]) -> float:
        if not a or not b or len(a) != len(b):
            return 0.0
        dot = sum(x * y for x, y in zip(a, b))
        na = math.sqrt(sum(x * x for x in a))
        nb = math.sqrt(sum(y * y for y in b))
        if na == 0 or nb == 0:
            return 0.0
        return dot / (na * nb)

    async def index_document_chunks(
        self, db, *, user_id: str, document_id: str, file_name: str, text: str
    ) -> int:
        chunks = self.chunk_text(text)
        await db.document_chunks.delete_many({"document_id": document_id})
        if not chunks:
            return 0

        docs = []
        for idx, chunk in enumerate(chunks):
            embedding = await self._embed_text(chunk)
            docs.append(
                {
                    "user_id": user_id,
                    "document_id": document_id,
                    "file_name": file_name,
                    "chunk_index": idx,
                    "content": chunk,
                    "token_set": list(self._tokenize(chunk)),
                    "embedding": embedding,
                    "created_at": datetime.now(timezone.utc),
                }
            )
        if docs:
            await db.document_chunks.insert_many(docs)
        return len(docs)

    async def retrieve(self, db, *, user_id: str, query: str, top_k: int = 5) -> list[dict]:
        query_tokens = self._tokenize(query)
        query_embedding = await self._embed_text(query)
        chunks = await db.document_chunks.find({"user_id": user_id}).to_list(3000)
        scored: list[tuple[float, dict]] = []
        for chunk in chunks:
            lexical = 0.0
            token_set = set(chunk.get("token_set", []))
            if query_tokens and token_set:
                lexical = len(query_tokens.intersection(token_set)) / max(len(query_tokens), 1)
            vector = 0.0
            if query_embedding and chunk.get("embedding"):
                vector = self._cosine(query_embedding, chunk["embedding"])
            score = (0.65 * vector) + (0.35 * lexical)
            if score > 0:
                scored.append((score, chunk))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [c for _, c in scored[:top_k]]

    @staticmethod
    def build_context(chunks: list[dict], max_chars: int = 5000) -> str:
        parts: list[str] = []
        total = 0
        for c in chunks:
            piece = (
                f"[{c.get('file_name', 'Document')} | chunk {c.get('chunk_index', 0)}]\n"
                f"{c.get('content', '')}\n"
            )
            if total + len(piece) > max_chars:
                break
            parts.append(piece)
            total += len(piece)
        return "\n".join(parts).strip()

    @staticmethod
    def build_citations(chunks: list[dict]) -> list[dict]:
        citations = []
        for c in chunks:
            citations.append(
                {
                    "source": f"{c.get('file_name', 'Document')} (chunk {c.get('chunk_index', 0)})",
                    "excerpt": (c.get("content", "")[:220] + "...").strip(),
                }
            )
        return citations


rag_service = RAGService()
