# =====================================================
# CONNECT HUB WEBSOCKET
# Kingdom Ways Church CMS
# =====================================================

from fastapi import (
    APIRouter,
    WebSocket,
    WebSocketDisconnect,
)

from datetime import datetime

from app.database import SessionLocal

from app.models import (
    Member,
    Conversation,
    ConversationMember,
    Message
)

router = APIRouter()

# =====================================================
# ACTIVE CONNECTIONS
# =====================================================

active_connections = {}

# =====================================================
# SEND TO ONE MEMBER
# =====================================================

async def send_to_member(member_number, data):
    socket = active_connections.get(member_number)
    if socket:
        await socket.send_json(data)

# =====================================================
# SEND TO CONVERSATION MEMBERS
# =====================================================

async def broadcast_to_conversation(conversation_id, data, db):
    members = (
        db.query(ConversationMember)
        .filter(ConversationMember.conversation_id == conversation_id)
        .all()
    )
    for member in members:
        await send_to_member(member.member_number, data)

# =====================================================
# CHAT SOCKET
# =====================================================

@router.websocket("/ws/chat/{member_number}")
async def chat_socket(websocket: WebSocket, member_number: str):

    await websocket.accept()

    db = SessionLocal()

    # Verify member exists
    member = db.query(Member).filter(
        Member.member_number == member_number
    ).first()

    if not member:
        await websocket.close()
        db.close()
        return

    # Save connection
    active_connections[member_number] = websocket

    member.online = True
    member.last_seen = datetime.utcnow()
    db.commit()

    # Tell user connected
    await websocket.send_json({
        "type": "connected",
        "message": "Connected successfully"
    })

    # Broadcast online
    await broadcast_online(member_number, True, db)

    try:
        while True:
            data = await websocket.receive_json()
            packet_type = data.get("type")

            if packet_type == "ping":
                await websocket.send_json({"type": "pong"})

            elif packet_type == "message":
                await handle_message(data, member_number, db)

            elif packet_type == "typing":
                await handle_typing(data, member_number, db)

            elif packet_type == "message_read":
                await handle_read(data, member_number, db)

    except WebSocketDisconnect:
        pass

    except Exception as e:
        print(f"WebSocket Error: {e}")

    
    finally:
        active_connections.pop(member_number, None)

        try:
            member = db.query(Member).filter(
                Member.member_number == member_number
            ).first()

            if member:
                member.online = False
                member.last_seen = datetime.utcnow()
                db.commit()
        except:
            pass

        try:
            await broadcast_online(member_number, False, db)
        except:
            pass

        try:
            db.close()
        except:
            pass

# =====================================================
# HANDLE MESSAGE
# =====================================================
async def handle_message(data, sender_number, db):
    try:
        conversation_id = int(data.get("conversation_id", 0))
        text = data.get("message", data.get("text", ""))

        if not conversation_id or not text:
            return

        sender = db.query(Member).filter(
            Member.member_number == sender_number
        ).first()

        if not sender:
            return

        message = Message(
            conversation_id=conversation_id,
            member_number=sender_number,
            sender_name=sender.full_name,
            message=text,
            created_at=datetime.utcnow()
        )

        db.add(message)
        db.flush()

        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id
        ).first()

        if conversation:
            conversation.last_message = text
            conversation.last_message_at = datetime.utcnow()

        db.commit()

        response = {
            "type": "message",
            "id": message.id,
            "conversation_id": conversation_id,
            "member_number": sender_number,
            "sender_name": sender.full_name,
            "message": text,
            "created_at": message.created_at.isoformat()
        }

        await broadcast_to_conversation(conversation_id, response, db)
    except Exception as e:
        print(f"Handle message error: {e}")
        import traceback
        traceback.print_exc()
# =====================================================
# HANDLE TYPING
# =====================================================

async def handle_typing(data, sender_number, db):
    conversation_id = data.get("conversation_id")

    await broadcast_to_conversation(
        conversation_id,
        {
            "type": "typing",
            "sender_number": sender_number,
            "typing": data.get("typing")
        },
        db
    )

# =====================================================
# HANDLE READ
# =====================================================

async def handle_read(data, member_number, db):
    message_id = data.get("message_id")

    message = db.query(Message).filter(Message.id == message_id).first()

    if message:
        message.is_read = True
        message.read_at = datetime.utcnow()
        db.commit()

        await send_to_member(
            message.member_number,
            {
                "type": "message_read",
                "message_id": message_id
            }
        )

# =====================================================
# ONLINE BROADCAST
# =====================================================

async def broadcast_online(member_number, online, db):
    packet = {
        "type": "member_online" if online else "member_offline",
        "member_number": member_number
    }

    for socket in active_connections.values():
        await socket.send_json(packet)