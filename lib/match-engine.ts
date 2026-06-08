import { callLlmJson } from "./llm";
import { MatchScoreSchema, MatchScore, ResumeProfile, JobDescriptionProfile } from "./schemas";
import { prompt as matchScoringPrompt } from "@/prompts/match-scoring";

export async function calculateMatchScore(
    resumeProfile: ResumeProfile | any, // Can be TailoredExperienceItem[] too
    jdProfile: JobDescriptionProfile
): Promise<MatchScore> {
    const filledPrompt = matchScoringPrompt
        .replace("{jdProfile}", JSON.stringify(jdProfile, null, 2))
        .replace("{resumeProfile}", JSON.stringify(resumeProfile, null, 2));

    const result = await callLlmJson(
        filledPrompt,
        MatchScoreSchema
    );

    console.log(`[MATCH SCORE] Overall: ${result.overallScore}%`);
    return result;
}
