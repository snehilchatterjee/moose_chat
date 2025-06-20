from pydantic import BaseModel
from typing import Union

class Token(BaseModel):
    access_token: str
    token_type: str
    uid: Union[int, None] = None
    name: Union[str, None] = None
    username: Union[str, None] = None

class TokenData(BaseModel):
    username: Union[str, None]=None