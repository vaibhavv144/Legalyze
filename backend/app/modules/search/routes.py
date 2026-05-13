from bson import ObjectId
from fastapi import APIRouter, Depends, Query

from app.core.deps import get_current_user_id, get_db

router = APIRouter(prefix="/search", tags=["search"])


@router.get("")
async def search_all(
    q: str = Query(min_length=1),
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db),
):
    regex = {"$regex": q, "$options": "i"}
    docs = await db.documents.find({"user_id": user_id, "file_name": regex}).to_list(20)
    chats = await db.chats.find({"user_id": user_id, "title": regex}).to_list(20)
    user_doc_ids = [str(d["_id"]) for d in await db.documents.find({"user_id": user_id}).to_list(100)]
    clauses = await db.clauses.find({"document_id": {"$in": user_doc_ids}, "content": regex}).to_list(20)
    risks = await db.risks.find({"document_id": {"$in": user_doc_ids}, "issue": regex}).to_list(20)
    return {
        "documents": [{"id": str(d["_id"]), "file_name": d["file_name"]} for d in docs],
        "chats": [{"id": str(c["_id"]), "title": c["title"]} for c in chats],
        "clauses": [
            {"id": str(c["_id"]), "document_id": c["document_id"], "clause_type": c["clause_type"]}
            for c in clauses
        ],
        "risks": [{"id": str(r["_id"]), "severity": r["severity"], "issue": r["issue"]} for r in risks],
    }
