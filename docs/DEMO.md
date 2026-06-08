# Resume Shapeshifter — Demo Script

This document provides a guided walkthrough for demonstrating the core capabilities of the Resume Shapeshifter AI.

## 1. Setup

- **URL**: `http://localhost:3000`
- **Profiles**: 
  - Source: [Aaron Francis](public/samples/sample-resume.txt)
  - Target: [Senior Database Engineer at OpenAI](public/samples/sample-jd.txt)

## 2. The Walkthrough

### Step 1: Input & Extraction
1. Navigate to the **Tailoring Workspace**.
2. Click **Load Sample** on both the Resume and Job Description inputs.
3. *Note*: You can also try uploading the provided [Aaron Francis Resume PDF](path/to/resume.pdf) if you have one saved.

### Step 2: Strategic Analysis
1. Click **Analyze Match Score**.
2. Wait for the engine to decompose both documents.
3. **Review scores**:
   - Total Match: ~40-60% (Aaron is a Senior Dev but doesn't explicitly mention Vitess or OpenAI-specific scaling in the sample).
   - Spot the **Gap Analysis**: It will highlight "Vitess architecture," "High-throughput MySQL optimization," and "Applied AI scaling."

### Step 3: Shapeshifting
1. Click **Generate Tailored Resume**.
2. Watch the progress stepper move to Phase 3.
3. Review the **Side-by-Side Diff**:
   - Look for the PlanetScale bullet: "Created 'MySQL for Developers'..."
   - The AI will likely reshape this to: "Optimized high-throughput MySQL educational content, aligning with OpenAI requirements for database performance education."
   - Check the **Adjustment Justification** for reasoning.

### Step 4: Safety & Review
1. Spot a **Low Confidence** badge if the AI hallucinated a Vitess project.
2. Click **Accept change** to confirm the accuracy of adjusted bullets.
3. Check the **Truthfulness Disclaimer**.

### Step 5: Professional Export
1. Click **Download Comparison PDF**.
2. Open the PDF to see the professional, side-by-side audit report suitable for internal review.
3. Click **Download Tailored Resume** for the final clean version.

## 3. Expected Outcomes
- Match score should increase by >30% after tailoring.
- Keyword alignment for "MySQL," "Scaling," and "Education" should reach 100%.
- PDF export should be high-fidelity and ATS-formatted.
