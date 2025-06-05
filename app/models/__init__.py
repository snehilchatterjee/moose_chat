from .user import User
from .room import Room, RoomMembership
from .message import Message

User.model_rebuild()
Room.model_rebuild()
Message.model_rebuild()