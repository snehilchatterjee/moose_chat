from fastapi import APIRouter, Depends, status, HTTPException, WebSocket, WebSocketDisconnect
from app.auth.oauth2 import get_current_user, verify_token
import asyncio

from typing import List

router=APIRouter()

# A simple connection manager to keep track of active WebSocket connections
# sample: Dictionary[int, dict[List[WebSocket]]] where the key is the room_id and the value is a dict of WebSocket connections where key will be the user_id
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, dict[int, WebSocket]] = {}

    async def connect(self, room_id: int, user_id: int, websocket: WebSocket):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = {}
        self.active_connections[room_id][user_id] = websocket

    def disconnect(self, room_id: int, user_id: int):
        if room_id in self.active_connections:
            self.active_connections[room_id].pop(user_id, None)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def send(self, message: dict, room_id: int, current_user_id: int):
        if room_id not in self.active_connections:
            return
        disconnected = []
        for user_id, connection in self.active_connections[room_id].items():
            if user_id == current_user_id:
                continue
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(user_id)

        for user_id in disconnected:
            self.disconnect(room_id, user_id)

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    token = websocket.query_params.get("token")
    room_id_str = websocket.query_params.get("room_id")
    
    if not token or not room_id_str:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    try:
        room_id: int = int(room_id_str)
    except ValueError:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    try:
        user = await verify_token(token)
    except Exception as e:
        print(f"[verify_token ERROR] {e}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    if user.id is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(room_id, user.id, websocket)
    try:
        await asyncio.Future()
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(room_id,user.id)