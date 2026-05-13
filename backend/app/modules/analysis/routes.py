from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import get_current_user_id, get_db
from app.schemas.legal import ClauseExplainRequest, ClauseResponse, RiskResponse, SummaryResponse
from app.services.ai_service import ai_service

router = APIRouter(prefix="/documents", tags=["analysis"])


@router.get("/{document_id}/clauses", response_model=list[ClauseResponse])
async def list_clauses(document_id: str, user_id: str = Depends(get_current_user_id), db=Depends(get_db)):
    doc = await db.documents.find_one({"_id": ObjectId(document_id), "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    clauses = await db.clauses.find({"document_id": document_id}).to_list(100)
    return [
        ClauseResponse(
            id=str(c["_id"]),
            document_id=c["document_id"],
            clause_type=c["clause_type"],
            content=c["content"],
            explanation=c["explanation"],
            risk_level=c["risk_level"],
        )
        for c in clauses
    ]


@router.get("/{document_id}/risks", response_model=list[RiskResponse])
async def list_risks(document_id: str, user_id: str = Depends(get_current_user_id), db=Depends(get_db)):
    doc = await db.documents.find_one({"_id": ObjectId(document_id), "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    risks = await db.risks.find({"document_id": document_id}).to_list(100)
    return [
        RiskResponse(
            id=str(r["_id"]),
            document_id=r["document_id"],
            clause_id=r.get("clause_id"),
            clause_type=r.get("clause_type"),
            severity=r["severity"],
            issue=r["issue"],
            risky_text=r.get("risky_text"),
            why_risky=r.get("why_risky"),
            recommendation=r["recommendation"],
        )
        for r in risks
    ]


@router.get("/{document_id}/summary", response_model=SummaryResponse | None)
async def get_summary(document_id: str, user_id: str = Depends(get_current_user_id), db=Depends(get_db)):
    doc = await db.documents.find_one({"_id": ObjectId(document_id), "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    summary = await db.summaries.find_one({"document_id": document_id})
    if not summary:
        return None
    return SummaryResponse(
        id=str(summary["_id"]),
        document_id=summary["document_id"],
        plain_summary=summary["plain_summary"],
        obligations=summary["obligations"],
        deadlines=summary["deadlines"],
        payment_terms=summary["payment_terms"],
        termination_conditions=summary["termination_conditions"],
        key_risks=summary["key_risks"],
    )


@router.post("/{document_id}/clauses/explain")
async def explain_clause(
    document_id: str,
    payload: ClauseExplainRequest,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db),
):
    doc = await db.documents.find_one({"_id": ObjectId(document_id), "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    data = await ai_service.explain_clause(payload.clause_type, payload.content)
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    return data
