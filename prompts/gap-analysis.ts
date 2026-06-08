export const prompt = `
Perform a gap analysis between the following Resume and Job Description (JD).
Identify missing required skills, preferred skills, or experience gaps.
Output ONLY a valid JSON object matching this schema:
{
  "gaps": [
    {
      "name": "string (skill or requirement name)",
      "importance": "high | medium | low",
      "jdEvidence": "string from JD describing the requirement",
      "resumeEvidence": "string from resume showing what (if anything) matches, or 'None found'",
      "suggestedAction": "string (e.g. 'Add if you have it', 'Mention in summary')",
      "canSafelyAdd": boolean (true if it's a minor skill/keyword, false if it's a major role/qualification)
    }
  ]
}

JD PROFILE:
{jdProfile}

RESUME PROFILE:
{resumeProfile}
`;

export default prompt;
