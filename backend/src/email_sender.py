import os
import smtplib
import socket
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv
from colorama import Fore, Style, init

# Initialize colorama
init(autoreset=True)

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dotenv_path = os.path.join(PROJECT_ROOT, ".env")

# Load environment variables
load_dotenv(dotenv_path)

def print_smtp_handshake_simulator(sender: str, recipient: str, subject: str, body: str, is_draft: bool = False):
    """
    Prints a detailed, colorized mockup of an SMTP transaction or draft envelope.
    This simulates standard mail network handshakes locally for offline safety.
    """
    mode_name = "SMTP DRAFT SIMULATION" if is_draft else "SMTP TRANSACTION SIMULATION"
    border_color = Fore.CYAN if is_draft else Fore.GREEN
    
    print(border_color + "=" * 65)
    print(border_color + f" {mode_name} (DRY_RUN=true) ")
    print(border_color + "=" * 65)
    
    if not is_draft:
        print(f"{Fore.YELLOW}>>> CONNECT TO smtp.gmail.com:587...{Style.RESET_ALL} OK")
        print(f"{Fore.YELLOW}>>> EHLO candidate-workspace...{Style.RESET_ALL} 250-smtp.gmail.com at your service")
        print(f"{Fore.YELLOW}>>> STARTTLS...{Style.RESET_ALL} 220 2.0.0 Ready to start TLS")
        print(f"{Fore.YELLOW}>>> AUTH LOGIN...{Style.RESET_ALL} 334 VXNlcm5hbWU6")
        print(f"{Fore.YELLOW}>>> [CREDENTIALS SENT]...{Style.RESET_ALL} 235 2.7.0 Authentication successful")
        print(f"{Fore.YELLOW}>>> MAIL FROM:<{sender}>...{Style.RESET_ALL} 250 2.1.0 OK")
        print(f"{Fore.YELLOW}>>> RCPT TO:<{recipient}>...{Style.RESET_ALL} 250 2.1.5 OK")
        print(f"{Fore.YELLOW}>>> DATA...{Style.RESET_ALL} 354 Go ahead")
    else:
        print(f"{Fore.YELLOW}>>> INITIALIZE LOCAL DRAFT GENERATOR...{Style.RESET_ALL} OK")
        print(f"{Fore.YELLOW}>>> COMPILING MAIL ENVELOPE...{Style.RESET_ALL} OK")
        
    print(border_color + "-" * 65)
    print(f"{Fore.MAGENTA}FROM:    {Style.RESET_ALL}{sender}")
    print(f"{Fore.MAGENTA}TO:      {Style.RESET_ALL}{recipient}")
    print(f"{Fore.MAGENTA}SUBJECT: {Style.RESET_ALL}{subject}")
    print(border_color + "-" * 65)
    print(body)
    print(border_color + "-" * 65)
    
    if not is_draft:
        print(f"{Fore.YELLOW}>>> . (End of message)...{Style.RESET_ALL} 250 2.0.0 OK (Queued for delivery)")
        print(f"{Fore.YELLOW}>>> QUIT...{Style.RESET_ALL} 221 2.0.0 closing connection")
        print(Fore.GREEN + "[SUCCESS] Simulated email transmission successfully completed." + Style.RESET_ALL)
    else:
        print(Fore.CYAN + "[SUCCESS] Simulated draft payload compiled and logged successfully." + Style.RESET_ALL)
        
    print(border_color + "=" * 65 + "\n")

def save_local_draft(sender: str, recipient: str, subject: str, body: str) -> str:
    """
    Saves the drafted email to a local 'drafts' folder as a standard .eml file.
    This allows students to open it in native clients (Outlook/Apple Mail) offline.
    """
    drafts_dir = os.path.join(PROJECT_ROOT, "drafts")
    os.makedirs(drafts_dir, exist_ok=True)
    
    # Generate clean file name from recipient
    safe_recipient = recipient.replace("@", "_").replace(".", "_")
    filepath = os.path.join(drafts_dir, f"draft_{safe_recipient}.eml")
    
    msg = MIMEMultipart()
    msg["From"] = sender
    msg["To"] = recipient
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(msg.as_string())
        
    return filepath

def send_email(recipient_email: str, subject: str, body: str, mode: str = "send") -> tuple:
    """
    Handles email sending or draft generation using local simulation (DRY_RUN=true)
    or live networking (DRY_RUN=false).
    
    Returns (success: bool, status_message: str)
    """
    dry_run = os.getenv("DRY_RUN", "true").lower() == "true"
    sender_email = os.getenv("SMTP_USER", "candidate_email@gmail.com")
    
    if dry_run:
        is_draft = (mode == "draft")
        print_smtp_handshake_simulator(sender_email, recipient_email, subject, body, is_draft=is_draft)
        
        # If simulated draft, let's also write a local .eml so they have a concrete file to check
        if is_draft:
            filepath = save_local_draft(sender_email, recipient_email, subject, body)
            return True, f"Simulated draft (saved locally to {filepath})"
            
        return True, "Simulated successful delivery."
    
    # Live Network Mode
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    try:
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
    except ValueError:
        smtp_port = 587
        
    smtp_password = os.getenv("SMTP_PASSWORD")
    
    if not smtp_password or smtp_password == "abcd-efgh-ijkl-mnop":
        return False, "Error: SMTP_PASSWORD is not configured or still using default placeholder."

    # Construct standard email payload
    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = recipient_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    if mode == "draft":
        # Save a local .eml file as an active draft asset
        filepath = save_local_draft(sender_email, recipient_email, subject, body)
        
        # Explain how they would integrate OAuth2 for direct cloud drafts
        print(Fore.BLUE + f"[INFO] Local draft file written to {filepath}." + Style.RESET_ALL)
        print(Fore.BLUE + "[INFO] Active Gmail cloud draft creation requires Google API OAuth2 credentials. (See commented-out upgrade section in email_sender.py)" + Style.RESET_ALL)
        return True, f"Draft saved locally to {filepath}"

    # Live Send SMTP protocol connection
    try:
        # Establish connection with socket timeout to prevent indefinite hangs
        print(Fore.YELLOW + f"Connecting to {smtp_host}:{smtp_port} via SMTP..." + Style.RESET_ALL)
        server = smtplib.SMTP(smtp_host, smtp_port, timeout=10)
        
        # Start secure session
        server.ehlo()
        server.starttls()
        server.ehlo()
        
        # Authenticate
        print(Fore.YELLOW + "Authenticating..." + Style.RESET_ALL)
        server.login(sender_email, smtp_password)
        
        # Deliver payload
        print(Fore.YELLOW + f"Delivering email to {recipient_email}..." + Style.RESET_ALL)
        server.send_message(msg)
        server.quit()
        
        return True, "Email successfully sent."
        
    except socket.timeout:
        error_msg = (
            "Network Connection Timeout.\n"
            "This commonly happens if a corporate firewall, VPN, or ISP blocks outbound "
            "SMTP traffic on port 587. Check your internet connection or use a different port/network."
        )
        return False, error_msg
        
    except smtplib.SMTPAuthenticationError:
        error_msg = (
            "SMTP Authentication Failed.\n"
            "Your username or password was rejected. If using Gmail, make sure you are using "
            "a 16-character App Password (NOT your normal Google login password) and that "
            "2-Step Verification is active on your account."
        )
        return False, error_msg
        
    except Exception as e:
        return False, f"Unexpected SMTP error: {str(e)}"
