from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from datetime import datetime
from app.models.user_model import UserSignUp, UserLogin, UserResponse, UserUpdate, PasswordChange, Token
from app.services.auth_services import (
    create_user_service,
    authenticate_user_service,
    get_current_user,
    update_user_profile_service,
    change_user_password_service,
    delete_user_account_service
)
from app.utils.security import create_access_token
from app.services.email_service import send_email_notification
from app.templates.email_templates import template_welcome, template_login_notification, template_security_alert

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_data: UserSignUp, background_tasks: BackgroundTasks):
    """Register a new user account and send welcome email."""
    user = create_user_service(user_data)
    date_str = datetime.now().strftime("%B %d, %Y at %I:%M %p")
    welcome_html = template_welcome(user["username"], user["email"], date_str)
    background_tasks.add_task(send_email_notification, user["email"], "🎉 Welcome to CareerBoost AI", welcome_html)
    return user

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, background_tasks: BackgroundTasks):
    """Authenticate credentials, trigger login notification email, and generate JWT token."""
    user = authenticate_user_service(login_data)
    access_token = create_access_token(data={"sub": user["_id"]})
    
    date_str = datetime.now().strftime("%B %d, %Y at %I:%M %p")
    login_html = template_login_notification(user["username"], user["email"], date_str)
    background_tasks.add_task(send_email_notification, user["email"], "🔐 New Login Detected", login_html)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["_id"],
            "username": user["username"],
            "email": user["email"]
        }
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    """Retrieve details of the currently authenticated user."""
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(update_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    """Update username or email for the logged-in user."""
    updated_user = update_user_profile_service(current_user["_id"], update_data)
    return updated_user

@router.put("/change-password")
def change_password(pw_data: PasswordChange, current_user: dict = Depends(get_current_user)):
    """Update password for the logged-in user."""
    change_user_password_service(current_user["_id"], pw_data)
    return {"status": "success", "message": "Password changed successfully"}

@router.delete("/account")
def delete_account(current_user: dict = Depends(get_current_user)):
    """Permanently delete user account and all associated data."""
    delete_user_account_service(current_user["_id"])
    return {"status": "success", "message": "User account permanently deleted"}
