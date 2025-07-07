from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.routing import APIRouter
from app.auth.oauth2 import get_current_user, login_for_access_token
from app.schema.user import UserCreate
from app.core.crypto import hash_password
from app.models import Users, RoomMembership, Room, Message
from app.schema.user import UserResponse
from app.schema.message import MessageSend
from app.db.session import get_session
from sqlmodel import select
from sqlalchemy import func, desc, asc
from sqlalchemy.orm import selectinload
from datetime import datetime
import logging

from app.core.websockets import manager 
from app.core.llm import chatbot_service

logger = logging.getLogger(__name__) 

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
    

@router.get('/get_messages/{room_id}')
async def get_messages(
    room_id: int,
    limit: int = Query(20, gt=0),
    before: datetime = Query(None),
    current_user: Users = Depends(get_current_user),
    session=Depends(get_session)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    query = select(Message).where(Message.room_id == room_id)

    if before:
        # Fetch messages older than the provided timestamp
        query = query.where(Message.timestamp < before)

    query = query.order_by(desc(Message.timestamp)).limit(limit) 

    results = (await session.exec(query)).all()

    # Reverse to show oldest to newest in frontend
    return list(reversed(results))


@router.post("/send_message")
async def send_message(message: MessageSend, current_user: Users = Depends(get_current_user), session=Depends(get_session)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    room = (await session.exec(select(Room).where(Room.id == message.room_id))).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    if current_user.id is None:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    new_message = Message(room_id=room.id, user_id=current_user.id, content=message.content)
    session.add(new_message)
    await session.commit()

    await manager.send(
        {
            "type": "message",
            "content": message.content,
            "user_id": current_user.id,
            "room_id": room.id
        },
        room_id=room.id,
        current_user_id=current_user.id
    )

    return {"message": "Message sent successfully", "message_id": new_message.id}

@router.post("/chat_with_bot")
async def chat_with_bot(
    message: MessageSend, 
    current_user: Users = Depends(get_current_user), 
    session=Depends(get_session)
):
    """Send a message to the chatbot and get a response"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    if not message.content or not message.content.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Check if the room exists
    room = (await session.exec(select(Room).where(Room.id == message.room_id))).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    # Check if user is a member of the room
    membership = (await session.exec(
        select(RoomMembership).where(
            RoomMembership.room_id == message.room_id,
            RoomMembership.user_id == current_user.id
        )
    )).first()
    
    if not membership:
        raise HTTPException(status_code=403, detail="You are not a member of this room")

    try:
        # Get recent conversation history for context
        recent_messages = (await session.exec(
            select(Message).where(Message.room_id == message.room_id)
            .order_by(desc(Message.id))  # Use desc function with Message.id
            .limit(20)  # Get last 20 messages for context
        )).all()
        
        # Reverse to get chronological order and prepare for the model
        recent_messages = list(reversed(recent_messages))
        conversation_history = []
        
        # Get bot user ID for comparison
        bot_user = (await session.exec(select(Users).where(Users.username == "chatbot"))).first()
        bot_user_id = bot_user.id if bot_user else None
        
        for msg in recent_messages:
            conversation_history.append({
                "content": msg.content,
                "is_user": msg.user_id != bot_user_id
            })
        
        # Generate chatbot response with conversation history
        bot_response = await chatbot_service.generate_response(
            message.content, 
            conversation_history=conversation_history
        )
        
        # Create and save the user's message
        if current_user.id is None:
            raise HTTPException(status_code=400, detail="Invalid user ID")
            
        user_message = Message(
            room_id=message.room_id, 
            user_id=current_user.id, 
            content=message.content
        )
        session.add(user_message)
        await session.commit()
        
        # Create and save the bot's response
        # First, let's create a bot user if it doesn't exist
        bot_user = (await session.exec(select(Users).where(Users.username == "chatbot"))).first()
        if not bot_user:
            # Create a bot user
            bot_user = Users(
                username="chatbot",
                password_hash="no_password_needed",
                name="ChatBot"
            )
            session.add(bot_user)
            await session.commit()
            await session.refresh(bot_user)
        
        bot_message = Message(
            room_id=message.room_id,
            user_id=bot_user.id or 0,
            content=bot_response
        )
        session.add(bot_message)
        await session.commit()
        
        # Send both messages via websocket
        await manager.send(
            {
                "type": "message",
                "content": message.content,
                "user_id": current_user.id,
                "room_id": message.room_id,
                "username": current_user.username
            },
            room_id=message.room_id,
            current_user_id=current_user.id or 0
        )
        
        await manager.send(
            {
                "type": "message", 
                "content": bot_response,
                "user_id": bot_user.id or 0,
                "room_id": message.room_id,
                "username": "ChatBot"
            },
            room_id=message.room_id,
            current_user_id=0
        )
        
        return {
            "message": "Chat completed successfully",
            "user_message_id": user_message.id,
            "bot_message_id": bot_message.id,
            "bot_response": bot_response
        }
        
    except Exception as e:
        logger.error(f"Error in chat_with_bot: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during chat")


@router.get("/create_bot_room")
async def create_bot_room(
    current_user: Users = Depends(get_current_user),
    session=Depends(get_session)
):
    """Create a private room for chatting with the bot"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # Check if user already has a bot room
    existing_room = (await session.exec(
        select(Room).where(Room.name == f"bot_{current_user.id}")
    )).first()
    
    if existing_room:
        return {
            "room_id": existing_room.id,
            "message": "Bot room already exists"
        }
    
    # Create new bot room
    bot_room = Room(
        name=f"bot_{current_user.id}",
        capacity=2
    )
    session.add(bot_room)
    await session.commit()
    
    # Add user to the room
    membership = RoomMembership(
        room_id=bot_room.id,
        user_id=current_user.id
    )
    session.add(membership)
    await session.commit()
    
    return {
        "room_id": bot_room.id,
        "message": "Bot room created successfully"
    }