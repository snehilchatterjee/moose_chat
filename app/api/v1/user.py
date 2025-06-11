from fastapi import FastAPI, Depends, HTTPException
from fastapi.routing import APIRouter
from app.auth.oauth2 import get_current_user, login_for_access_token
from app.schema.user import UserCreate
from app.core.crypto import hash_password
from app.models import Users, RoomMembership, Room
from app.schema.user import UserResponse
from app.db.session import get_session
from sqlmodel import select
from sqlalchemy import func
from sqlalchemy.orm import selectinload

router = APIRouter()

@router.get("/users",response_model=list[UserResponse])
async def get_users(current_user: dict = Depends(get_current_user),session=Depends(get_session)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    users = await session.exec(select(Users).options(selectinload(Users.rooms)))
    return users.all()

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

@router.get("/get_room/{user_id}")
async def get_room(user_id: int, current_user: Users = Depends(get_current_user), session=Depends(get_session)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    print("here")
    room = (await session.exec(select(Room).where(Room.name == f"{user_id}{current_user.id}"))).first()
    if room:
        return {
            "room_id": room.id,
            "current_user_membership": (await session.exec(select(RoomMembership).where(RoomMembership.room_id == room.id, RoomMembership.user_id == current_user.id))).first(),
            "user_membership": (await session.exec(select(RoomMembership).where(RoomMembership.room_id == room.id, RoomMembership.user_id == user_id))).first()
        }
    
    room = (await session.exec(select(Room).where(Room.name == f"{current_user.id}{user_id}"))).first()
    if room:
        return {
            "room_id": room.id,
            "current_user_membership": (await session.exec(select(RoomMembership).where(RoomMembership.room_id == room.id, RoomMembership.user_id == current_user.id))).first(),
            "user_membership": (await session.exec(select(RoomMembership).where(RoomMembership.room_id == room.id, RoomMembership.user_id == user_id))).first()
        }

    room=Room(name=f"{user_id}{current_user.id}",capacity=2)
    session.add(room)
    await session.commit()
    room_id: int | None = room.id
    membership_current = RoomMembership(room_id=room_id, user_id=current_user.id)
    membership_user = RoomMembership(room_id=room_id, user_id=user_id)
    session.add(membership_current)
    session.add(membership_user)
    await session.commit()
    return {
        "room_id": room_id,
        "current_user_membership": membership_current,
        "user_membership": membership_user
    }
    