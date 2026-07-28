from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, status
from typing import List
from app.services.auth_services import get_current_user, update_user_profile_service
from app.services.resume_service import extract_text_from_pdf, extract_text_from_docx, extract_candidate_profile_from_text
from app.ai.gemini_client import analyze_resume_text, extract_text_with_gemini_vision
from app.services.analysis_service import save_analysis, get_user_analyses, get_analysis_by_id, delete_analysis_by_id
from app.models.analysis_model import AnalysisResponse, AnalysisDetailResponse
from app.models.user_model import UserUpdate
from app.services.email_service import send_email_notification
from app.templates.email_templates import template_resume_analysis_ready, template_ats_improvement

router = APIRouter(prefix="/resumes", tags=["resumes"])

@router.post("/analyze", response_model=AnalysisDetailResponse, status_code=status.HTTP_201_CREATED)
async def analyze_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload a resume (PDF or DOCX), extract text, execute Gemini analysis, auto-update profile, and save the report."""
    filename = file.filename
    content_type = file.content_type
    
    file_ext = filename.split(".")[-1].lower() if "." in filename else ""
    
    try:
        contents = await file.read()
        
        mime = content_type or ("application/pdf" if file_ext == "pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        if file_ext == "pdf" or content_type == "application/pdf":
            extracted_text = extract_text_from_pdf(contents)
        elif file_ext in ["docx", "doc"] or content_type in [
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword"
        ]:
            extracted_text = extract_text_from_docx(contents)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file format. Only PDF and DOCX files are allowed."
            )
            
        # If standard text extraction yields minimal text (e.g., < 50 characters like page number "1"), fall back to OCR
        if len(extracted_text.strip()) < 50:
            ocr_text = extract_text_with_gemini_vision(current_user["_id"], contents, mime_type=mime)
            if len(ocr_text.strip()) > len(extracted_text.strip()):
                extracted_text = ocr_text

        if len(extracted_text.strip()) < 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not extract readable text from the resume. Please ensure the file is not empty or corrupted."
            )

        # Auto-Extract Candidate Profile Details (College, Degree, Grad Year, Role, LinkedIn, GitHub)
        extracted_profile = extract_candidate_profile_from_text(extracted_text)
        if extracted_profile:
            def is_empty(val):
                return val is None or str(val).strip() == ""

            college_val = extracted_profile.get("college") if is_empty(current_user.get("college")) else None
            degree_val = extracted_profile.get("degree") if is_empty(current_user.get("degree")) else None
            grad_year_val = extracted_profile.get("grad_year") if is_empty(current_user.get("grad_year")) else None
            role_val = extracted_profile.get("target_role") if is_empty(current_user.get("target_role")) else None
            linkedin_val = extracted_profile.get("linkedin") if is_empty(current_user.get("linkedin")) else None
            github_val = extracted_profile.get("github") if is_empty(current_user.get("github")) else None

            update_data = UserUpdate(
                college=college_val,
                degree=degree_val,
                grad_year=grad_year_val,
                target_role=role_val,
                linkedin=linkedin_val,
                github=github_val
            )
            # Only trigger update if at least one field can be updated
            if any([update_data.college, update_data.degree, update_data.grad_year, update_data.target_role, update_data.linkedin, update_data.github]):
                try:
                    update_user_profile_service(current_user["_id"], update_data)
                except Exception as pe:
                    print(f"Profile auto-update notice: {pe}")
            
        # Get previous analyses for comparison
        user_history = get_user_analyses(current_user["_id"])
        prev_ats_score = user_history[0]["ats_score"] if user_history else None

        # Run AI resume analysis
        analysis = analyze_resume_text(current_user["_id"], extracted_text)
        
        # Save to database
        saved_doc = save_analysis(current_user["_id"], filename, extracted_text, analysis)
        
        # Dispatch Email Notifications
        user_email = current_user.get("email")
        username = current_user.get("username", "Candidate")
        if user_email:
            report_url = f"http://localhost:5173/report/{saved_doc['_id']}"
            
            # Send Analysis Ready Email
            ready_html = template_resume_analysis_ready(
                username, filename, analysis.ats_score, analysis.overall_rating, report_url
            )
            background_tasks.add_task(send_email_notification, user_email, "Your Resume Analysis is Ready", ready_html)
            
            # If ATS score improved, send milestone email
            if prev_ats_score is not None and analysis.ats_score > prev_ats_score:
                imp_html = template_ats_improvement(
                    username, filename, prev_ats_score, analysis.ats_score, report_url
                )
                background_tasks.add_task(send_email_notification, user_email, "🎉 Congratulations! ATS Score Improved!", imp_html)

        return saved_doc
        
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during resume processing: {str(e)}"
        )

@router.get("/history", response_model=List[AnalysisResponse])
def get_history(current_user: dict = Depends(get_current_user)):
    """Retrieve metadata of all historical analyses generated by the logged-in user."""
    history = get_user_analyses(current_user["_id"])
    return history

@router.get("/history/{analysis_id}", response_model=AnalysisDetailResponse)
def get_report(analysis_id: str, current_user: dict = Depends(get_current_user)):
    """Fetch the full, detailed analysis report matching the given ID."""
    report = get_analysis_by_id(analysis_id, current_user["_id"])
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis report not found."
        )
    return report

@router.delete("/history/{analysis_id}")
def delete_report(analysis_id: str, current_user: dict = Depends(get_current_user)):
    """Delete an analysis report from the user's history."""
    deleted = delete_analysis_by_id(analysis_id, current_user["_id"])
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis report not found."
        )
    return {"status": "success", "message": "Resume report deleted successfully."}
