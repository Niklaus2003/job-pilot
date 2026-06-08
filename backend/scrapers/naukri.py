"""
Naukri.com scraper — supports both Firecrawl (Cloud-friendly) and local Playwright Stealth.
If FIRECRAWL_API_KEY is configured in the environment, it uses Firecrawl's cloud rendering API.
Otherwise, it falls back to local Playwright sync execution.
"""

import os
import time
import random
from bs4 import BeautifulSoup
from scrapers.base import BaseScraper
from utils.config import (
    REQUEST_DELAY_MIN,
    REQUEST_DELAY_MAX,
    FIRECRAWL_API_KEY
)

class NaukriScraper(BaseScraper):
    """Scrape job listings from Naukri.com."""

    BASE_URL = "https://www.naukri.com"
    SOURCE = "naukri"

    EXTRACT_SCHEMA = {
        "type": "object",
        "properties": {
            "jobs": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string", "description": "Job title"},
                        "company": {"type": "string", "description": "Company name or employer name"},
                        "location": {"type": "string", "description": "Job location"},
                        "salary": {"type": "string", "description": "Salary details or Not Disclosed"},
                        "url": {"type": "string", "description": "Direct link URL to the job posting"},
                    },
                },
            }
        },
    }

    def _build_search_url(self, keyword: str, page: int) -> str:
        slug = keyword
        url = ""
        if self.location:
            loc_slug = self._slugify(self.location)
            if page == 1:
                url = f"{self.BASE_URL}/{slug}-jobs-in-{loc_slug}"
            else:
                url = f"{self.BASE_URL}/{slug}-jobs-in-{loc_slug}-{page}"
        else:
            if page == 1:
                url = f"{self.BASE_URL}/{slug}-jobs"
            else:
                url = f"{self.BASE_URL}/{slug}-jobs-{page}"
        
        if self.experience:
            url += f"?experience={self.experience}"
            
        return url

    def _scrape_firecrawl(self) -> list[dict]:
        """Scrape Naukri using Firecrawl Cloud API (no local Chromium memory footprint)."""
        from firecrawl import FirecrawlApp
        app = FirecrawlApp(api_key=FIRECRAWL_API_KEY)
        
        keyword = self._slugify(self.job_title)
        all_jobs = []
        
        print(f"  🔍 Naukri (Firecrawl): searching for '{self.job_title}' ({self.pages} pages) ...")
        
        for page in range(1, self.pages + 1):
            url = self._build_search_url(keyword, page)
            print(f"     Page {page}: {url}")
            
            try:
                result = app.extract(
                    urls=[url],
                    prompt="Extract all job listings from the search results page. Get the title, company name, location, salary, and direct URL.",
                    schema=self.EXTRACT_SCHEMA,
                )
                
                extracted = None
                if hasattr(result, "data") and getattr(result, "data") is not None:
                    extracted = result.data
                elif hasattr(result, "extract") and getattr(result, "extract") is not None:
                    extracted = result.extract
                elif isinstance(result, dict):
                    extracted = result.get("data") or result.get("extract", {})

                if extracted and "jobs" in extracted:
                    page_jobs = extracted["jobs"]
                    for item in page_jobs:
                        job_url = item.get("url", "")
                        if job_url and not job_url.startswith("http"):
                            job_url = f"{self.BASE_URL}{job_url}"
                            
                        record = self._build_job_record(
                            title=item.get("title", ""),
                            company=item.get("company", ""),
                            location=item.get("location", ""),
                            salary=item.get("salary", "Not disclosed"),
                            url=job_url,
                            source=self.SOURCE
                        )
                        all_jobs.append(record)
                    print(f"     → {len(page_jobs)} jobs extracted via Firecrawl")
                else:
                    print(f"     ⚠ No jobs extracted on page {page}")
                    
            except Exception as e:
                print(f"  ✗ Naukri Firecrawl error on page {page}: {e}")
                
            if page < self.pages:
                time.sleep(random.uniform(REQUEST_DELAY_MIN, REQUEST_DELAY_MAX))
                
        return all_jobs

    def _scrape_playwright(self) -> list[dict]:
        """Scrape Naukri using local Playwright Chromium headless engine."""
        from playwright.sync_api import sync_playwright
        
        keyword = self._slugify(self.job_title)
        all_jobs = []
        
        loc_str = f" in '{self.location}'" if self.location else ""
        print(f"  🔍 Naukri (Playwright Local): searching for '{self.job_title}'{loc_str} ({self.pages} pages) ...")
        
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--disable-infobars",
                    "--no-sandbox",
                ]
            )
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
                viewport={"width": 1366, "height": 768},
            )
            
            page_obj = context.new_page()
            page_obj.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined
                });
            """)

            for page in range(1, self.pages + 1):
                url = self._build_search_url(keyword, page)
                print(f"     Page {page}: {url}")

                try:
                    page_obj.goto(url, wait_until="domcontentloaded", timeout=45000)
                    page_obj.wait_for_selector("div.srp-jobtuple-wrapper", timeout=20000)
                    html = page_obj.content()
                except Exception as e:
                    print(f"  ✗ Naukri local page {page} load failed: {e}")
                    continue

                page_jobs = self._parse_page_html(html)
                all_jobs.extend(page_jobs)
                print(f"     → {len(page_jobs)} jobs parsed on page {page}")

                if page < self.pages:
                    time.sleep(random.uniform(REQUEST_DELAY_MIN, REQUEST_DELAY_MAX))

            browser.close()
            
        return all_jobs

    def _parse_page_html(self, html: str) -> list[dict]:
        soup = BeautifulSoup(html, "html.parser")
        jobs = []
        cards = soup.select("div.srp-jobtuple-wrapper")

        for card in cards:
            try:
                title_tag = card.select_one("a.title")
                title = title_tag.get_text(strip=True) if title_tag else ""
                url = title_tag.get("href", "") if title_tag else ""

                company_tag = card.select_one("a.comp-name")
                company = company_tag.get_text(strip=True) if company_tag else ""

                loc_tag = card.select_one("span.loc-wrap")
                location = loc_tag.get_text(strip=True) if loc_tag else ""

                sal_tag = card.select_one("span.sal-wrap")
                salary = sal_tag.get_text(strip=True) if sal_tag else "Not disclosed"

                if not title:
                    continue

                record = self._build_job_record(
                    title=title,
                    company=company,
                    location=location,
                    salary=salary,
                    url=url,
                    source=self.SOURCE,
                )
                jobs.append(record)
            except Exception as e:
                continue

        return jobs

    def scrape(self) -> list[dict]:
        # Choose scraping strategy
        if FIRECRAWL_API_KEY and FIRECRAWL_API_KEY.strip():
            return self._scrape_firecrawl()
        else:
            return self._scrape_playwright()
