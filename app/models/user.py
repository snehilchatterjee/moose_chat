from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy.orm import Mapped 

if TYPE_CHECKING:
    from .room import Room,RoomMembership

from .room import RoomMembership

class Users(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str= Field(index=True, unique=True)
    password_hash: str
    name: str

    rooms: Mapped[List["Room"]] = Relationship(back_populates="users", link_model=RoomMembership)
