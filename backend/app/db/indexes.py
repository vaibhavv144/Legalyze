async def ensure_indexes(db) -> None:
    await db.users.create_index("email", unique=True)
    await db.documents.create_index([("user_id", 1), ("created_at", -1)])
    await db.clauses.create_index([("document_id", 1), ("clause_type", 1)])
    await db.risks.create_index([("document_id", 1), ("severity", 1)])
    await db.documents.create_index("file_name")
    await db.chats.create_index("title")
    await db.document_chunks.create_index([("user_id", 1), ("document_id", 1)])
    await db.document_chunks.create_index([("user_id", 1), ("chunk_index", 1)])
