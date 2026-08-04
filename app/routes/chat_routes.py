# =====================================================
# KINGDOM WAYS CHURCH CMS
# CONNECT HUB CHAT ROUTES
# =====================================================

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models import Conversation, ConversationMember, Message, Member

router = APIRouter(prefix="/api/chat", tags=["Chat"])

ONLINE_THRESHOLD_SECONDS = 60


# =====================================================
# REQUEST MODELS
# =====================================================

class MessageCreate(BaseModel):
    conversation_id: int
    member_number: str
    sender_name: str
    text: str


class PrivateConversationCreate(BaseModel):
    sender_number: str
    receiver_number: str


class HeartbeatCreate(BaseModel):
    member_number: str


class MessageEdit(BaseModel):
    member_number: str
    text: str


# =====================================================
# HEARTBEAT (KEEPS MEMBER "ONLINE")
# =====================================================

@router.post("/heartbeat")
def heartbeat(data: HeartbeatCreate, db: Session = Depends(get_db)):
    member = db.query(Member).filter(
        Member.member_number == data.member_number
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )

    member.last_seen = datetime.now(timezone.utc)
    db.commit()

    return {"success": True}



# =====================================================
# GET MEMBER CONVERSATIONS
# =====================================================

@router.get("/conversations/{member_number}")
def get_conversations(member_number: str, db: Session = Depends(get_db)):

    conversations = (
        db.query(Conversation)
        .join(ConversationMember)
        .filter(
            ConversationMember.member_number == member_number
        )
        .order_by(Conversation.last_message_at.desc().nullslast())
        .all()
    )

    cutoff = datetime.now(timezone.utc) - timedelta(
        seconds=ONLINE_THRESHOLD_SECONDS
    )

    result = []

    for conversation in conversations:

        display_name = conversation.name
        other_member_number = None
        other_member_online = False

        # -----------------------------
        # PRIVATE CHAT
        # -----------------------------
        if conversation.type == "private":

            other = (
                db.query(Member)
                .join(
                    ConversationMember,
                    ConversationMember.member_number == Member.member_number
                )
                .filter(
                    ConversationMember.conversation_id == conversation.id,
                    Member.member_number != member_number
                )
                .first()
            )

            if other:

                display_name = other.full_name
                other_member_number = other.member_number

                if other.last_seen:

                    last_seen = other.last_seen

                    if last_seen.tzinfo is None:
                        last_seen = last_seen.replace(
                            tzinfo=timezone.utc
                        )

                    other_member_online = last_seen >= cutoff

        unread_count = (
            db.query(Message)
            .filter(
                Message.conversation_id == conversation.id,
                Message.member_number != member_number,
                Message.deleted == False,
                Message.is_read == False
            )
            .count()
        )

        result.append({

            "id": conversation.id,

            "name": display_name,

            "type": conversation.type,

            "member_number": other_member_number,

            "online": other_member_online,

            "last_message": conversation.last_message or "",

            "last_message_at":
                conversation.last_message_at.isoformat()
                if conversation.last_message_at
                else None,

            "unread_count": unread_count

        })

    return {

        "success": True,

        "conversations": result

    }

# =====================================================
# MARK CONVERSATION AS READ
# =====================================================

@router.put("/conversations/{conversation_id}/read/{member_number}")
def mark_conversation_read(
    conversation_id: int,
    member_number: str,
    db: Session = Depends(get_db)
):
    (
        db.query(Message)
        .filter(
            Message.conversation_id == conversation_id,
            Message.member_number != member_number,
            Message.is_read == False
        )
        .update({"is_read": True}, synchronize_session=False)
    )

    db.commit()

    return {"success": True}


# =====================================================
# GET APPROVED MEMBERS (DIRECTORY)
# Excludes the requesting member themself
# =====================================================

@router.get("/members/{member_number}")
def get_available_members(member_number: str, db: Session = Depends(get_db)):
    members = (
        db.query(Member)
        .filter(
            Member.status == "Approved",
            Member.member_number.isnot(None),
            Member.member_number != member_number
        )
        .order_by(Member.full_name.asc())
        .all()
    )

    cutoff = datetime.now(timezone.utc) - timedelta(seconds=ONLINE_THRESHOLD_SECONDS)

    def is_online(last_seen):
        if not last_seen:
            return False
        if last_seen.tzinfo is None:
            last_seen = last_seen.replace(tzinfo=timezone.utc)
        return last_seen >= cutoff

    return {
        "success": True,
        "members": [
            {
                "member_number": m.member_number,
                "full_name": m.full_name,
                "is_online": is_online(m.last_seen)
            }
            for m in members
        ]
    }


# =====================================================
# CREATE PRIVATE CONVERSATION
# =====================================================

@router.post("/private")
def create_private_conversation(
    data: PrivateConversationCreate,
    db: Session = Depends(get_db)
):
    receiver = db.query(Member).filter(
        Member.member_number == data.receiver_number
    ).first()

    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No member found with number {data.receiver_number}"
        )

    sender_conversation_ids = (
        db.query(ConversationMember.conversation_id)
        .filter(ConversationMember.member_number == data.sender_number)
        .subquery()
    )

    existing = (
        db.query(Conversation)
        .join(ConversationMember)
        .filter(
            Conversation.type == "private",
            Conversation.id.in_(sender_conversation_ids),
            ConversationMember.member_number == data.receiver_number
        )
        .first()
    )

    if existing:
        return {"success": True, "conversation_id": existing.id, "existing": True}

    conv = Conversation(
        type="private",
        created_by=data.sender_number,
        name="Private Chat"
    )
    db.add(conv)
    db.flush()

    db.add(ConversationMember(conversation_id=conv.id, member_number=data.sender_number))
    db.add(ConversationMember(conversation_id=conv.id, member_number=data.receiver_number))

    db.commit()
    return {"success": True, "conversation_id": conv.id, "existing": False}


# =====================================================
# SEND MESSAGE
# =====================================================

@router.post("/messages")
def send_message(data: MessageCreate, db: Session = Depends(get_db)):
    msg = Message(
        conversation_id=data.conversation_id,
        member_number=data.member_number,
        sender_name=data.sender_name,
        message=data.text
    )
    db.add(msg)

    conv = db.query(Conversation).filter(
        Conversation.id == data.conversation_id
    ).first()

    if conv:
        conv.last_message = data.text
        conv.last_message_at = datetime.utcnow()

    db.commit()
    return {"success": True, "message_id": msg.id}


# =====================================================
# GET MESSAGES IN A CONVERSATION
# =====================================================

@router.get("/messages/{conversation_id}")
def get_messages(conversation_id: int, db: Session = Depends(get_db)):
    msgs = (
        db.query(Message)
        .filter(
            Message.conversation_id == conversation_id,
            Message.deleted == False
        )
        .order_by(Message.created_at.asc())
        .all()
    )

    return {
        "success": True,
        "messages": [
            {
                "id": m.id,
                "member_number": m.member_number,
                "sender_name": m.sender_name,
                "message": m.message,
                "edited": m.edited,
                "created_at": m.created_at.isoformat() if m.created_at else None
            }
            for m in msgs
        ]
    }


# =====================================================
# EDIT MESSAGE
# Only the original sender can edit their own message
# =====================================================

@router.put("/messages/{message_id}")
def edit_message(
    message_id: int,
    data: MessageEdit,
    db: Session = Depends(get_db)
):
    message = db.query(Message).filter(Message.id == message_id).first()

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )

    if message.member_number != data.member_number:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own messages"
        )

    if message.deleted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot edit a deleted message"
        )

    message.message = data.text
    message.edited = True

    db.commit()

    return {"success": True}


# =====================================================
# DELETE MESSAGE
# Only the original sender can delete their own message
# Soft delete: message stays in the database
# =====================================================

@router.delete("/messages/{message_id}")
def delete_message(
    message_id: int,
    member_number: str,
    db: Session = Depends(get_db)
):
    message = db.query(Message).filter(Message.id == message_id).first()

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )

    if message.member_number != member_number:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own messages"
        )

    message.deleted = True

    db.commit()

    return {"success": True}