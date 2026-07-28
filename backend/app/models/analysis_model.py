from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class CategoryScore(BaseModel):
    formatting_score: int = Field(85, description="Score for layout, typography, and section headers")
    keyword_match_score: int = Field(82, description="Score for industry term matching")
    skills_score: int = Field(88, description="Score for technical and domain skill breadth")
    experience_score: int = Field(80, description="Score for work history and project impact")
    education_score: int = Field(90, description="Score for academic background and achievements")
    project_score: int = Field(87, description="Score for technical project depth and quality")

class CategorizedSkills(BaseModel):
    programming_languages: List[str] = Field(default_factory=list)
    frontend: List[str] = Field(default_factory=list)
    backend: List[str] = Field(default_factory=list)
    database: List[str] = Field(default_factory=list)
    cloud: List[str] = Field(default_factory=list)
    devops: List[str] = Field(default_factory=list)
    ai: List[str] = Field(default_factory=list)
    soft_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)

class KeywordAnalysis(BaseModel):
    matched_keywords: List[str] = Field(default_factory=list)
    missing_keywords: List[str] = Field(default_factory=list)
    recommended_keywords: List[str] = Field(default_factory=list)

class ActionSuggestion(BaseModel):
    title: str = Field(..., description="Short action item title")
    priority: str = Field(..., description="High Priority, Medium Priority, or Low Priority")
    category: str = Field(..., description="Category e.g. Technical Skills, Formatting, Impact, Keywords")
    impact: str = Field(..., description="Estimated ATS boost e.g. +12 ATS, +8 ATS")
    description: str = Field(..., description="Actionable recommendation explanation")

class ResumeAnalysisSchema(BaseModel):
    ats_score: int = Field(..., description="ATS score from 0 to 100 based on modern recruitment standards")
    summary: str = Field(..., description="A professional summary of the candidate's profile based on the resume")
    strengths: List[str] = Field(..., description="List of key strengths found in the resume")
    weaknesses: List[str] = Field(..., description="List of areas of improvement or weaknesses")
    missing_skills: List[str] = Field(..., description="List of skills that are standard for this profile but missing")
    grammar_suggestions: List[str] = Field(..., description="Suggestions for grammatical, spelling, or stylistic improvements")
    improvement_tips: List[str] = Field(..., description="Actionable tips to improve the resume content, formatting, or impact")
    missing_keywords: List[str] = Field(..., description="List of industry-standard keywords missing from the resume")
    overall_rating: str = Field(..., description="Overall rating of the resume (e.g. Excellent, Good, Average, Needs Revision)")
    
    category_scores: Optional[CategoryScore] = Field(default_factory=CategoryScore)
    categorized_skills: Optional[CategorizedSkills] = Field(default_factory=CategorizedSkills)
    keyword_analysis: Optional[KeywordAnalysis] = Field(default_factory=KeywordAnalysis)
    action_suggestions: Optional[List[ActionSuggestion]] = Field(default_factory=list)

class AnalysisResponse(BaseModel):
    id: str = Field(..., alias="_id", description="MongoDB record ID as string")
    filename: str
    uploaded_at: datetime
    ats_score: int
    overall_rating: str

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class AnalysisDetailResponse(BaseModel):
    id: str = Field(..., alias="_id", description="MongoDB record ID as string")
    filename: str
    uploaded_at: datetime
    extracted_text: str
    analysis_details: ResumeAnalysisSchema

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

