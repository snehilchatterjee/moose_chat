from sqlmodel import SQLModel, Field
from typing import List, TYPE_CHECKING
from sqlmodel import Relationship

if TYPE_CHECKING:
    from .user import Users
    from .message import Message


class RoomMembership(SQLModel, table=True):
    room_id: int | None = Field(foreign_key="room.id", primary_key=True)
    user_id: int | None = Field(foreign_key="users.id", primary_key=True)


class Room(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    capacity: int = Field(ge=1)  # Ensure capacity is at least 1

    users: List["Users"] = Relationship(back_populates="rooms", link_model=RoomMembership)
    messages: List["Message"] = Relationship(back_populates="room")
    
    
