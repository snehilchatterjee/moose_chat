from sqlmodel import SQLModel, Field
from typing import List, TYPE_CHECKING
from sqlmodel import Relationship

if TYPE_CHECKING:
    from .user import User
    from .message import Message


class RoomMembership(SQLModel, table=True):
    room_id: int = Field(foreign_key="room.id", primary_key=True)
    user_id: int = Field(foreign_key="user.id", primary_key=True)


class Room(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    description: str | None = None
    capacity: int = Field(ge=1)  # Ensure capacity is at least 1

    users: List["User"] = Relationship(back_populates="rooms", link_model=RoomMembership)
    messages: List["Message"] = Relationship(back_populates="room")
    
    
