from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import async_sessionmaker
from typing import AsyncGenerator
from app.db.database import async_engine

async def get_session() -> AsyncGenerator[AsyncSession,None]:
    async_session = async_sessionmaker(
        bind=async_engine,
        class_=AsyncSession,
        expire_on_commit=False
    )

    async with async_session() as session:
        yield session