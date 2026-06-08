import os
import sys
import json
import uuid
import csv
from datetime import datetime, timezone
from typing import List, Optional, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv, set_key

# Ensure backend root and src directory are in Python path
BACKEND_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.extend([BACKEND_ROOT, os.path.join(BACKEND_ROOT, "src")])

# Load environment variables
dotenv_path = os.path.join(BACKEND_ROOT, ".env")
load_dotenv(dotenv_path)

from scrapers.naukri import NaukriScraper
from scrapers.remoteok import RemoteOKScraper
from scrapers.wellfound import WellfoundScraper
from src.email_generator import generate_email, count_words
from src.email_sender import send_email
from src.logger import log_transaction, is_already_contacted

# Supabase database layer
from supabase_db import (
    load_profile_supabase,
    save_profile_supabase,
    load_pipeline_supabase,
    add_pipeline_card_supabase,
    update_pipeline_card_supabase
)

# Create FastAPI app
app = FastAPI(title="HuntOS API Backend")

# Enable CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SCRAPERS = {
    "remoteok": RemoteOKScraper,
    "naukri": NaukriScraper,
    "wellfound": WellfoundScraper,
}

# DB Files (Jobs remains local temporary file)
JOBS_FILE = os.path.join(BACKEND_ROOT, "data", "jobs.json")

# Pydantic Schemas
class ProfileUpdate(BaseModel):
    name: str
    email: str
    portfolio_url: str
    skills: str
    background: str
    base_resume_text: str
    smtp_host: str
    smtp_port: str
    smtp_user: str
    smtp_password: str
    groq_api_key: str
    dry_run: bool

class ScrapeRequest(BaseModel):
    title: str
    location: Optional[str] = None
    experience: Optional[str] = None
    sources: List[str]
    pages: int

class PromoteRequest(BaseModel):
    title: str
    company: str
    location: str
    salary: str
    url: str
    source: str

class StatusUpdateRequest(BaseModel):
    id: str
    status: str

class CardUpdateRequest(BaseModel):
    id: str
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    url: Optional[str] = None
    status: Optional[str] = None
    match_score: Optional[int] = None
    gap_analysis: Optional[Any] = None
    tailored_resume_text: Optional[str] = None
    tailored_bullets: Optional[List[Any]] = None
    recipient_name: Optional[str] = None
    recipient_email: Optional[str] = None
    personalization_note: Optional[str] = None
    outreach_subject: Optional[str] = None
    outreach_body: Optional[str] = None
    outreach_status: Optional[str] = None
    outreach_error: Optional[str] = None

class SendOutreachRequest(BaseModel):
    id: str
    subject: str
    body: str
    mode: str  # "send" | "draft" | "skip"

# Temporary jobs storage helpers
def load_jobs_data():
    if os.path.exists(JOBS_FILE):
        try:
            with open(JOBS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return []

def save_jobs_data(data):
    os.makedirs(os.path.dirname(JOBS_FILE), exist_ok=True)
    with open(JOBS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

# Endpoints
@app.get("/api/backend/profile")
def get_profile():
    return load_profile_supabase()

@app.post("/api/backend/profile")
def update_profile(profile: ProfileUpdate):
    data = profile.dict()
    save_profile_supabase(data)
    
    # Write to .env file for the local scrapers/email scripts
    os.makedirs(os.path.dirname(dotenv_path), exist_ok=True)
    if not os.path.exists(dotenv_path):
        with open(dotenv_path, "w") as f:
            f.write("")
            
    set_key(dotenv_path, "SENDER_NAME", data["name"])
    set_key(dotenv_path, "SMTP_HOST", data["smtp_host"])
    set_key(dotenv_path, "SMTP_PORT", str(data["smtp_port"]))
    set_key(dotenv_path, "SMTP_USER", data["smtp_user"])
    set_key(dotenv_path, "SMTP_PASSWORD", data["smtp_password"])
    set_key(dotenv_path, "GROQ_API_KEY", data["groq_api_key"])
    set_key(dotenv_path, "PORTFOLIO_URL", data["portfolio_url"])
    set_key(dotenv_path, "DRY_RUN", "true" if data["dry_run"] else "false")
    
    # Reload environment
    load_dotenv(dotenv_path, override=True)
    return {"status": "success", "message": "Profile saved to Supabase and environment updated."}

@app.get("/api/backend/jobs")
def get_jobs():
    return load_jobs_data()

@app.post("/api/backend/scrape")
def scrape_jobs(req: ScrapeRequest):
    all_scraped = []
    errors = []
    
    for source in req.sources:
        if source not in SCRAPERS:
            errors.append(f"Unknown source: {source}")
            continue
            
        scraper_cls = SCRAPERS[source]
        try:
            scraper = scraper_cls(
                job_title=req.title,
                pages=req.pages,
                location=req.location,
                experience=req.experience
            )
            scraped = scraper.scrape()
            all_scraped.extend(scraped)
        except Exception as e:
            errors.append(f"Scraper failed for {source}: {str(e)}")
            
    # Load existing pipeline to flag applied/contacted status
    pipeline = load_pipeline_supabase()
    applied_urls = {card["url"].lower().strip() for card in pipeline if card.get("url")}
    
    # Deduplicate and add metadata
    seen_urls = set()
    cleaned_jobs = []
    for job in all_scraped:
        url = job.get("url", "").lower().strip()
        if not url or url in seen_urls:
            continue
        seen_urls.add(url)
        
        # Add deduplication status flags
        job["is_duplicate"] = url in applied_urls
        cleaned_jobs.append(job)
        
    save_jobs_data(cleaned_jobs)
    
    return {
        "status": "success",
        "jobs_found": len(cleaned_jobs),
        "errors": errors,
        "jobs": cleaned_jobs
    }

@app.get("/api/backend/pipeline")
def get_pipeline():
    return load_pipeline_supabase()

@app.post("/api/backend/promote")
def promote_job(req: PromoteRequest):
    pipeline = load_pipeline_supabase()
    
    # Check if duplicate url
    for card in pipeline:
        if card.get("url", "").lower().strip() == req.url.lower().strip():
            return {"status": "duplicate", "message": "Job is already in pipeline.", "card": card}
            
    new_card = {
        "id": f"card-{uuid.uuid4().hex[:8]}",
        "title": req.title,
        "company": req.company,
        "location": req.location,
        "salary": req.salary,
        "url": req.url,
        "source": req.source,
        "promoted_at": datetime.now(timezone.utc).isoformat(),
        "status": "discovered",
        "match_score": None,
        "gap_analysis": None,
        "tailored_resume_text": None,
        "tailored_bullets": None,
        "recipient_name": "",
        "recipient_email": "",
        "personalization_note": "",
        "outreach_subject": "",
        "outreach_body": "",
        "outreach_status": "pending",
        "outreach_error": ""
    }
    
    success = add_pipeline_card_supabase(new_card)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to save promoted job to Supabase database.")
        
    return {"status": "success", "card": new_card}

@app.post("/api/backend/pipeline/update-status")
def update_status(req: StatusUpdateRequest):
    updated = update_pipeline_card_supabase(req.id, {"status": req.status})
    if not updated:
        raise HTTPException(status_code=404, detail="Job card not found.")
    return {"status": "success"}

@app.post("/api/backend/pipeline/update-card")
def update_card(req: CardUpdateRequest):
    update_data = req.dict(exclude_unset=True)
    card_id = update_data.pop("id")
    updated = update_pipeline_card_supabase(card_id, update_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Job card not found in Supabase.")
    return {"status": "success", "card": updated}

@app.post("/api/backend/outreach/generate")
def generate_outreach(req: StatusUpdateRequest):
    pipeline = load_pipeline_supabase()
    profile = load_profile_supabase()
    
    card = next((c for c in pipeline if c["id"] == req.id), None)
    if not card:
        raise HTTPException(status_code=404, detail="Job card not found.")
        
    # Build personalization inputs
    fit_desc = profile.get("background", "")
    if card.get("match_score"):
        fit_desc += f" (Match Score: {card['match_score']}%)."
        if card.get("gap_analysis") and isinstance(card["gap_analysis"], dict):
            missing_skills = card["gap_analysis"].get("missingSkills", [])
            if missing_skills:
                fit_desc += f" Familiar with matching responsibilities, working around missing skills like {', '.join(missing_skills[:2])} by leveraging transferable expertise."
                
    contact_data = {
        "recipient_name": card.get("recipient_name") or "Team Member",
        "company": card["company"],
        "role": card["title"],
        "recipient_email": card.get("recipient_email") or "",
        "personalization_note": card.get("personalization_note") or "",
        "job_url": card["url"],
        "candidate_name": profile["name"],
        "candidate_background": fit_desc,
        "portfolio_url": profile["portfolio_url"]
    }
    
    try:
        # Temporarily ensure GROQ_API_KEY env is set for generator
        if profile.get("groq_api_key"):
            os.environ["GROQ_API_KEY"] = profile["groq_api_key"]
            
        email_data = generate_email(contact_data)
        
        # Save generated email back to card
        update_data = {
            "outreach_subject": email_data["subject"],
            "outreach_body": email_data["body"]
        }
        if card["status"] == "discovered" or card["status"] == "tailored":
            update_data["status"] = "drafted"
            
        update_pipeline_card_supabase(card["id"], update_data)
        
        return {
            "status": "success",
            "subject": email_data["subject"],
            "body": email_data["body"],
            "engine": email_data["engine"],
            "word_count": email_data["word_count"],
            "is_valid": email_data["is_valid"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@app.post("/api/backend/outreach/send")
def dispatch_outreach(req: SendOutreachRequest):
    pipeline = load_pipeline_supabase()
    profile = load_profile_supabase()
    
    card = next((c for c in pipeline if c["id"] == req.id), None)
    if not card:
        raise HTTPException(status_code=404, detail="Job card not found.")
        
    recipient_email = card.get("recipient_email", "").strip()
    if not recipient_email:
        raise HTTPException(status_code=400, detail="Recipient email must be set on the job card before sending outreach.")
        
    # Ensure env variables are sync'd before executing send
    os.environ["SMTP_USER"] = profile["smtp_user"]
    os.environ["SMTP_PASSWORD"] = profile["smtp_password"]
    os.environ["SMTP_HOST"] = profile["smtp_host"]
    os.environ["SMTP_PORT"] = str(profile["smtp_port"])
    os.environ["DRY_RUN"] = "true" if profile["dry_run"] else "false"
    
    if req.mode == "skip":
        log_transaction(recipient_email, card["company"], card["title"], req.subject, "skipped")
        update_pipeline_card_supabase(card["id"], {
            "outreach_status": "skipped",
            "status": "skipped"
        })
        return {"status": "success", "message": "Email marked as skipped."}
        
    # Dispatch send or draft
    success, msg = send_email(recipient_email, req.subject, req.body, mode=req.mode)
    
    update_data = {}
    if success:
        status_val = "sent" if req.mode == "send" else "drafted"
        log_transaction(recipient_email, card["company"], card["title"], req.subject, status_val)
        update_data["outreach_status"] = status_val
        update_data["status"] = "sent" if req.mode == "send" else "drafted"
        update_data["outreach_error"] = ""
    else:
        log_transaction(recipient_email, card["company"], card["title"], req.subject, "failed", msg)
        update_data["outreach_status"] = "failed"
        update_data["outreach_error"] = msg
        
    update_pipeline_card_supabase(card["id"], update_data)
    
    if not success:
        raise HTTPException(status_code=500, detail=msg)
        
    return {"status": "success", "message": msg}

@app.get("/api/backend/outreach/logs")
def get_outreach_logs():
    log_file = os.path.join(BACKEND_ROOT, "logs", "outreach_log.csv")
    if not os.path.exists(log_file):
        return []
    try:
        logs = []
        with open(log_file, mode="r", newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                logs.append(row)
        return logs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/backend/outreach/clear-logs")
def clear_outreach_logs():
    log_file = os.path.join(BACKEND_ROOT, "logs", "outreach_log.csv")
    if os.path.exists(log_file):
        try:
            os.remove(log_file)
            return {"status": "success"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    return {"status": "success", "message": "No log file found."}
