import { callLlmJson } from "./llm";
import { GapAnalysisSchema, GapAnalysis, ResumeProfile, JobDescriptionProfile } from "./schemas";
import { prompt as gapAnalysisPrompt } from "@/prompts/gap-analysis";

export async function performGapAnalysis(
    resumeProfile: ResumeProfile,
    jdProfile: JobDescriptionProfile
): Promise<GapAnalysis> {
    const filledPrompt = gapAnalysisPrompt
        .replace("{jdProfile}", JSON.stringify(jdProfile, null, 2))
        .replace("{resumeProfile}", JSON.stringify(resumeProfile, null, 2));

    const result = await callLlmJson(
        filledPrompt,
        GapAnalysisSchema
    );

    return result;
}
