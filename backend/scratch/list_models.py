import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
print("Key:", GEMINI_API_KEY[:10] + "...")

client = genai.Client(api_key=GEMINI_API_KEY)
try:
    models = client.models.list()
    for m in models:
        print("- Name:", m.name)
except Exception as e:
    print("Error listing models:", e)
