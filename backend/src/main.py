import os
import json
import sys
from dotenv import load_dotenv
from colorama import Fore, Style, init

# Import core custom modules
from email_generator import generate_email, count_words
from email_sender import send_email
from logger import log_transaction, is_already_contacted

# Initialize colorama
init(autoreset=True)

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dotenv_path = os.path.join(PROJECT_ROOT, ".env")
load_dotenv(dotenv_path)

def print_header(title: str, color=Fore.CYAN):
    """
    Prints a beautiful header block.
    """
    print("\n" + color + "=" * 65)
    print(color + f" {title.upper()} ")
    print(color + "=" * 65)

def display_config_summary():
    """
    Renders a clear configuration summary box at startup.
    """
    dry_run = os.getenv("DRY_RUN", "true").lower() == "true"
    sender_name = os.getenv("SENDER_NAME", "Alex Mercer")
    portfolio_url = os.getenv("PORTFOLIO_URL", "https://github.com/alexmercer")
    smtp_user = os.getenv("SMTP_USER", "candidate_email@gmail.com")
    groq_api_key = os.getenv("GROQ_API_KEY")
    
    print_header("The Closer: Outreach Orchestrator", Fore.MAGENTA)
    print(f"{Fore.BLUE}  SENDER PROFILE:{Style.RESET_ALL}   {sender_name}")
    print(f"{Fore.BLUE}  PORTFOLIO URL: {Style.RESET_ALL}   {portfolio_url}")
    print(f"{Fore.BLUE}  SMTP SENDER:   {Style.RESET_ALL}   {smtp_user}")
    
    # Indicated Groq state
    if groq_api_key and groq_api_key.strip() != "gsk_xxxx":
        print(f"{Fore.BLUE}  LLM ENGINE:    {Style.RESET_ALL}   GROQ ACTIVE (llama-3.3-70b-versatile)")
    else:
        print(f"{Fore.BLUE}  LLM ENGINE:    {Style.RESET_ALL}   LOCAL RULE TEMPLATE (Groq key not configured)")
        
    if dry_run:
        print(f"{Fore.GREEN}  SAFETY STATUS: {Style.RESET_ALL}   DRY RUN ENABLED (Outbound traffic is simulated)")
    else:
        print(f"{Fore.RED}  SAFETY STATUS: {Style.RESET_ALL}   LIVE DISPATCH ENABLED (Outbox emails will be active!)")
    print(Fore.MAGENTA + "=" * 65 + "\n")

def get_multiline_input(prompt: str) -> str:
    """
    Reads multi-line text input from the console until the user types 'END' on a new line.
    """
    print(prompt)
    print(Fore.YELLOW + "  (Type 'END' on a new line when finished, or leave blank/press enter on 'END' to finish)" + Style.RESET_ALL)
    
    lines = []
    while True:
        try:
            line = input()
            if line.strip() == "END":
                break
            lines.append(line)
        except EOFError:
            break
            
    return "\n".join(lines).strip()

def display_email_card(contact: dict, subject: str, body: str, word_count: int, is_valid: bool, engine: str):
    """
    Renders a highly formatted card presenting the compiled email.
    """
    print(Fore.YELLOW + "\n" + "-" * 65)
    print(f"{Fore.CYAN}CONTACT DETAILS:")
    print(f"  {Fore.BLUE}Name:    {Style.RESET_ALL}{contact.get('recipient_name', 'Hiring Team')}")
    print(f"  {Fore.BLUE}Company: {Style.RESET_ALL}{contact.get('company', 'Unknown')}")
    print(f"  {Fore.BLUE}Role:    {Style.RESET_ALL}{contact.get('role', 'Unknown')}")
    print(f"  {Fore.BLUE}Email:   {Style.RESET_ALL}{contact.get('recipient_email', 'Unknown')}")
    print(f"  {Fore.BLUE}Engine:  {Style.RESET_ALL}{engine}")
    print(f"  {Fore.BLUE}Subject: {Style.RESET_ALL}{subject}")
    print(Fore.YELLOW + "-" * 65)
    
    # Print Body
    print(body)
    print(Fore.YELLOW + "-" * 65)
    
    # Print word count with distinct styling based on constraint compliance
    if is_valid:
        print(f"{Fore.GREEN}[OK] Length Check: OK ({word_count} words | Under 150 Limit)")
    else:
        print(f"{Fore.RED}[WARNING] Length Check: EXCEEDED ({word_count} words | Must be under 150 words!)")
    print(Fore.YELLOW + "-" * 65 + "\n")

def run_orchestrator():
    """
    Main loop driver coordinating generation, review, delivery, and reporting.
    """
    # Load configuration
    load_dotenv(dotenv_path)
    display_config_summary()
    
    # 1. Load targets
    contacts_file = os.path.join(PROJECT_ROOT, "data", "contacts.json")
    if not os.path.exists(contacts_file):
        print(Fore.RED + f"[ERROR] Contacts database '{contacts_file}' is missing! Please populate mock records first." + Style.RESET_ALL)
        sys.exit(1)
        
    try:
        with open(contacts_file, "r", encoding="utf-8") as f:
            contacts = json.load(f)
    except json.JSONDecodeError as jde:
        print(Fore.RED + f"[ERROR] Failed to parse {contacts_file}: {str(jde)}" + Style.RESET_ALL)
        sys.exit(1)
        
    if not contacts or not isinstance(contacts, list):
        print(Fore.YELLOW + "[INFO] Contacts list is empty or invalid structure. No records to process." + Style.RESET_ALL)
        sys.exit(0)
        
    total_loaded = len(contacts)
    print(f"{Fore.CYAN}Loaded {total_loaded} contact records from {contacts_file}.\n")
    
    # Statistics counters
    stats = {
        "processed": 0,
        "sent": 0,
        "drafted": 0,
        "skipped_user": 0,
        "skipped_duplicate": 0,
        "failures": 0
    }
    
    # 2. Iterate outreach records
    for idx, contact in enumerate(contacts, start=1):
        recipient_name = contact.get("recipient_name", "Recruiter")
        recipient_email = contact.get("recipient_email")
        company = contact.get("company", "Company")
        role = contact.get("role", "Role")
        
        print(Fore.CYAN + f"[{idx}/{total_loaded}] Reviewing target: {recipient_name} ({recipient_email}) @ {company}" + Style.RESET_ALL)
        
        if not recipient_email:
            print(Fore.RED + "  [SKIPPED] Missing 'recipient_email' key. Recording failure." + Style.RESET_ALL)
            stats["failures"] += 1
            log_transaction("N/A", company, role, "None", "failed", "Missing recipient email address")
            print("=" * 65 + "\n")
            continue
            
        # Deduplication check
        if is_already_contacted(recipient_email):
            print(Fore.YELLOW + f"  [DUPLICATE SKIPPED] {recipient_email} has already been logged as 'sent' or 'drafted'." + Style.RESET_ALL)
            stats["skipped_duplicate"] += 1
            print("=" * 65 + "\n")
            continue
            
        stats["processed"] += 1
        
        # Generation engine
        email_data = generate_email(contact)
        subject = email_data["subject"]
        body = email_data["body"]
        word_count = email_data["word_count"]
        is_valid = email_data["is_valid"]
        engine = email_data.get("engine", "Local Template")
        
        # Human-in-the-loop interaction loop
        while True:
            display_email_card(contact, subject, body, word_count, is_valid, engine)
            
            print(Fore.CYAN + "Actions Menu:")
            print(f"  {Fore.GREEN}[s]{Style.RESET_ALL}  Send Email")
            print(f"  {Fore.GREEN}[d]{Style.RESET_ALL}  Create Draft")
            print(f"  {Fore.GREEN}[e]{Style.RESET_ALL}  Edit Body")
            print(f"  {Fore.GREEN}[sk]{Style.RESET_ALL} Skip Target")
            print(f"  {Fore.GREEN}[q]{Style.RESET_ALL}  Quit Session")
            
            try:
                choice = input(Fore.CYAN + "\nEnter selection: " + Style.RESET_ALL).strip().lower()
            except (KeyboardInterrupt, EOFError):
                choice = "q"
                
            if choice == "s":
                print(Fore.YELLOW + "\nInitiating delivery..." + Style.RESET_ALL)
                success, msg = send_email(recipient_email, subject, body, mode="send")
                if success:
                    print(Fore.GREEN + f"SUCCESS: {msg}" + Style.RESET_ALL)
                    stats["sent"] += 1
                    log_transaction(recipient_email, company, role, subject, "sent")
                else:
                    print(Fore.RED + f"FAILURE: {msg}" + Style.RESET_ALL)
                    stats["failures"] += 1
                    log_transaction(recipient_email, company, role, subject, "failed", msg)
                print("=" * 65 + "\n")
                break
                
            elif choice == "d":
                print(Fore.YELLOW + "\nSaving draft..." + Style.RESET_ALL)
                success, msg = send_email(recipient_email, subject, body, mode="draft")
                if success:
                    print(Fore.GREEN + f"SUCCESS: {msg}" + Style.RESET_ALL)
                    stats["drafted"] += 1
                    log_transaction(recipient_email, company, role, subject, "drafted")
                else:
                    print(Fore.RED + f"FAILURE: {msg}" + Style.RESET_ALL)
                    stats["failures"] += 1
                    log_transaction(recipient_email, company, role, subject, "failed", msg)
                print("=" * 65 + "\n")
                break
                
            elif choice == "e":
                # Manual overrides loop
                prompt_text = Fore.CYAN + f"\n=== EDITING BODY FOR {recipient_name} ===" + Style.RESET_ALL
                new_body = get_multiline_input(prompt_text)
                
                # If they cancelled or left blank, keep previous body
                if new_body:
                    body = new_body
                    word_count = count_words(body)
                    is_valid = word_count <= 150
                    print(Fore.GREEN + "[OK] Local modifications compiled." + Style.RESET_ALL)
                else:
                    print(Fore.YELLOW + "No changes made." + Style.RESET_ALL)
                continue  # Go back to presenting the updated card
                
            elif choice == "sk":
                print(Fore.YELLOW + f"\nSkipping {recipient_name} outreaches." + Style.RESET_ALL)
                stats["skipped_user"] += 1
                log_transaction(recipient_email, company, role, subject, "skipped")
                print("=" * 65 + "\n")
                break
                
            elif choice == "q":
                print(Fore.RED + "\nHalting execution. Aborting active session." + Style.RESET_ALL)
                log_transaction(recipient_email, company, role, subject, "aborted", "User terminated loop execution.")
                print("=" * 65 + "\n")
                print_session_report(total_loaded, stats)
                sys.exit(0)
                
            else:
                print(Fore.RED + "Invalid option. Please type s, d, e, sk, or q." + Style.RESET_ALL)
                
    # 3. Print final report
    print_session_report(total_loaded, stats)

def print_session_report(total_loaded: int, stats: dict):
    """
    Renders a summary report card at the end of the session.
    """
    print_header("Outreach Session Report Summary", Fore.MAGENTA)
    print(f"  {Fore.BLUE}Total Loaded Contacts:     {Style.RESET_ALL}{total_loaded}")
    print(f"  {Fore.BLUE}Duplicate Auto-Skipped:    {Style.RESET_ALL}{stats['skipped_duplicate']}")
    print(f"  {Fore.BLUE}Active Target Reviews:     {Style.RESET_ALL}{stats['processed']}")
    print(f"  {Fore.GREEN}Successfully Sent:         {Style.RESET_ALL}{stats['sent']}")
    print(f"  {Fore.CYAN}Successfully Drafted:      {Style.RESET_ALL}{stats['drafted']}")
    print(f"  {Fore.YELLOW}Skipped by User:           {Style.RESET_ALL}{stats['skipped_user']}")
    print(f"  {Fore.RED}Failures / Errors:         {Style.RESET_ALL}{stats['failures']}")
    print(Fore.MAGENTA + "=" * 65 + "\n")
    print(Fore.GREEN + "Thank you for using 'The Closer'. Happy Job Hunting!" + Style.RESET_ALL)

if __name__ == "__main__":
    run_orchestrator()
