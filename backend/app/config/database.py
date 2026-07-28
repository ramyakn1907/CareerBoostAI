from pymongo import MongoClient
from dotenv import load_dotenv
import os
import json
import logging
from bson import json_util

logger = logging.getLogger(__name__)
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "careerboost_ai")

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
LOCAL_DB_FILE = os.path.join(DATA_DIR, "local_db.json")

client = None
db = None

class PersistentCollection:
    def __init__(self, raw_coll, save_callback):
        self._coll = raw_coll
        self._save = save_callback

    def insert_one(self, *args, **kwargs):
        res = self._coll.insert_one(*args, **kwargs)
        self._save()
        return res

    def insert_many(self, *args, **kwargs):
        res = self._coll.insert_many(*args, **kwargs)
        self._save()
        return res

    def update_one(self, *args, **kwargs):
        res = self._coll.update_one(*args, **kwargs)
        self._save()
        return res

    def update_many(self, *args, **kwargs):
        res = self._coll.update_many(*args, **kwargs)
        self._save()
        return res

    def replace_one(self, *args, **kwargs):
        res = self._coll.replace_one(*args, **kwargs)
        self._save()
        return res

    def delete_one(self, *args, **kwargs):
        res = self._coll.delete_one(*args, **kwargs)
        self._save()
        return res

    def delete_many(self, *args, **kwargs):
        res = self._coll.delete_many(*args, **kwargs)
        self._save()
        return res

    def drop(self, *args, **kwargs):
        res = self._coll.drop(*args, **kwargs)
        self._save()
        return res

    def __getattr__(self, name):
        return getattr(self._coll, name)

class PersistentMongomockDatabase:
    def __init__(self, raw_db, filepath):
        self._db = raw_db
        self._filepath = filepath
        self._load_from_disk()

    def _load_from_disk(self):
        if os.path.exists(self._filepath):
            try:
                with open(self._filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                for coll_name, docs in data.items():
                    decoded_docs = [json_util.loads(json.dumps(doc)) for doc in docs]
                    if decoded_docs:
                        self._db[coll_name].insert_many(decoded_docs)
                logger.info(f"Loaded persistent mock data from {self._filepath}")
            except Exception as e:
                logger.error(f"Error loading persistent mock DB: {e}")

    def _save_to_disk(self):
        try:
            os.makedirs(os.path.dirname(self._filepath), exist_ok=True)
            data = {}
            for coll_name in self._db.list_collection_names():
                docs = list(self._db[coll_name].find())
                data[coll_name] = json.loads(json_util.dumps(docs))
            with open(self._filepath, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving persistent mock DB: {e}")

    def __getitem__(self, coll_name):
        return PersistentCollection(self._db[coll_name], self._save_to_disk)

    def __getattr__(self, name):
        if name.startswith("_"):
            raise AttributeError(name)
        return self[name]

def init_db():
    global client, db
    try:
        if MONGODB_URL.startswith("mongodb+srv://") or MONGODB_URL.startswith("mongodb://"):
            client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=4000, tlsAllowInvalidCertificates=True)
        else:
            client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=4000)
        
        # Verify connection
        client.admin.command("ping")
        db = client[DATABASE_NAME]
        print("=" * 50)
        print("MongoDB Connected Successfully")
        print("Database:", DATABASE_NAME)
        print("Mongo URL:", MONGODB_URL)
        print("=" * 50)
        logger.info("Connected to MongoDB successfully.")
    except Exception:
        logger.info("Primary MongoDB connection unavailable. Active engine: Persistent Local Storage.")
        try:
            import mongomock
            client = mongomock.MongoClient()
            raw_db = client[DATABASE_NAME]
            db = PersistentMongomockDatabase(raw_db, LOCAL_DB_FILE)
        except Exception:
            # Fallback to local MongoDB
            client = MongoClient("mongodb://127.0.0.1:27017", serverSelectionTimeoutMS=2000)
            db = client[DATABASE_NAME]

init_db()

