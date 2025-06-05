from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from typing import AsyncGenerator
from app.db.database import engine

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Create a new async session for database operations.
    """
    async with async_sessionmaker(engine, expire_on_commit=False)() as session:
        yield session