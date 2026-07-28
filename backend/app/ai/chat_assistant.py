import warnings
warnings.filterwarnings("ignore", category=FutureWarning)
import os
import json
import logging
from dotenv import load_dotenv
from google import genai

load_dotenv()
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
IS_MOCK_MODE = not GEMINI_API_KEY or GEMINI_API_KEY in ["your_gemini_api_key_here", "AIzaSy...your_gemini_api_key_here"]

def get_mock_coach_conversation(user_message: str, username: str, latest_analysis: dict = None) -> str:
    """Return realistic mock chatbot responses based on the query to maintain high quality offline mode."""
    msg_lower = user_message.lower()
    
    # Extract ATS score if available in context
    ats_score = 88
    if latest_analysis and "analysis_details" in latest_analysis:
        ats_score = latest_analysis["analysis_details"].get("ats_score", ats_score)

    if "ats" in msg_lower or "score" in msg_lower or "low" in msg_lower or "increase" in msg_lower or "improve" in msg_lower:
        return (
            f"Hi {username}, looking at your profile, your resume has a strong foundation with an {ats_score}% ATS score! "
            "To boost it even higher towards 95%+, I recommend adding containerization skills like Docker and unit testing "
            "frameworks (such as Jest or PyTest). Also, try to quantify the impact of your work on projects like SEMAS, "
            "for example by specifying the percentage of reduction in processing latency. What project details would you like to refine first?"
        )
    elif "cover letter" in msg_lower or "application" in msg_lower:
        return (
            f"Here is a tailored cover letter draft for you, {username}:\n\n"
            f"Dear Hiring Manager,\n\n"
            f"I am writing to express my strong interest in the Software Engineer position. As a Computer Science Engineering student with an 8.56 CGPA and hands-on experience building full-stack web applications, I bring both algorithmic rigor and practical software engineering skills.\n\n"
            f"In my project work, I served as Team Lead for SEMAS (Smart Exam Management and Allocation System), architecting a full-stack platform using React.js, TypeScript, Spring Boot, and MySQL with custom seating allocation algorithms. Additionally, I developed a Mock Test Platform with Python Flask REST APIs and solved 700+ coding problems on LeetCode and SkillRack.\n\n"
            f"I am eager to contribute my full-stack expertise to your software engineering team.\n\n"
            f"Sincerely,\n{username}\n\n"
            f"Feel free to customize this draft with the company's name and position title!"
        )
    elif "interview" in msg_lower or "question" in msg_lower or "mock" in msg_lower or "prep" in msg_lower:
        return (
            f"Great question, {username}! Based on your background leading the SEMAS project and solving 700+ LeetCode problems, "
            "here are a few target interview questions you should prepare for:\n\n"
            "1. **Technical**: Can you walk me through the department-prevention conflicts logic in your SEMAS seating algorithm? What was the time and space complexity?\n"
            "2. **System Design**: Why did you choose MySQL over MongoDB for your Mock Test System, and how did you structure the REST APIs using Flask?\n"
            "3. **Behavioral (STAR)**: Describe a time when you acted as a Team Lead for ROLESYNC and had to resolve a technical disagreement within your team.\n\n"
            "How would you like to structure your answers for these?"
        )
    else:
        return (
            f"Hello {username}! As your AI Career Coach, I'm here to help you optimize your resume, prepare for interviews, "
            "or plan your learning roadmap. You have a solid foundation with React, Spring Boot, Flask, and an excellent 8.56 CGPA. "
            "Ask me anything about how to target top software developer roles or improve your project descriptions!"
        )

def generate_coach_response(user_id: str, user_message: str, username: str, latest_analysis: dict = None) -> str:
    """Generate personalized, context-aware AI career coaching advice as a natural conversational response."""
    if IS_MOCK_MODE:
        return get_mock_coach_conversation(user_message, username, latest_analysis)

    def run_coach(api_key: str, model_name: str) -> str:
        client = genai.Client(api_key=api_key)
        
        # Build context from latest resume analysis
        context_str = ""
        if latest_analysis:
            extracted_text = latest_analysis.get("extracted_text", "")
            if extracted_text:
                context_str = f"Candidate Resume Text:\n{extracted_text[:4000]}\n"
            else:
                details = latest_analysis.get("analysis_details", {})
                context_str = f"Candidate Resume Analysis Summary: {details.get('summary', '')}\nATS Score: {details.get('ats_score', 88)}\n"

        prompt = (
            f"You are a friendly, encouraging, and highly professional AI Career Coach helping a user named {username}.\n"
            "Below is the context about the user's resume and background:\n"
            f"{context_str}\n"
            "Using this background, please answer their question or request in a conversational, helpful, and natural chatbot manner. "
            "Address them directly. Keep your response professional, concise, and focused on helping them succeed in their career. "
            "Do NOT return JSON or structured analysis cards. Respond with plain text and clean markdown formatting (like bullet points or bold text) where appropriate.\n\n"
            f"User's message: {user_message}"
        )
        
        response = client.models.generate_content(
            model=model_name,
            contents=prompt
        )
        if response and response.text:
            return response.text.strip()
        return "I'm sorry, I couldn't generate a response. Please try again."

    from app.services.ai_provider_service import execute_gemini_request
    try:
        return execute_gemini_request(user_id, run_coach)
    except Exception as e:
        logger.error(f"Centralized coach request failed: {e}")
        return get_mock_coach_conversation(user_message, username, latest_analysis)
