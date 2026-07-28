from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.database import client
from app.routers import auth, resumes, chat, email_router, ai_settings_router

app = FastAPI(title="CareerBoost AI API", version="1.0.0")

# Setup CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace with specific domains (e.g. frontend domain)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api")
app.include_router(resumes.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(email_router.router, prefix="/api")
app.include_router(ai_settings_router.router, prefix="/api")

@app.get("/")
def home():
    return {
        "message": "Welcome to CareerBoost AI 🚀",
        "docs": "/docs"
    }

from app.config.database import db, client

@app.get("/test-db")
def test_db():
    try:
        client.admin.command("ping")

        users = list(db["users"].find())

        return {
            "status": "success",
            "database": "careerboost_ai",
            "total_users": len(users),
            "emails": [u.get("email") for u in users]
        }

    except Exception as e:
        return {
            "status": "failed",
            "error": str(e)
        }