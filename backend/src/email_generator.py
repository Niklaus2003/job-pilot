import os
from dotenv import load_dotenv
from colorama import Fore, Style

# Load env variables (in case candidate details are defined in environment)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dotenv_path = os.path.join(PROJECT_ROOT, ".env")
load_dotenv(dotenv_path)

def count_words(text: str) -> int:
    """
    Counts the number of words in a given text string.
    """
    if not text:
        return 0
    return len(text.strip().split())

def get_personalization_hook(company: str, role: str, personalization_note: str) -> str:
    """
    Extracts the personalization note or generates a warm, professional fallback hook
    if it is missing or empty.
    """
    if personalization_note and str(personalization_note).strip():
        return str(personalization_note).strip()
    
    return f"I have been following {company}'s recent work and technical milestones, and was highly compelled by the focus of your team's engineering efforts."

def generate_email(contact: dict) -> dict:
    """
    Generates a personalized cold email using either a live Groq LLM model
    (if GROQ_API_KEY is configured in the environment) or a standard professional 
    anatomical template fallback.
    """
    api_key = os.getenv("GROQ_API_KEY")
    
    # Check if a valid Groq API key is present
    if api_key and str(api_key).strip() and str(api_key).strip() != "gsk_xxxx":
        try:
            from groq import Groq
            client = Groq(api_key=api_key.strip())
            
            recipient_name = contact.get("recipient_name", "Team Member")
            company = contact.get("company", "your company")
            role = contact.get("role", "Engineering")
            raw_note = contact.get("personalization_note", "")
            
            candidate_name = contact.get("candidate_name") or os.getenv("SENDER_NAME") or "Applicant"
            candidate_background = contact.get("candidate_background") or "Software Engineer"
            portfolio_url = contact.get("portfolio_url") or os.getenv("PORTFOLIO_URL") or ""
            
            prompt = f"""
            Write a highly professional, under-150-word cold email to {recipient_name} 
            who is a recruiter/hiring contact at {company} for the {role} role.
            
            Adhere to these exact rules:
            - Subject: A short, professional, relevant subject line starting with 'Re: ' or 'Question re:'
            - Hook: Use or adapt this personalization detail: '{raw_note}' 
              (If empty or missing, write a polite fallback observing the company's recent work).
            - Intro: Professional greeting using the recipient's first name.
            - Fit Statement: Keep it brief, referencing candidate background: '{candidate_background}'
              and portfolio: '{portfolio_url}'
            - Ask: A single clear request for a brief, low-friction chat.
            - Sign-off: Polite sign-off with candidate name: '{candidate_name}'
            - Word count: The email body must be strictly under 150 words.
            
            Return only the formatted email output. Do not include introductory notes or markdown formatting like ```email.
            """
            
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model="llama-3.3-70b-versatile",  
                temperature=0.7,
                max_tokens=250,
            )
            
            raw_result = chat_completion.choices[0].message.content.strip()
            
            # Parse subject and body
            lines = raw_result.split("\n")
            subject = f"Re: {role} opening at {company}"
            body_lines = []
            
            for line in lines:
                if line.lower().startswith("subject:"):
                    subject = line.split(":", 1)[1].strip()
                else:
                    body_lines.append(line)
            
            body = "\n".join(body_lines).strip()
            word_count = count_words(body)
            is_valid = word_count <= 150
            
            return {
                "subject": subject,
                "body": body,
                "word_count": word_count,
                "is_valid": is_valid,
                "engine": "Groq LLM"
            }
        except Exception as e:
            print(Fore.YELLOW + f"\n[WARNING] Groq API call failed: {str(e)}. Falling back to local template engine." + Style.RESET_ALL)
            
    # Default Rule-based Template Engine (Fallback)
    recipient_name = contact.get("recipient_name", "Team Member")
    company = contact.get("company", "your company")
    role = contact.get("role", "Engineering")
    
    candidate_name = contact.get("candidate_name") or os.getenv("SENDER_NAME") or "Applicant"
    candidate_background = contact.get("candidate_background") or "Software Engineer"
    portfolio_url = contact.get("portfolio_url") or os.getenv("PORTFOLIO_URL") or ""
    
    subject = f"Re: {role} opening at {company}"
    
    raw_note = contact.get("personalization_note", "")
    hook = get_personalization_hook(company, role, raw_note)
    
    intro = f"Hi {recipient_name},"
    
    portfolio_text = f" (visible at {portfolio_url})" if portfolio_url else ""
    value_statement = (
        f"As a {candidate_background.lower() if candidate_background else 'Software Engineer'}, "
        f"I specialize in building clean, automated, and high-performance software. "
        f"I've designed projects showcasing similar skills{portfolio_text}."
    )
    
    ask = f"Are you open to a brief conversation next week to see how my background might support the engineering goals at {company}?"
    sign_off = f"Best regards,\n\n{candidate_name}"
    
    body = f"{intro}\n\n{hook}\n\n{value_statement}\n\n{ask}\n\n{sign_off}"
    word_count = count_words(body)
    is_valid = word_count <= 150
    
    return {
        "subject": subject,
        "body": body,
        "word_count": word_count,
        "is_valid": is_valid,
        "engine": "Local Template"
    }

if __name__ == "__main__":
    print("--- RUNNING EMAIL GENERATOR STANDALONE TEST ---")
    
    test_contact = {
        "recipient_name": "Priya Sharma",
        "company": "Acme AI",
        "role": "Backend Engineering Intern",
        "personalization_note": "I loved your recent engineering article on scaling LLM agents.",
        "candidate_name": "Alex Mercer",
        "candidate_background": "Python developer specializing in microservices and workflow automation",
        "portfolio_url": "https://github.com/alexmercer"
    }
    
    email_data = generate_email(test_contact)
    print(f"Generated via: {email_data['engine']}")
    print(f"Subject: {email_data['subject']}")
    print(f"Word Count: {email_data['word_count']} words (Valid: {email_data['is_valid']})")
    print("-" * 50)
    print(email_data['body'])
    print("-" * 50)
