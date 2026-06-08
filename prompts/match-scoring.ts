export const prompt = `
Evaluate the match between the following Resume and Job Description (JD).

You MUST be granular and objective. 
- If the resume has been tailored correctly to include required keywords and address responsibilities, the score SHOULD increase.
- Pay close attention to Skill Coverage (skills listed vs skills required).
- Pay close attention to Responsibility Alignment (achievements vs job duties).

Output ONLY a valid JSON object matching this schema:
{
  "overallScore": number (0-100),
  "skillCoverageScore": number (0-100),
  "responsibilityAlignmentScore": number (0-100),
  "keywordScore": number (0-100),
  "seniorityScore": number (0-100),
  "criticalMissingRequirements": ["array of strings"],
  "explanation": "string describing why the score is what it is. Mention specific improvements if this is a tailored version."
}

Context for scoring:
- 0-30: Poor match, missing critical skills/experience.
- 30-60: Fair match, has related experience but missing key tools or specific domain knowledge.
- 60-85: Strong match, addresses most requirements with clear evidence.
- 85-100: Exceptional match, near perfect alignment with all keywords and seniority.

JD PROFILE:
{jdProfile}

RESUME PROFILE:
{resumeProfile}
`;

export default prompt;
