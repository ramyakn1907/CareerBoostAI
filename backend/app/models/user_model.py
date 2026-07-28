from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserSignUp(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Username must be between 3 and 50 characters")
    email: EmailStr = Field(..., description="A valid email address")
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters long")

class UserLogin(BaseModel):
    username_or_email: str = Field(..., description="Username or Email address")
    password: str = Field(..., description="User password")

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    grad_year: Optional[str] = None
    target_role: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    profile_pic: Optional[str] = None

class PasswordChange(BaseModel):
    old_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=6, description="New password")

class UserResponse(BaseModel):
    id: str = Field(..., alias="_id", description="MongoDB User ID as string")
    username: str
    email: str
    college: Optional[str] = ""
    degree: Optional[str] = ""
    grad_year: Optional[str] = ""
    target_role: Optional[str] = ""
    linkedin: Optional[str] = ""
    github: Optional[str] = ""
    profile_pic: Optional[str] = ""
    is_admin: bool = False
    created_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict
