export const prompt = `
Parse the following raw resume text into a structured JSON profile.
Output ONLY a valid JSON object matching this schema:
{
  "contact": { "name": "string", "email": "string", "phone": "string", "location": "string", "linkedin": "string", "github": "string" },
  "summary": "string",
  "skills": ["array of strings"],
  "experience": [
    {
      "company": "string",
      "title": "string",
      "startDate": "string",
      "endDate": "string",
      "bullets": ["array of strings"]
    }
  ],
  "projects": [
    { "name": "string", "description": "string", "bullets": ["array of strings"] }
  ],
  "education": [
    { "institution": "string", "degree": "string", "dates": "string" }
  ],
  "certifications": ["array of strings"]
}

Rules:
- If info is missing, use empty string or empty array.
- Keep the original wording of bullets as much as possible; just clean up formatting.
- Ensure the output is strictly valid JSON.

RESUME TEXT:
{resumeText}
`;

export default prompt;
