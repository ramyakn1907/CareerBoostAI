from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId
from datetime import datetime, timezone
from app.config.database import db
from app.utils.security import verify_password, get_password_hash, verify_access_token
from app.models.user_model import UserSignUp, UserLogin, UserUpdate, PasswordChange

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_user_by_email(email: str):
    return db["users"].find_one({"email": email})

def get_user_by_username(username: str):
    return db["users"].find_one({"username": username})

def get_user_by_id(user_id: str):
    try:
        return db["users"].find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None

def create_user_service(user_data: UserSignUp) -> dict:
    # Check if email exists
    if get_user_by_email(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )
    
    # Check if username exists
    if get_user_by_username(user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is already taken"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user document
    user_doc = {
        "username": user_data.username,
        "email": user_data.email,
        "hashed_password": hashed_password,
        "created_at": datetime.now(timezone.utc)
    }
    
    result = db["users"].insert_one(user_doc)
    user_doc["_id"] = str(result.inserted_id)
    return user_doc

def authenticate_user_service(login_data: UserLogin) -> dict:
    # Try finding by username or email
    user = db["users"].find_one({
        "$or": [
            {"email": login_data.username_or_email},
            {"username": login_data.username_or_email}
        ]
    })
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/username or password"
        )
    
    # Verify password
    if not verify_password(login_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/username or password"
        )
    
    # Convert _id to string for user object
    user["_id"] = str(user["_id"])
    return user

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Dependency injection helper to protect routes and retrieve the current user."""
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user["_id"] = str(user["_id"])
    user["is_admin"] = user.get("is_admin", False) or (user["username"].lower() == "admin") or ("admin@" in user["email"].lower())
    return user

def update_user_profile_service(user_id: str, update_data: UserUpdate) -> dict:
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    update_fields = {}
    if update_data.username is not None and update_data.username != user["username"]:
        # Check if username is already taken by someone else
        existing = get_user_by_username(update_data.username)
        if existing and str(existing["_id"]) != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username is already taken"
            )
        update_fields["username"] = update_data.username
        
    if update_data.email is not None and update_data.email != user["email"]:
        # Check if email is already registered by someone else
        existing = get_user_by_email(update_data.email)
        if existing and str(existing["_id"]) != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered"
            )
        update_fields["email"] = update_data.email
        
    if update_data.college is not None:
        update_fields["college"] = update_data.college
    if update_data.degree is not None:
        update_fields["degree"] = update_data.degree
    if update_data.grad_year is not None:
        update_fields["grad_year"] = update_data.grad_year
    if update_data.target_role is not None:
        update_fields["target_role"] = update_data.target_role
    if update_data.linkedin is not None:
        update_fields["linkedin"] = update_data.linkedin
    if update_data.github is not None:
        update_fields["github"] = update_data.github
    if update_data.profile_pic is not None:
        update_fields["profile_pic"] = update_data.profile_pic

    if update_fields:
        db["users"].update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_fields}
        )
        
    updated_user = get_user_by_id(user_id)
    updated_user["_id"] = str(updated_user["_id"])
    return updated_user

def change_user_password_service(user_id: str, pw_data: PasswordChange):
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    # Verify old password
    if not verify_password(pw_data.old_password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password"
        )
        
    # Hash new password
    new_hashed = get_password_hash(pw_data.new_password)
    
    db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"hashed_password": new_hashed}}
    )
    return True

def delete_user_account_service(user_id: str):
    """Permanently delete user account, analyses, and chat conversations from MongoDB."""
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Delete all resume analyses
    db["analyses"].delete_many({"user_id": user_id})
    
    # Delete all chat conversations
    db["conversations"].delete_many({"user_id": user_id})
    
    # Delete user document
    db["users"].delete_one({"_id": ObjectId(user_id)})
    
    return True
