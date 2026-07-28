from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime

class UserUpdateAISettings(BaseModel):
    preferred_mode: Optional[Literal["shared", "personal"]] = Field(None, description="'shared' or 'personal'")
    selected_model: Optional[str] = Field(None, description="Preferred Gemini model name")

class ConnectAPIRequest(BaseModel):
    api_key: str = Field(..., description="Personal Google Gemini API Key")

class PreferredModeRequest(BaseModel):
    preferred_mode: Literal["shared", "personal"] = Field(..., description="'shared' or 'personal'")

class AISettingsResponse(BaseModel):
    provider: str
    preferred_mode: str
    selected_model: str
    available_models: List[str]
    status: str
    latency: int
    last_verified: Optional[datetime] = None
    has_personal_key: bool
    masked_key: Optional[str] = None
