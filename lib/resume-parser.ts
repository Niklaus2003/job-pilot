import { callLlmJson } from "./llm";
import { ResumeProfileSchema, ResumeProfile } from "./schemas";
import { prompt as resumeParserPrompt } from "@/prompts/resume-parser";
import { truncateText, MAX_RESUME_CHARS } from "./truncate";

export async function parseResume(resumeText: string): Promise<ResumeProfile> {
    const truncatedResume = truncateText(resumeText, MAX_RESUME_CHARS);

    const filledPrompt = resumeParserPrompt.replace("{resumeText}", truncatedResume);

    const result = await callLlmJson(
        filledPrompt,
        ResumeProfileSchema
    );

    return result;
}
