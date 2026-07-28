from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.services.auth_services import get_current_user
from app.config.database import db
from app.models.chat_model import ChatRequestSchema, ChatMessageSchema, ConversationResponse
from app.ai.chat_assistant import generate_coach_response

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/messages", status_code=status.HTTP_200_OK)
def send_chat_message(request: ChatRequestSchema, current_user: dict = Depends(get_current_user)):
    """Send a message to the AI Career Coach, inject candidate's resume context, and store history."""
    user_id = str(current_user["_id"])
    username = current_user.get("username", "Candidate")
    
    # 1. Fetch user's latest resume analysis for context injection
    latest_analysis = db["analyses"].find_one({"user_id": user_id}, sort=[("uploaded_at", -1)])
    
    # 2. Find or create conversation
    conv_id = request.conversation_id
    conversation = None
    
    if conv_id:
        try:
            conversation = db["conversations"].find_one({"_id": ObjectId(conv_id), "user_id": user_id})
        except Exception:
            conversation = None

    if not conversation:
        # Create new conversation document
        new_conv = {
            "user_id": user_id,
            "title": request.message[:40] + ("..." if len(request.message) > 40 else ""),
            "messages": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        res = db["conversations"].insert_one(new_conv)
        conv_id = str(res.inserted_id)
        conversation = db["conversations"].find_one({"_id": ObjectId(conv_id)})

    # 3. Append user message
    user_msg_doc = {
        "role": "user",
        "content": request.message,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # 4. Generate AI Coach Response
    coach_reply_text = generate_coach_response(user_id, request.message, username, latest_analysis)
    
    assistant_msg_doc = {
        "role": "assistant",
        "content": coach_reply_text,
        "timestamp": datetime.utcnow().isoformat()
    }

    # 5. Push messages into conversation
    db["conversations"].update_one(
        {"_id": ObjectId(conv_id)},
        {
            "$push": {"messages": {"$each": [user_msg_doc, assistant_msg_doc]}},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )

    # 6. Return response
    updated_conv = db["conversations"].find_one({"_id": ObjectId(conv_id)})
    updated_conv["_id"] = str(updated_conv["_id"])
    
    return {
        "conversation_id": conv_id,
        "reply": coach_reply_text,
        "messages": updated_conv["messages"]
    }

@router.get("/conversations")
def get_user_conversations(current_user: dict = Depends(get_current_user)):
    """Retrieve all chat sessions for the logged-in user."""
    user_id = str(current_user["_id"])
    cursor = db["conversations"].find({"user_id": user_id}).sort("updated_at", -1)
    
    conversations = []
    for doc in cursor:
        doc["_id"] = str(doc["_id"])
        conversations.append(doc)
    return conversations

@router.get("/conversations/{conversation_id}")
def get_conversation_by_id(conversation_id: str, current_user: dict = Depends(get_current_user)):
    """Retrieve a single chat session with full message history."""
    user_id = str(current_user["_id"])
    try:
        conv = db["conversations"].find_one({"_id": ObjectId(conversation_id), "user_id": user_id})
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        conv["_id"] = str(conv["_id"])
        return conv
    except Exception:
        raise HTTPException(status_code=404, detail="Conversation not found")

@router.delete("/conversations/{conversation_id}")
def delete_conversation(conversation_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a chat session."""
    user_id = str(current_user["_id"])
    try:
        res = db["conversations"].delete_one({"_id": ObjectId(conversation_id), "user_id": user_id})
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return {"status": "success", "message": "Conversation deleted successfully"}
    except Exception:
        raise HTTPException(status_code=404, detail="Conversation not found")
