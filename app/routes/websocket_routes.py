import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
from datetime import datetime, timezone
from contextlib import contextmanager

from app.database import SessionLocal
from app.models import Message, Conversation

logger = logging.getLogger(__name__)

router = APIRouter()

active_connections = {}


@contextmanager
def _session():
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


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
                conv_members = []
                with _session() as db:
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

                    # Find all members in this conversation
                    from app.models import ConversationMember
                    rows = db.query(ConversationMember).filter(
                        ConversationMember.conversation_id == message_data["conversation_id"]
                    ).all()
                    conv_members = [r.member_number for r in rows]

                # Broadcast to all connected conversation members
                payload = json.dumps({
                    "type": "new_message",
                    "conversation_id": message_data["conversation_id"],
                    "message": message_data["text"]
                })

                for member_number_id in conv_members:
                    for conn in active_connections.get(member_number_id, []):
                        try:
                            await conn.send_text(payload)
                        except Exception:
                            pass

    except WebSocketDisconnect:
        try:
            active_connections[member_number].remove(websocket)
            if not active_connections[member_number]:
                del active_connections[member_number]
        except (KeyError, ValueError):
            pass
        logger.debug("WS disconnected: %s", member_number)