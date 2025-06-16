from sqlmodel import SQLModel, Field
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, timezone
from sqlmodel import Relationship

from sqlalchemy import TIMESTAMP, Column
from sqlalchemy.sql import func

if TYPE_CHECKING:
    from .room import Room  # Import Room for relationship

class Message(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    room_id: int = Field(foreign_key="room.id", index=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    content: str
    timestamp: datetime = Field(
        sa_column=Column(
            TIMESTAMP(timezone=True), 
            nullable=False, 
            server_default=func.now()
        ),
        default_factory=lambda: datetime.now(timezone.utc)
    )
    room: Optional["Room"] = Relationship(back_populates="messages", sa_relationship_kwargs={"lazy": "joined"})

    class Config:
        orm_mode = True  # Enable ORM mode for compatibility with Pydantic models