import { parseResume } from "./resume-parser";
import { parseJobDescription } from "./jd-parser";
import { calculateMatchScore } from "./match-engine";
import { performGapAnalysis } from "./gap-engine";
import { tailorResume } from "./tailoring-engine";
import {
    TailoringRun,
    ResumeProfile,
    JobDescriptionProfile,
    GapAnalysis,
} from "./schemas";

function generateRunId(): string {
    return `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Step 1 — Parse raw text into structured profiles.
 */
export async function parseRun(
    resumeText: string,
    jdText: string
): Promise<{ resumeProfile: ResumeProfile; jdProfile: JobDescriptionProfile }> {
    const [resumeProfile, jdProfile] = await Promise.all([
        parseResume(resumeText),
        parseJobDescription(jdText),
    ]);
    return { resumeProfile, jdProfile };
}

/**
 * Step 2 — Score the original resume against the JD and run gap analysis.
 */
export async function analyzeRun(
    resumeProfile: ResumeProfile,
    jdProfile: JobDescriptionProfile
): Promise<Omit<TailoringRun, "tailoredMatch" | "tailoredResume">> {
    const [originalMatch, gapAnalysis] = await Promise.all([
        calculateMatchScore(resumeProfile, jdProfile),
        performGapAnalysis(resumeProfile, jdProfile),
    ]);

    return {
        id: generateRunId(),
        createdAt: new Date().toISOString(),
        resumeProfile,
        jdProfile,
        originalMatch,
        gapAnalysis,
        status: "analyzed",
    };
}

/**
 * Step 3 — Tailor the resume and re-score.
 */
export async function tailorRun(
    resumeProfile: ResumeProfile,
    jdProfile: JobDescriptionProfile,
    gapAnalysis?: GapAnalysis
): Promise<{
    tailoredResume: NonNullable<TailoringRun["tailoredResume"]>;
    tailoredMatch: NonNullable<TailoringRun["tailoredMatch"]>;
}> {
    const tailoredResume = await tailorResume(resumeProfile, jdProfile, gapAnalysis);

    // Build a "tailored" profile for re-scoring by merging tailored bullets
    // into a copy of the resume profile
    const tailoredProfile: ResumeProfile = {
        ...resumeProfile,
        summary: tailoredResume.tailoredSummary ?? resumeProfile.summary,
        skills: tailoredResume.tailoredSkills ?? resumeProfile.skills,
        experience: tailoredResume.tailoredExperience.map((te) => ({
            company: te.company,
            title: te.title,
            bullets: te.bullets.map((b) => b.tailored),
        })),
    };

    const tailoredMatch = await calculateMatchScore(tailoredProfile, jdProfile);

    return { tailoredResume, tailoredMatch };
}
