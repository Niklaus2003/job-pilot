import os
import csv
from datetime import datetime

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOG_FILE = os.path.join(PROJECT_ROOT, "logs", "outreach_log.csv")
HEADERS = ["Timestamp", "RecipientEmail", "Company", "Role", "Subject", "Status", "ErrorMessage"]

def init_log_file():
    """
    Initializes the outreach_log.csv file with the correct headers if it does not exist.
    """
    log_dir = os.path.dirname(LOG_FILE)
    if log_dir:
        os.makedirs(log_dir, exist_ok=True)
        
    if not os.path.exists(LOG_FILE):
        with open(LOG_FILE, mode="w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(HEADERS)

def log_transaction(recipient_email: str, company: str, role: str, subject: str, status: str, error_message: str = ""):
    """
    Appends a new outreach transaction record to the outreach_log.csv audit trail.
    """
    init_log_file()
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    recipient_email = recipient_email.strip()
    status = status.strip().lower()
    
    with open(LOG_FILE, mode="a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            timestamp,
            recipient_email,
            company.strip(),
            role.strip(),
            subject.strip(),
            status,
            error_message.strip()
        ])

def is_already_contacted(recipient_email: str) -> bool:
    """
    Reads outreach_log.csv and returns True if the recipient has already 
    been contacted (status is 'sent' or 'drafted').
    """
    if not os.path.exists(LOG_FILE):
        return False
        
    target_email = recipient_email.strip().lower()
    
    try:
        with open(LOG_FILE, mode="r", newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                email_in_log = (row.get("RecipientEmail") or "").strip().lower()
                status_in_log = (row.get("Status") or "").strip().lower()
                
                if email_in_log == target_email and status_in_log in ("sent", "drafted"):
                    return True
    except Exception as e:
        print(f"[WARNING] Error reading duplicate logs: {str(e)}")
        
    return False
