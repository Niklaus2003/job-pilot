import os
import shutil

src_root = r"c:\Users\AaronFrancis\Desktop\vscode\research\AI_agent_workshop"
dest_root = r"c:\Users\AaronFrancis\Desktop\vscode\research\AI_agent_workshop\final_combined"

def copy_nextjs():
    print("Copying Next.js frontend...")
    rb_dir = os.path.join(src_root, "resume_builder")
    ignore_patterns = shutil.ignore_patterns("node_modules", ".next", ".git", "venv", "pnpm-lock.yaml")
    
    for item in os.listdir(rb_dir):
        s = os.path.join(rb_dir, item)
        d = os.path.join(dest_root, item)
        if item in ["node_modules", ".next", ".git", "venv", "pnpm-lock.yaml"]:
            continue
        if os.path.isdir(s):
            if os.path.exists(d):
                shutil.rmtree(d)
            shutil.copytree(s, d, ignore=ignore_patterns)
            print(f"Copied directory: {item}")
        else:
            shutil.copy2(s, d)
            print(f"Copied file: {item}")

def copy_backend():
    print("Setting up backend folders...")
    backend_dir = os.path.join(dest_root, "backend")
    os.makedirs(backend_dir, exist_ok=True)
    os.makedirs(os.path.join(backend_dir, "data"), exist_ok=True)
    os.makedirs(os.path.join(backend_dir, "logs"), exist_ok=True)
    os.makedirs(os.path.join(backend_dir, "drafts"), exist_ok=True)
    
    # Copy scrapers from job_agent
    ja_scrapers = os.path.join(src_root, "job_agent", "scrapers")
    dest_scrapers = os.path.join(backend_dir, "scrapers")
    if os.path.exists(dest_scrapers):
        shutil.rmtree(dest_scrapers)
    shutil.copytree(ja_scrapers, dest_scrapers, ignore=shutil.ignore_patterns("__pycache__", "venv"))
    print("Copied scrapers")
    
    # Copy utils from job_agent
    ja_utils = os.path.join(src_root, "job_agent", "utils")
    dest_utils = os.path.join(backend_dir, "utils")
    if os.path.exists(dest_utils):
        shutil.rmtree(dest_utils)
    shutil.copytree(ja_utils, dest_utils, ignore=shutil.ignore_patterns("__pycache__"))
    print("Copied utils")
    
    # Copy src from cold_email_parser
    cep_src = os.path.join(src_root, "cold_email_parser", "src")
    dest_src = os.path.join(backend_dir, "src")
    if os.path.exists(dest_src):
        shutil.rmtree(dest_src)
    shutil.copytree(cep_src, dest_src, ignore=shutil.ignore_patterns("__pycache__"))
    print("Copied cold email parser src")

if __name__ == "__main__":
    copy_nextjs()
    copy_backend()
    print("Copy completed successfully!")
