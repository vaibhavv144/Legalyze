from datetime import datetime
from typing import Literal

from pydantic import BaseModel


ClauseType = Literal[
    "payment",
    "termination",
    "liability",
    "indemnity",
    "arbitration",
    "confidentiality",
    "renewal",
    "jurisdiction",
    "force_majeure",
]
RiskSeverity = Literal["low", "medium", "high"]
AnalysisStatus = Literal["uploaded", "processing", "completed", "failed"]


class DocumentResponse(BaseModel):
    id: str
    file_name: str
    file_type: str
    analysis_status: AnalysisStatus
    risk_score: int | None = None
    created_at: datetime


class ClauseResponse(BaseModel):
    id: str
    document_id: str
    clause_type: ClauseType
    content: str
    explanation: str
    risk_level: RiskSeverity


class RiskResponse(BaseModel):
    id: str
    document_id: str
    clause_id: str | None = None
    clause_type: str | None = None
    severity: RiskSeverity
    issue: str
    risky_text: str | None = None
    why_risky: str | None = None
    recommendation: str


class SummaryResponse(BaseModel):
    id: str
    document_id: str
    plain_summary: str
    obligations: list[str]
    deadlines: list[str]
    payment_terms: list[str]
    termination_conditions: list[str]
    key_risks: list[str]


class ClauseExplainRequest(BaseModel):
    content: str
    clause_type: ClauseType


class ChatCreate(BaseModel):
    title: str


class ChatMessageRequest(BaseModel):
    content: str


class Citation(BaseModel):
    source: str
    excerpt: str


class ChatMessageResponse(BaseModel):
    session_id: str
    user_message: str
    assistant_message: str
    citations: list[Citation]
