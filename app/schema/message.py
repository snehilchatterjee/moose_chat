from pydantic import BaseModel
from typing import Optional

class MessageSend(BaseModel):
    content: str
    room_id: int