from pymongo import MongoClient
from dotenv import load_dotenv
import os
import logging

logger = logging.getLogger(__name__)
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "careerboost_ai")

client = None
db = None

def init_db():
    global client, db
    client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=5000, tlsAllowInvalidCertificates=True)
    client.admin.command("ping")
    db = client[DATABASE_NAME]
    print("=" * 50)
    print("✅ Connected to MongoDB Atlas successfully.")
    print("Database:", DATABASE_NAME)
    print("=" * 50)
    logger.info("Connected to MongoDB Atlas successfully.")

init_db()
