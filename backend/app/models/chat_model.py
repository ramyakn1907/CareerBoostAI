from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ChatMessageSchema(BaseModel):
    role: str = Field(..., description="user or assistant")
    content: str = Field(..., description="Message text content")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatRequestSchema(BaseModel):
    message: str = Field(..., description="User prompt message")
    conversation_id: Optional[str] = Field(None, description="Optional active conversation ID")

class ConversationResponse(BaseModel):
    id: str = Field(..., alias="_id")
    user_id: str
    title: str
    messages: List[ChatMessageSchema]
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
