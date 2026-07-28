# 🚀 CareerBoost AI

> **An AI-powered career development platform that helps students and professionals optimize their resumes, improve ATS scores, prepare for interviews, and receive personalized career guidance through an intelligent AI career coach.**

---

# 📌 Overview

CareerBoost AI is a full-stack web application built to simplify career preparation using Artificial Intelligence. It combines resume analysis, ATS optimization, interview preparation, personalized career coaching, and secure AI integration into a single platform.

Unlike a generic chatbot, CareerBoost AI acts as a **professional AI Career Coach**, providing personalized guidance based on the user's resume, skills, education, and career goals.

---

# ✨ Key Features

## 🔐 Authentication & Security

- Secure User Registration and Login
- JWT Authentication
- Password Hashing
- Protected Routes
- User Profile Management

---

## 📄 Resume Analysis

- Upload PDF Resume
- AI-powered Resume Analysis
- ATS Compatibility Score
- Resume Strength Evaluation
- Missing Skills Detection
- Keyword Suggestions
- Personalized Resume Improvement Tips

---

## 🤖 AI Career Coach

CareerBoost AI provides an intelligent career assistant capable of:

- Personalized Career Guidance
- Resume Improvement Suggestions
- ATS Optimization Advice
- Technical & HR Interview Preparation
- Learning Roadmaps
- Skill Recommendations
- Career Planning
- Project Recommendations
- Technology Explanations
- Professional Career Mentoring

The assistant responds naturally like an experienced career mentor rather than a traditional chatbot.

---

## ⚙️ AI Provider Management

Users can choose between:

- Shared Gemini API
- Personal Gemini API

Features include:

- API Key Verification
- Secure API Key Encryption
- Dynamic Model Detection
- AI Health Monitoring
- Latency Testing
- Model Selection
- API Status Monitoring

---

## 📧 Email Notifications

Automatic email notifications are sent for:

- Welcome Email after Registration
- Successful Login Detection
- API Key Added
- API Key Removed
- Security Notifications

---

## 📊 Dashboard

- Resume History
- Analysis Reports
- User Profile
- AI Settings
- Career Assistant
- Account Settings

---

# 🛡 Security

CareerBoost AI follows secure development practices.

- JWT Authentication
- Password Hashing
- Encrypted Gemini API Keys
- Secure Environment Variables
- Protected Backend APIs
- Gmail SMTP Authentication

---

# 🏗 Tech Stack

## Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- Axios
- Framer Motion

## Backend

- FastAPI
- Python
- Uvicorn
- Pydantic
- JWT Authentication
- Passlib

## Database

- MongoDB Atlas

## Artificial Intelligence

- Google Gemini API

## Email Service

- Gmail SMTP
- FastAPI Background Tasks

## Version Control

- Git
- GitHub

---

# 📂 Project Structure

```
CareerBoostAI
│
├── backend
│   ├── app
│   │   ├── ai
│   │   ├── config
│   │   ├── data
│   │   ├── models
│   │   ├── routers
│   │   ├── services
│   │   ├── templates
│   │   └── utils
│   │
│   ├── requirements.txt
│   └── .env.example
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   ├── context
│   │   ├── layouts
│   │   ├── pages
│   │   └── services
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# 🚀 Getting Started

## Clone the Repository

```bash
git clone https://github.com/ramyakn1907/CarrerBoostAI.git
```

---

## Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt
```

Create a `.env` file:

```env
MONGODB_URL=

DATABASE_NAME=

JWT_SECRET=

GEMINI_API_KEY=

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

SMTP_USERNAME=

SMTP_PASSWORD=

SMTP_FROM=
```

Start the backend server:

```bash
uvicorn app.main:app --reload
```

Backend:

```
http://localhost:8000
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend:

```
http://localhost:5173
```

---

# 🧠 AI Career Coach

CareerBoost AI includes a professional AI Career Coach designed to assist users throughout their career journey.

It can:

- Analyze resumes
- Improve ATS compatibility
- Recommend career paths
- Suggest projects
- Prepare interview questions
- Explain technical concepts
- Recommend certifications
- Build personalized learning roadmaps
- Answer career-related questions using the user's profile as context

The assistant provides conversational, personalized guidance instead of generic responses.

---

# 🌟 Future Enhancements

- AI Mock Interviews
- Resume Builder
- Cover Letter Generator
- LinkedIn Profile Analyzer
- Job Recommendation Engine
- Skill Gap Analysis
- Company-specific Interview Preparation
- AI Voice Career Coach
- Multi-language Support
- Mobile Application
- Admin Analytics Dashboard

---

# 📄 License

This project is intended for educational, learning, and portfolio purposes.

---

# 👩‍💻 Developer

**Ramya K N**

GitHub:
https://github.com/ramyakn1907

---

## ⭐ If you found this project useful, consider giving it a star!
