"""Wipe the users collection. Run with the venv activated: python reset_users.py"""
import asyncio

from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings


async def main() -> None:
    client = AsyncIOMotorClient(settings.mongo_uri)
    db = client[settings.mongo_db_name]
    before = await db.users.count_documents({})
    print(f"Users before: {before}")
    result = await db.users.delete_many({})
    print(f"Deleted: {result.deleted_count}")
    after = await db.users.count_documents({})
    print(f"Users after: {after}")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
