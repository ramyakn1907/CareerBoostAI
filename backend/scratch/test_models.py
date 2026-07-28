import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
client = genai.Client(api_key=GEMINI_API_KEY)

test_models = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.6-flash", "gemini-2.5-flash", "gemini-3.1-flash-lite"]

for m in test_models:
    try:
        response = client.models.generate_content(
            model=m,
            contents="Ping"
        )
        print(f"SUCCESS with {m}: response = {response.text.strip()}")
    except Exception as e:
        print(f"FAILED with {m}: {type(e).__name__} - {e}")
