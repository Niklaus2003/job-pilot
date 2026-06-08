# Resume Shapeshifter

Resume Shapeshifter is a JD-to-resume tailoring engine that turns any job description (JD) into a truthful, targeted resume rewrite with match scoring, gap analysis, and a side-by-side PDF proof artifact.

It parses and structures resumes and job descriptions using Zod schemas, performs deterministic and LLM-assisted matching and gap analysis, rewrites experience bullets truthfully, and generates side-by-side comparison proofs or clean, submission-ready tailored resumes in PDF format.

## Key Features

- **Resume Parsing & Structuring:** Converts unstructured text/PDFs/DOCX resumes into validated JSON structures.
- **JD Requirement Extraction:** Pulls required/preferred skills, tools, responsibilities, and seniority from job postings.
- **Match Scoring:** Analyzes alignment between the resume and job description (original vs. tailored).
- **Gap Analysis:** Identifies missing required skills and suggests safe actions without fabricating experience.
- **Truthful Bullet Rewriting:** Tailors resume experience bullets to the target JD with reasoning, confidence scores, and safety guardrails.
- **PDF Export:** Generates clean tailored resumes and side-by-side before/after PDF comparison proofs.

---

## Getting Started

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/) (v8 or higher)

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   pnpm install
   ```

2. Configure environment variables:
   Copy the example environment file to `.env`:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your Groq API Key:
   ```env
   GROQ_API_KEY=your_actual_groq_api_key
   GROQ_MODEL=llama-3.3-70b-versatile
   ```

### Running Tests

Run the schema and unit tests via Vitest:
```bash
pnpm test
```

### Running the App Locally

Start the local Next.js development server:
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Building for Production

To create an optimized production build:
```bash
pnpm build
```

And to start the production server:
```bash
pnpm start
```

---

## Project Structure

```text
resume_builder/
├── app/                  # Next.js App Router (pages and API endpoints)
├── components/           # Reusable React components (UI inputs, cards, diffs)
├── docs/                 # Product requirements, system architecture, and phase plans
├── lib/                  # Shared utilities, schemas, domain engines, and PDF generation
└── prompts/              # Versioned LLM prompts (parsing, scoring, rewrites)
```
