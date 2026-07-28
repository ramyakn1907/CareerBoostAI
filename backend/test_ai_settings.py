import os
import sys
import time
import unittest
import warnings
import logging
from fastapi.testclient import TestClient

# Suppress deprecation and library warnings during test run
warnings.filterwarnings("ignore")
logging.getLogger("app.config.database").setLevel(logging.CRITICAL)
logging.getLogger("app.ai.gemini_client").setLevel(logging.CRITICAL)

# Ensure app module is in python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.main import app
from app.config.database import db

client = TestClient(app)

class TestAISettingsBackend(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        # Generate a unique username and email for test run
        cls.timestamp = int(time.time())
        cls.username = f"testuser_ai_{cls.timestamp}"
        cls.email = f"test_ai_{cls.timestamp}@careerboost.ai"
        cls.password = "SecretPass123!"
        cls.token = None
        cls.headers = {}
        
        # Admin Account Info
        cls.admin_username = f"admin_ai_{cls.timestamp}"
        cls.admin_email = f"admin_ai_{cls.timestamp}@careerboost.ai"
        cls.admin_token = None
        cls.admin_headers = {}

    @classmethod
    def tearDownClass(cls):
        # Cleanup test user and analyses from database
        try:
            db["users"].delete_many({"username": {"$regex": "^testuser_ai_"}})
            db["users"].delete_many({"username": {"$regex": "^admin_ai_"}})
            db["user_ai_settings"].delete_many({})
            db["user_ai_notifications"].delete_many({})
            db["ai_usage_stats"].delete_many({})
            print("\n[Cleaned up test settings database records]")
        except Exception as e:
            print(f"Cleanup note: {e}")

    def test_01_user_signup_and_login(self):
        """Test signup and retrieval of JWT auth token."""
        # 1. Sign up normal user
        signup_payload = {
            "username": self.username,
            "email": self.email,
            "password": self.password
        }
        res = client.post("/api/auth/signup", json=signup_payload)
        self.assertEqual(res.status_code, 201)
        
        # Login normal user
        login_payload = {
            "username_or_email": self.username,
            "password": self.password
        }
        res = client.post("/api/auth/login", json=login_payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("access_token", data)
        TestAISettingsBackend.token = data["access_token"]
        TestAISettingsBackend.headers = {"Authorization": f"Bearer {TestAISettingsBackend.token}"}
        
        # 2. Sign up admin user (by naming it admin_ai_...)
        admin_signup_payload = {
            "username": self.admin_username,
            "email": self.admin_email,
            "password": self.password
        }
        res = client.post("/api/auth/signup", json=admin_signup_payload)
        self.assertEqual(res.status_code, 201)
        
        # Promote admin_ai_ user to is_admin in MongoDB
        db["users"].update_one({"username": self.admin_username}, {"$set": {"is_admin": True}})
        
        # Login admin user
        admin_login_payload = {
            "username_or_email": self.admin_username,
            "password": self.password
        }
        res = client.post("/api/auth/login", json=admin_login_payload)
        self.assertEqual(res.status_code, 200)
        admin_data = res.json()
        TestAISettingsBackend.admin_token = admin_data["access_token"]
        TestAISettingsBackend.admin_headers = {"Authorization": f"Bearer {TestAISettingsBackend.admin_token}"}

    def test_02_get_default_ai_settings(self):
        """Verify defaults are loaded for a new user settings query."""
        res = client.get("/api/ai-settings", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["preferred_mode"], "shared")
        self.assertEqual(data["selected_model"], "gemini-2.5-flash")
        self.assertEqual(data["has_personal_key"], False)
        self.assertEqual(data["masked_key"], None)

    def test_03_update_preferred_mode(self):
        """Verify update of settings preferred mode field."""
        res = client.put("/api/ai-settings/mode", json={"preferred_mode": "shared"}, headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["preferred_mode"], "shared")
        
        # Switch to invalid mode
        res = client.put("/api/ai-settings/mode", json={"preferred_mode": "invalid"}, headers=self.headers)
        self.assertEqual(res.status_code, 422)  # Validation error format

    def test_04_verify_api_key_validation(self):
        """Verify wrong API Key structures are immediately rejected."""
        # Key must start with AIzaSy
        res = client.post("/api/ai-settings/verify", json={"api_key": "wrong_format_key"}, headers=self.headers)
        self.assertEqual(res.status_code, 400)
        self.assertIn("Key should start with 'AIzaSy'", res.json()["detail"])

    def test_05_update_model(self):
        """Verify validation rules apply to selected model changes."""
        # Try invalid model
        res = client.put("/api/ai-settings/model", json={"selected_model": "unsupported-model-x"}, headers=self.headers)
        self.assertEqual(res.status_code, 400)
        self.assertIn("Selected model is not supported", res.json()["detail"])

    def test_06_admin_analytics_permissions(self):
        """Verify normal users are blocked from admin-stats and admins are allowed."""
        # Normal user query should be forbidden (403)
        res = client.get("/api/ai-settings/admin-stats", headers=self.headers)
        self.assertEqual(res.status_code, 403)
        
        # Admin user query should succeed
        res = client.get("/api/ai-settings/admin-stats", headers=self.admin_headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("total_requests", data)
        self.assertIn("connected_apis", data)

    def test_07_disconnect_and_remove_personal_key(self):
        """Verify key disconnection cleans settings variables."""
        res = client.delete("/api/ai-settings/personal-key", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["has_personal_key"], False)
        self.assertEqual(data["preferred_mode"], "shared")
