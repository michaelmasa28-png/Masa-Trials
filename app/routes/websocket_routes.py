import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
from datetime import datetime, timezone

from app.database import SessionLocal
from app.models import Message, Conversation

logger = logging.getLogger(__name__)

router = APIRouter()

active_connections = {}

@router.websocket("/ws/chat/{member_number}")
async def websocket_endpoint(websocket: WebSocket, member_number: str):
    await websocket.accept()
    
    if member_number not in active_connections:
        active_connections[member_number] = []
    active_connections[member_number].append(websocket)
    
    logger.debug("WS connected: %s", member_number)
    
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            if message_data.get("type") == "message":
                db = SessionLocal()
                
                msg = Message(
                    conversation_id=message_data["conversation_id"],
                    member_number=member_number,
                    sender_name=message_data.get("sender_name", member_number),
                    message=message_data["text"]
                )
                db.add(msg)
                
                conv = db.query(Conversation).filter(
                    Conversation.id == message_data["conversation_id"]
                ).first()
                if conv:
                    conv.last_message = message_data["text"]
                    conv.last_message_at = datetime.now(timezone.utc)
                
                db.commit()

                # Find all members in this conversation
                from app.models import ConversationMember
                members = db.query(ConversationMember).filter(
                    ConversationMember.conversation_id == message_data["conversation_id"]
                ).all()
                db.close()

                # Broadcast to all connected conversation members
                payload = json.dumps({
                    "type": "new_message",
                    "conversation_id": message_data["conversation_id"],
                    "message": message_data["text"]
                })

                for member in members:
                    for conn in active_connections.get(member.member_number, []):
                        try:
                            await conn.send_text(payload)
                        except:
                            pass
                
    except WebSocketDisconnect:
        active_connections[member_number].remove(websocket)
        if not active_connections[member_number]:
            del active_connections[member_number]
        logger.debug("WS disconnected: %s", member_number)