from .user import Users
from .room import Room, RoomMembership
from .message import Message

Users.model_rebuild()
Room.model_rebuild()
Message.model_rebuild()