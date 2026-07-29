# 🚀 CareerBoost AI

<div align="center">

### AI-Powered Career Development Platform

Helping students and professionals optimize resumes, improve ATS scores, and receive personalized career guidance through an intelligent AI Career Coach.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Visit-success?style=for-the-badge)](https://career-boost-ai-snowy.vercel.app)
[![Backend API](https://img.shields.io/badge/⚡_Backend-Render-blue?style=for-the-badge)](https://careerboostai.onrender.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)]
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)]
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)]
[![Google Gemini](https://img.shields.io/badge/Google-Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)]

</div>

---

# 📌 Overview

CareerBoost AI is a modern full-stack web application that helps users build stronger resumes, improve ATS compatibility, receive personalized career guidance, and prepare for interviews using Google Gemini AI.

Unlike a generic chatbot, CareerBoost AI understands the user's resume and provides contextual career guidance tailored to their skills, education, and professional goals.

---

# ✨ Features

## 🔐 Authentication

- Secure User Registration & Login
- JWT Authentication
- Password Hashing
- Protected Routes
- User Profile Management

---

## 📄 Resume Analysis

- Upload PDF Resume
- AI Resume Analysis
- ATS Score Generation
- Resume Strength Evaluation
- Missing Skills Detection
- Resume Improvement Suggestions
- Keyword Recommendations

---

## 🤖 AI Career Coach

The AI Career Coach provides personalized guidance including:

- Career Advice
- Resume Review
- ATS Optimization
- Interview Preparation
- Learning Roadmaps
- Technology Explanations
- Skill Recommendations
- Career Planning
- Project Suggestions
- Certification Recommendations

Responses are conversational, professional, and personalized using the user's resume context.

---

## ⚙️ AI Provider Settings

Users can choose between:

- Shared Gemini API
- Personal Gemini API

Features:

- API Key Verification
- Encrypted API Storage
- Dynamic Model Detection
- AI Health Check
- Latency Monitoring
- Model Selection
- Connection Status

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

CareerBoost AI follows modern security practices.

- JWT Authentication
- Password Hashing (bcrypt)
- Encrypted Personal API Keys
- Secure Environment Variables
- Protected Backend APIs

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
- Passlib
- JWT Authentication

## Database

- MongoDB Atlas

## AI

- Google Gemini API

## Deployment

- Vercel
- Render

## Version Control

- Git
- GitHub

---

# 📂 Project Structure

```text
CareerBoostAI
│
├── backend
│   ├── app
│   │   ├── ai
│   │   ├── config
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

# 🚀 Live Demo

### Frontend

https://career-boost-ai-snowy.vercel.app

### Backend API

YOUR_RENDER_BACKEND_URL

---

# ⚙️ Installation

## Clone Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

---

## Backend

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Create a `.env` file:

```env
MONGODB_URL=

DATABASE_NAME=

JWT_SECRET=

GEMINI_API_KEY=
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 💡 AI Career Coach

The AI Career Coach understands the uploaded resume and provides personalized responses based on the user's background.

It can:

- Improve resumes
- Explain technologies
- Recommend projects
- Suggest certifications
- Prepare interview questions
- Create learning roadmaps
- Recommend career paths
- Answer career-related questions

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
- Mobile Application
- Multi-language Support

---

# 📄 License

This project is developed for educational, learning, and portfolio purposes.

---

# 👩‍💻 Developer

**Ramya K N**

GitHub: https://github.com/ramyakn1907

LinkedIn: *(Add your LinkedIn profile here)*

---

<div align="center">

### ⭐ If you like this project, consider giving it a Star!

Made with ❤️ using React, FastAPI, MongoDB Atlas & Google Gemini AI.

</div>
