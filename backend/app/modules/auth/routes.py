from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user_id, get_db
from app.core.security import create_token, hash_password, verify_password, decode_token
from app.schemas.common import TokenResponse, UserCreate, UserLogin, UserResponse, UserUpdate

router = APIRouter(prefix="/auth", tags=["auth"])
users_router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register", response_model=UserResponse)
async def register(payload: UserCreate, db=Depends(get_db)):
    existing = await db.users.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    now = datetime.now(timezone.utc)
    try:
        password_hash = hash_password(payload.password)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Password hashing failed") from exc

    doc = {
        "name": payload.name,
        "email": payload.email.lower(),
        "password_hash": password_hash,
        "created_at": now,
        "updated_at": now,
    }
    result = await db.users.insert_one(doc)
    return UserResponse(
        id=str(result.inserted_id),
        name=doc["name"],
        email=doc["email"],
        created_at=doc["created_at"],
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db=Depends(get_db)):
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user_id = str(user["_id"])
    return TokenResponse(
        access_token=create_token(user_id, "access", 30),
        refresh_token=create_token(user_id, "refresh", 60 * 24 * 7),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(payload: dict):
    token = payload.get("refresh_token")
    if not token:
        raise HTTPException(status_code=400, detail="Missing refresh token")
    decoded = decode_token(token)
    if decoded.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user_id = str(decoded["sub"])
    return TokenResponse(
        access_token=create_token(user_id, "access", 30),
        refresh_token=create_token(user_id, "refresh", 60 * 24 * 7),
    )


@router.get("/me", response_model=UserResponse)
async def me(user_id: str = Depends(get_current_user_id), db=Depends(get_db)):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        created_at=user["created_at"],
    )


@users_router.patch("/me", response_model=UserResponse)
async def update_me(
    payload: UserUpdate, user_id: str = Depends(get_current_user_id), db=Depends(get_db)
):
    updates = {}
    if payload.name:
        updates["name"] = payload.name
    updates["updated_at"] = datetime.now(timezone.utc)
    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": updates})
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    return UserResponse(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        created_at=user["created_at"],
    )
