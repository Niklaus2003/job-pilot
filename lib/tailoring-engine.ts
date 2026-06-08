import { callLlmJson } from "./llm";
import {
    TailoredResumeSchema,
    TailoredResume,
    ResumeProfile,
    JobDescriptionProfile,
    GapAnalysis
} from "./schemas";
import { prompt as bulletRewriterPrompt } from "@/prompts/bullet-rewriter";
import { prompt as finalAssemblyPrompt } from "@/prompts/final-assembly";
import { validateExperienceBullets } from "./guardrails";

export async function tailorResume(
    resumeProfile: ResumeProfile,
    jdProfile: JobDescriptionProfile,
    gapAnalysis?: GapAnalysis
): Promise<TailoredResume> {
    // Step 1: Rewriting bullets
    const bulletPrompt = bulletRewriterPrompt
        .replace("{jdProfile}", JSON.stringify(jdProfile, null, 2))
        .replace("{resumeProfile}", JSON.stringify(resumeProfile, null, 2))
        .replace("{experience}", JSON.stringify(resumeProfile.experience, null, 2))
        .replace("{gapAnalysis}", JSON.stringify(gapAnalysis || { gaps: [] }, null, 2));

    const bulletResult = await callLlmJson(
        bulletPrompt,
        TailoredResumeSchema
    );

    // Apply Guardrails to rewritten bullets
    const guardedExperience = bulletResult.tailoredExperience.map(exp => ({
        ...exp,
        bullets: validateExperienceBullets(exp, resumeProfile)
    }));

    // Step 2: Final assembly (summary and skills)
    const assemblyPrompt = finalAssemblyPrompt
        .replace("{jdProfile}", JSON.stringify(jdProfile, null, 2))
        .replace("{resumeProfile}", JSON.stringify(resumeProfile, null, 2))
        .replace("{gapAnalysis}", JSON.stringify(gapAnalysis || { gaps: [] }, null, 2));

    const assemblyResult = await callLlmJson(
        assemblyPrompt,
        TailoredResumeSchema
    );

    // Merge results
    return {
        ...bulletResult,
        tailoredExperience: guardedExperience,
        tailoredSummary: assemblyResult.tailoredSummary,
        tailoredSkills: assemblyResult.tailoredSkills
    };
}
