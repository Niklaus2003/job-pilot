import { callLlmJson } from "./llm";
import { JobDescriptionProfileSchema, JobDescriptionProfile } from "./schemas";
import { prompt as jdExtractionPrompt } from "@/prompts/jd-extraction";
import { truncateText, MAX_JD_CHARS } from "./truncate";

export async function parseJobDescription(jdText: string): Promise<JobDescriptionProfile> {
    const truncatedJd = truncateText(jdText, MAX_JD_CHARS);

    const filledPrompt = jdExtractionPrompt.replace("{jdText}", truncatedJd);

    const result = await callLlmJson(
        filledPrompt,
        JobDescriptionProfileSchema
    );

    // Normalization could happen here if needed (e.g. lowercasing skills for deterministic matching)
    return result;
}
