from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.indexes import ensure_indexes
from app.db.mongo import close_mongo_connection, connect_to_mongo
from app.modules.analysis.routes import router as analysis_router
from app.modules.auth.routes import router as auth_router
from app.modules.auth.routes import users_router
from app.modules.chat.routes import router as chat_router
from app.modules.documents.routes import router as documents_router
from app.modules.notifications.routes import router as notifications_router
from app.modules.search.routes import router as search_router

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup() -> None:
    await connect_to_mongo()
    from app.db.mongo import get_database

    await ensure_indexes(get_database())


@app.on_event("shutdown")
async def shutdown() -> None:
    await close_mongo_connection()


@app.get("/health")
async def health():
    return {"status": "ok"}


app.include_router(auth_router)
app.include_router(users_router)
app.include_router(documents_router)
app.include_router(analysis_router)
app.include_router(chat_router)
app.include_router(search_router)
app.include_router(notifications_router)
