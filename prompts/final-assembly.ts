export const prompt = `
Generate a tailored summary and skills list for the following Resume based on the target Job Description (JD).
Output ONLY a valid JSON object matching this schema:
{
  "tailoredSummary": "string",
  "tailoredSkills": ["array of strings"]
}

Rules:
- THE SUMMARY should be 2-3 sentences max.
- THE SKILLS should be prioritized based on the JD's required skills.
- Only include skills that the user actually has in their original resume.

JD PROFILE:
{jdProfile}

GAP ANALYSIS:
{gapAnalysis}

ORIGINAL RESUME:
{resumeProfile}

Additional Instructions:
1. Ensure the tailored summary explicitly mentions skills or experiences that bridge the gaps identified in GAP ANALYSIS.
2. The tailored skills list should prioritize keywords found in JD PROFILE that the user already posesses.
`;

export default prompt;
