from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import get_current_user_id, get_db
from app.schemas.legal import ChatCreate, ChatMessageRequest, ChatMessageResponse
from app.services.ai_service import ai_service
from app.services.rag_service import rag_service

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/sessions")
async def create_chat_session(payload: ChatCreate, user_id: str = Depends(get_current_user_id), db=Depends(get_db)):
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": user_id,
        "title": payload.title,
        "messages": [],
        "citations": [],
        "created_at": now,
        "updated_at": now,
    }
    res = await db.chats.insert_one(doc)
    return {"id": str(res.inserted_id), "title": payload.title}


@router.get("/sessions")
async def list_sessions(user_id: str = Depends(get_current_user_id), db=Depends(get_db)):
    sessions = await db.chats.find({"user_id": user_id}).sort("updated_at", -1).to_list(100)
    return [
        {"id": str(s["_id"]), "title": s["title"], "updated_at": s["updated_at"]}
        for s in sessions
    ]


@router.get("/sessions/{session_id}")
async def get_session(session_id: str, user_id: str = Depends(get_current_user_id), db=Depends(get_db)):
    session = await db.chats.find_one({"_id": ObjectId(session_id), "user_id": user_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "id": str(session["_id"]),
        "title": session["title"],
        "messages": session["messages"],
    }


@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse)
async def send_message(
    session_id: str,
    payload: ChatMessageRequest,
    user_id: str = Depends(get_current_user_id),
    db=Depends(get_db),
):
    session = await db.chats.find_one({"_id": ObjectId(session_id), "user_id": user_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    retrieved_chunks = await rag_service.retrieve(
        db, user_id=user_id, query=payload.content, top_k=5
    )
    context = rag_service.build_context(retrieved_chunks)
    ai_result = await ai_service.legal_chat(payload.content, context)
    if retrieved_chunks:
        ai_result["citations"] = rag_service.build_citations(retrieved_chunks)
    now = datetime.now(timezone.utc)
    session["messages"].append({"role": "user", "content": payload.content, "created_at": now.isoformat()})
    session["messages"].append(
        {
            "role": "assistant",
            "content": ai_result["assistant_message"],
            "citations": ai_result["citations"],
            "created_at": now.isoformat(),
        }
    )
    await db.chats.update_one(
        {"_id": session["_id"]},
        {"$set": {"messages": session["messages"], "updated_at": now}},
    )
    return ChatMessageResponse(
        session_id=session_id,
        user_message=payload.content,
        assistant_message=ai_result["assistant_message"],
        citations=ai_result["citations"],
    )
