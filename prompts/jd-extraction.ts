export const prompt = `
Extract the structured requirements from the following Job Description (JD).
Output ONLY a valid JSON object matching this schema:
{
  "jobTitle": "string",
  "company": "string (optional)",
  "requiredSkills": ["array of strings"],
  "preferredSkills": ["array of strings"],
  "responsibilities": ["array of strings"],
  "qualifications": ["array of strings"],
  "tools": ["array of strings"],
  "keywords": ["array of important industry keywords"],
  "seniorityLevel": "junior | mid | senior | staff",
  "domainSignals": ["e.g. Fintech, SaaS, Healthcare"]
}

Rules:
- Be precise and concise.
- If a skill is mentioned as "nice to have" or "preferred", put it in preferredSkills.
- If it's mandatory, put it in requiredSkills.
- Extract seniority from the title or description text.

JD TEXT:
{jdText}
`;

export default prompt;
