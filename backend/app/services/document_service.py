from pathlib import Path
from uuid import uuid4

from docx import Document as DocxDocument
from fastapi import UploadFile
from pypdf import PdfReader

from app.core.config import settings


class DocumentService:
    def __init__(self) -> None:
        Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)

    async def save_upload(self, upload_file: UploadFile) -> tuple[str, str]:
        ext = Path(upload_file.filename or "file").suffix.lower()
        file_id = f"{uuid4().hex}{ext}"
        path = Path(settings.upload_dir) / file_id
        content = await upload_file.read()
        path.write_bytes(content)
        return str(path), ext

    def extract_text(self, file_path: str, file_ext: str) -> str:
        if file_ext == ".pdf":
            reader = PdfReader(file_path)
            return "\n".join((page.extract_text() or "") for page in reader.pages).strip()
        if file_ext == ".docx":
            doc = DocxDocument(file_path)
            return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
        if file_ext in {".jpg", ".jpeg", ".png"}:
            return (
                "Scanned image uploaded. OCR pipeline placeholder extracted minimal text. "
                "Integrate Gemini vision or Tesseract in production."
            )
        return ""


document_service = DocumentService()
