from fastapi import FastAPI, Depends, HTTPException
from fastapi.routing import APIRouter
from app.auth.oauth2 import get_current_user, login_for_access_token
from app.schema.user import UserCreate
from app.core.crypto import hash_password
from app.models import Users
from app.db.session import get_session
from sqlmodel import select

router = APIRouter()

@router.get("/users")
async def get_users(current_user: dict = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return [{"id": 1, "name": "John Doe"}, {"id": 2, "name": "Jane Doe"}]

@router.post("/create_user")
async def create_user(user: UserCreate, session=Depends(get_session)):
    if not user.name or not user.username or not user.password:
        raise HTTPException(status_code=400, detail="Invalid user data")
    
    existing_user = (await session.exec(select(Users).where(Users.username == user.username))).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = hash_password(user.password)
    newUser=Users(
        name=user.name,
        username=user.username,
        password_hash=hashed_password
    )
    session.add(newUser)
    await session.commit()
    # login_for_access_token only expects OAuth2PasswordRequestForm
    from fastapi.security import OAuth2PasswordRequestForm
    form_data = OAuth2PasswordRequestForm(username=newUser.username, password=user.password, scope="", client_id=None, client_secret=None)
    return await login_for_access_token(form_data, session)