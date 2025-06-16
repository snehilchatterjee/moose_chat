from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from app.schema.token import Token, TokenData
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import timedelta, timezone, datetime 
from app.models.user import Users
from sqlmodel import select
from app.core.crypto import verify_hash, hash_password
from app.core.config import settings
from app.db.session import get_session
from app.schema.user import PasswordUpdate
import jwt
from jwt.exceptions import InvalidTokenError

router=APIRouter()
ACCESS_TOKEN_EXPIRE_MINUTES=300

oauth2_scheme=OAuth2PasswordBearer(tokenUrl="/auth/token")

async def authenticate_user(username: str,password: str,session: AsyncSession) :
    user=(await session.exec(select(Users).where(Users.username==username))).first()
    if not user:
        return None
    if not verify_hash(password,user.password_hash):
        return None
    return user, user.password_hash

def create_access_token(data: dict,expires_delta):
    to_encode=data.copy()
    if expires_delta:
        expire=datetime.now(timezone.utc)+expires_delta
    else:
        expire=datetime.now(timezone.utc)+timedelta(minutes=15)
    to_encode.update({"exp":expire})
    encoded_jwt=jwt.encode(to_encode,settings.SECRET_KEY,settings.ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str=Depends(oauth2_scheme),session: AsyncSession=Depends(get_session)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload=jwt.decode(token,settings.SECRET_KEY,settings.ALGORITHM)
        username=payload.get("sub")
        password_hash=payload.get("pwd_hash")
        if username is None or authenticate_user(username,password_hash,session) is None:
            raise credentials_exception
        token_data=TokenData(username=username)
    except InvalidTokenError:
        raise credentials_exception
    user = (await session.exec(select(Users).where(Users.username==token_data.username))).first()
    if user is None:
        raise credentials_exception
    return user


async def verify_token(token: str) -> Users:
    credentials_exception = HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Invalid or expired token",
    )

    session_generator = get_session()
    session: AsyncSession = await session_generator.__anext__()

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        pwd_hash = payload.get("pwd_hash")

        if username is None or pwd_hash is None:
            raise credentials_exception

        user = (await session.exec(select(Users).where(Users.username == username))).first()
        if user is None or user.password_hash != pwd_hash:
            raise credentials_exception

        return user

    except InvalidTokenError:
        raise credentials_exception

    finally:
        try:
            await session_generator.aclose()
        except StopAsyncIteration:
            pass
  

@router.post("/token",response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm=Depends(), session: AsyncSession=Depends(get_session)):
    auth_result = await authenticate_user(form_data.username,form_data.password,session)
    if not auth_result:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    user, password_hash = auth_result
    access_token_expires=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token: str=create_access_token(
        data={"sub":user.username, "pwd_hash":password_hash}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token,token_type="bearer",uid=user.id)

@router.post("/change_password")
async def  change_password(
    password_update: PasswordUpdate,
    session=Depends(get_session)
):
    username=password_update.username
    current_user = (await session.exec(select(Users).where(Users.username == username))).first()
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_hash(password_update.old_password, current_user.password_hash):
        raise HTTPException(status_code=403, detail="Old password is incorrect")

    current_user.password_hash = hash_password(password_update.new_password)
    session.add(current_user)
    await session.commit()

    return {"message": "Password changed successfully"}
