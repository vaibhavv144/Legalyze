from fastapi import APIRouter, Depends

from app.core.deps import get_current_user_id, get_db

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
async def list_notifications(user_id: str = Depends(get_current_user_id), db=Depends(get_db)):
    items = await db.notifications.find({"user_id": user_id}).sort("created_at", -1).to_list(100)
    return [
        {
            "id": str(n["_id"]),
            "title": n["title"],
            "message": n["message"],
            "created_at": n["created_at"],
        }
        for n in items
    ]
