from pypdf import PdfReader
import docx
import io
import re

def extract_text_from_pdf(contents: bytes) -> str:
    """Extract text from PDF file bytes."""
    try:
        pdf_file = io.BytesIO(contents)
        reader = PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text.strip()
    except Exception as e:
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")

def extract_text_from_docx(contents: bytes) -> str:
    """Extract text from DOCX file bytes."""
    try:
        docx_file = io.BytesIO(contents)
        doc = docx.Document(docx_file)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text.strip()
    except Exception as e:
        raise ValueError(f"Failed to extract text from DOCX: {str(e)}")

def extract_candidate_profile_from_text(text: str) -> dict:
    """Extract candidate academic links, college, degree, graduation year, target role, linkedin, github from resume text."""
    if not text:
        return {}

    profile = {}

    # 1. Extract LinkedIn
    linkedin_match = re.search(r'(https?://)?(www\.)?linkedin\.com/in/([a-zA-Z0-9_-]+)', text, re.IGNORECASE)
    if linkedin_match:
        profile['linkedin'] = f"linkedin.com/in/{linkedin_match.group(3)}"

    # 2. Extract GitHub
    github_match = re.search(r'(https?://)?(www\.)?github\.com/([a-zA-Z0-9_-]+)', text, re.IGNORECASE)
    if github_match:
        profile['github'] = f"github.com/{github_match.group(3)}"

    lines = [line.strip() for line in text.splitlines() if line.strip()]

    # 3. Extract College / University
    for line in lines:
        college_match = re.search(r'([A-Z][a-zA-Z0-9\s,&.-]{2,60}(?:Institute|University|College|Academy|Polytechnic|School)[a-zA-Z0-9\s,&.-]*)', line)
        if college_match:
            col_str = college_match.group(1).split(' - ')[0].split(' | ')[0].split('\t')[0].strip(' ,.-')
            if len(col_str) < 80:
                profile['college'] = col_str
                break

    # 4. Extract Degree
    for line in lines:
        degree_match = re.search(r'(B\.E\.|B\.Tech|B\.S\.|M\.E\.|M\.Tech|M\.S\.|Bachelor|Master|Diploma)[A-Za-z0-9\s,.-]*(?:Computer Science|Engineering|Information Technology|Software|Data Science|Electronics|Mechanical)?', line, re.IGNORECASE)
        if degree_match:
            deg_str = degree_match.group(0).split(' - ')[0].split(' | ')[0].split(' 202')[0].split(' 203')[0].strip(' ,.-')
            if len(deg_str) < 80:
                profile['degree'] = deg_str
                break

    # 5. Extract Graduation Year
    grad_match = re.search(r'(?:Graduation|Expected|Batch|Passout|Passed|Year|CGPA|202[0-9]|203[0-5])?.*?(\b202[0-9]\b|\b203[0-5]\b)', text, re.IGNORECASE)
    if grad_match:
        profile['grad_year'] = grad_match.group(1)

    # 6. Extract Target Role
    role_match = re.search(r'(Software Engineer|Full-Stack Developer|Frontend Developer|Backend Developer|Python Developer|Java Developer|Data Analyst|DevOps Engineer|Cloud Engineer|System Engineer)', text, re.IGNORECASE)
    if role_match:
        profile['target_role'] = role_match.group(1).title()

    return profile
