from datetime import datetime, timezone
from pathlib import Path

from bson import ObjectId
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.core.deps import get_current_user_id, get_db
from app.schemas.legal import DocumentResponse
from app.services.ai_service import ai_service
from app.services.document_service import document_service
from app.services.rag_service import rag_service

router = APIRouter(prefix="/documents", tags=["documents"])
ALLOWED = {".pdf", ".docx", ".jpg", ".jpeg", ".png"}


def _map_doc(d: dict) -> DocumentResponse:
    return DocumentResponse(
        id=str(d["_id"]),
        file_name=d["file_name"],
        file_type=d["file_type"],
        analysis_status=d["analysis_status"],
        risk_score=d.get("risk_score"),
        created_at=d["created_at"],
    )


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db),
):
    ext = Path(file.filename or "file").suffix.lower()
    if ext not in ALLOWED:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    storage_path, file_ext = await document_service.save_upload(file)
    extracted_text = document_service.extract_text(storage_path, file_ext)
    now = datetime.now(timezone.utc)
    payload = {
        "user_id": user_id,
        "file_name": file.filename,
        "file_type": file_ext.replace(".", ""),
        "storage_path": storage_path,
        "extracted_text": extracted_text,
        "analysis_status": "uploaded",
        "risk_score": None,
        "created_at": now,
    }
    res = await db.documents.insert_one(payload)
    document_id = str(res.inserted_id)
    await rag_service.index_document_chunks(
        db,
        user_id=user_id,
        document_id=document_id,
        file_name=file.filename or "document",
        text=extracted_text,
    )
    await db.notifications.insert_one(
        {
            "user_id": user_id,
            "title": "Upload successful",
            "message": f"{file.filename} uploaded.",
            "created_at": now,
        }
    )
    payload["_id"] = res.inserted_id
    return _map_doc(payload)


@router.get("", response_model=list[DocumentResponse])
async def list_documents(user_id: str = Depends(get_current_user_id), db=Depends(get_db)):
    docs = await db.documents.find({"user_id": user_id}).sort("created_at", -1).to_list(100)
    return [_map_doc(d) for d in docs]


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: str, user_id: str = Depends(get_current_user_id), db=Depends(get_db)):
    doc = await db.documents.find_one({"_id": ObjectId(document_id), "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return _map_doc(doc)


@router.delete("/{document_id}")
async def delete_document(document_id: str, user_id: str = Depends(get_current_user_id), db=Depends(get_db)):
    result = await db.documents.delete_one({"_id": ObjectId(document_id), "user_id": user_id})
    if not result.deleted_count:
        raise HTTPException(status_code=404, detail="Document not found")
    await db.clauses.delete_many({"document_id": document_id})
    await db.risks.delete_many({"document_id": document_id})
    await db.summaries.delete_many({"document_id": document_id})
    await db.document_chunks.delete_many({"document_id": document_id})
    return {"ok": True}


@router.post("/{document_id}/analyze")
async def analyze_document(
    document_id: str, user_id: str = Depends(get_current_user_id), db=Depends(get_db)
):
    doc = await db.documents.find_one({"_id": ObjectId(document_id), "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    await db.documents.update_one({"_id": doc["_id"]}, {"$set": {"analysis_status": "processing"}})
    clauses = await ai_service.extract_clauses(doc.get("extracted_text", ""))
    risks = await ai_service.detect_risks(clauses, doc.get("extracted_text", ""))
    summary = await ai_service.summarize_contract(doc.get("extracted_text", ""))
    await db.clauses.delete_many({"document_id": document_id})
    await db.risks.delete_many({"document_id": document_id})
    await db.summaries.delete_many({"document_id": document_id})

    clause_ids: dict[str, str] = {}
    for c in clauses:
        item = {
            "document_id": document_id,
            "clause_type": c["clause_type"],
            "content": c["content"],
            "explanation": c["explanation"],
            "risk_level": c["risk_level"],
            "created_at": datetime.now(timezone.utc),
        }
        res = await db.clauses.insert_one(item)
        clause_ids[c["clause_type"]] = str(res.inserted_id)

    risk_score = 0
    for r in risks:
        severity = r["severity"]
        risk_score += 80 if severity == "high" else 50 if severity == "medium" else 20
        await db.risks.insert_one(
            {
                "document_id": document_id,
                "clause_id": clause_ids.get(r.get("clause_type", ""), None),
                "clause_type": r.get("clause_type"),
                "severity": severity,
                "issue": r["issue"],
                "risky_text": r.get("risky_text", ""),
                "why_risky": r.get("why_risky", r["issue"]),
                "recommendation": r["recommendation"],
                "created_at": datetime.now(timezone.utc),
            }
        )

    await db.summaries.insert_one(
        {"document_id": document_id, **summary, "created_at": datetime.now(timezone.utc)}
    )
    await db.documents.update_one(
        {"_id": doc["_id"]},
        {"$set": {"analysis_status": "completed", "risk_score": min(risk_score, 100)}},
    )
    await rag_service.index_document_chunks(
        db,
        user_id=user_id,
        document_id=document_id,
        file_name=doc.get("file_name", "document"),
        text=doc.get("extracted_text", ""),
    )
    await db.notifications.insert_one(
        {
            "user_id": user_id,
            "title": "Analysis completed",
            "message": f"Analysis finished for {doc['file_name']}.",
            "created_at": datetime.now(timezone.utc),
        }
    )
    return {"ok": True}
