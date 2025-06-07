from sqlmodel import SQLModel, Field
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from sqlmodel import Relationship

if TYPE_CHECKING:
    from .room import Room  # Import Room for relationship

class Message(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    room_id: int = Field(foreign_key="room.id", index=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    content: str
    timestamp: str= Field(default_factory=lambda: datetime.now().isoformat())

    room: Optional["Room"] = Relationship(back_populates="messages", sa_relationship_kwargs={"lazy": "joined"})

    class Config:
        orm_mode = True  # Enable ORM mode for compatibility with Pydantic models