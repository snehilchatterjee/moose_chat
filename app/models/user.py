from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from .room import Room,RoomMembership

from .room import RoomMembership

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str= Field(index=True, unique=True)
    password_hash: str
    name: str

    rooms: list["Room"] = Relationship(back_populates="users", link_model=RoomMembership)

    