import os
import httpx

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("[DATABASE] WARNING: SUPABASE_URL or SUPABASE_SERVICE_KEY is missing from the environment variables!")


def get_headers():
    return {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

def load_profile_supabase() -> dict:
    url = f"{SUPABASE_URL}/rest/v1/profiles?id=eq.default"
    try:
        with httpx.Client(timeout=15.0) as client:
            res = client.get(url, headers=get_headers())
            if res.status_code == 200:
                data = res.json()
                if data:
                    # Clean response from db metadata
                    profile = data[0]
                    profile.pop("updated_at", None)
                    return profile
    except Exception as e:
        print("[DATABASE] Error loading profile from Supabase:", e)
    return {
        "name": "",
        "email": "",
        "portfolio_url": "",
        "skills": "",
        "background": "",
        "base_resume_text": "",
        "smtp_host": "smtp.gmail.com",
        "smtp_port": "587",
        "smtp_user": "",
        "smtp_password": "",
        "groq_api_key": "",
        "dry_run": True
    }

def save_profile_supabase(data: dict):
    url = f"{SUPABASE_URL}/rest/v1/profiles?id=eq.default"
    data["id"] = "default"
    try:
        with httpx.Client(timeout=15.0) as client:
            # Try patching first
            res = client.patch(url, headers=get_headers(), json=data)
            if res.status_code not in (200, 204) or (res.status_code == 200 and not res.json()):
                # If patch returned empty list or failed, insert it
                client.post(f"{SUPABASE_URL}/rest/v1/profiles", headers=get_headers(), json=data)
    except Exception as e:
        print("[DATABASE] Error saving profile to Supabase:", e)

def load_pipeline_supabase() -> list:
    url = f"{SUPABASE_URL}/rest/v1/pipeline_cards?order=promoted_at.desc"
    try:
        with httpx.Client(timeout=15.0) as client:
            res = client.get(url, headers=get_headers())
            if res.status_code == 200:
                return res.json()
    except Exception as e:
        print("[DATABASE] Error loading pipeline from Supabase:", e)
    return []

def add_pipeline_card_supabase(card: dict) -> bool:
    url = f"{SUPABASE_URL}/rest/v1/pipeline_cards"
    try:
        with httpx.Client(timeout=15.0) as client:
            res = client.post(url, headers=get_headers(), json=card)
            return res.status_code in (200, 201)
    except Exception as e:
        print("[DATABASE] Error adding pipeline card:", e)
    return False

def update_pipeline_card_supabase(card_id: str, update_data: dict) -> dict:
    url = f"{SUPABASE_URL}/rest/v1/pipeline_cards?id=eq.{card_id}"
    try:
        with httpx.Client(timeout=15.0) as client:
            res = client.patch(url, headers=get_headers(), json=update_data)
            if res.status_code == 200:
                data = res.json()
                if data:
                    return data[0]
    except Exception as e:
        print("[DATABASE] Error updating pipeline card:", e)
    return {}
