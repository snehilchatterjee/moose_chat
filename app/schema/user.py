from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    username: str

    class Config:
        orm_mode = True  # This allows Pydantic to read data from SQLAlchemy models
