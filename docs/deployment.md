# Deployment Guide: Resume Shapeshifter

This guide covers how to deploy the Resume Shapeshifter application to Vercel.

## Prerequisites
1.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
2.  **Groq API Key**: Obtain a key from the [Groq Console](https://console.groq.com).
3.  **GitHub/GitLab/Bitbucket**: Ensure your code is pushed to a remote repository.

## Vercel Deployment Steps

### 1. Connect Repository
- Go to your Vercel Dashboard and click **"New Project"**.
- Import your `resume_builder` repository.

### B. Vercel Environment Variables (Frontend Production)
Add these variables in the **Vercel Project Settings**:
* `BACKEND_API_URL`: Your Render backend service URL (e.g. `https://job-pilot-backend.onrender.com`).
* `GROQ_API_KEY`: `[Your Groq API Key]`
* `GROQ_MODEL`: `llama-3.3-70b-versatile`

### C. Render Environment Variables (Backend Production)
Add these variables in the **Render Web Service Settings**:
* `SUPABASE_URL`: `[Your Supabase Project URL]`
* `SUPABASE_SERVICE_KEY`: `[Your Supabase Service Role Key]`
* `GROQ_API_KEY`: `[Your Groq API Key]`
* `FIRECRAWL_API_KEY`: (Optional but recommended for Render's free tier to bypass local Playwright memory constraints).

> [!WARNING]
> **GitGuardian Secret Leak Warning**
> Because a previous commit in the git history of the `job-pilot` repository contained your hardcoded Supabase Service Role Key, GitGuardian scanned it and flagged it as public.
> To secure your database:
> 1. Go to your **Supabase Dashboard** -> **Project Settings** -> **API**.
> 2. Scroll to the **service_role key** section and click **Roll Key** (or rotate/regenerate key). This immediately invalidates the old exposed token and generates a new secure one.
> 3. Copy the new role key and update it in your local `.env` files (which are git-ignored and won't be committed) and your Render settings.

### 4. Special Configurations (Already Implemented)
This project uses several libraries that require specific handling in serverless environments:
- **PDF Parsing (`pdf-parse`)**: We have configured `next.config.ts` to use `serverExternalPackages` for `pdf-parse` and `mammoth`. This ensures the native Node.js dependencies are handled correctly by Vercel's bundler.
- **PDF Generation (`@react-pdf/renderer`)**: This library runs on the server to generate high-quality PDFs. No additional configuration is needed as of v4.1.0+.

## Local Build Verification
Before deploying, it is recommended to run a local build to catch any environment-specific issues:
```bash
pnpm build
```

## Troubleshooting
- **PDF Parsing Error**: If you see "fake worker" errors on Vercel, ensure that `serverExternalPackages: ["pdf-parse"]` is present in your `next.config.ts`.
- **API Timeouts**: Matching and tailoring can take several seconds. Vercel's default timeout for the Hobby plan is 10 seconds. If the LLM is slow, you might encounter a 504 error. Consider upgrading to Pro if you need longer execution times or optimize the prompts for speed.
