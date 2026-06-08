import { NextRequest, NextResponse } from "next/server";
import { parseRun, analyzeRun } from "@/lib/orchestrator";
import { createApiError } from "@/lib/api-error";
import { ResumeProfileSchema, JobDescriptionProfileSchema } from "@/lib/schemas";
import { getGroqApiKey } from "@/lib/api-key-helper";

export async function POST(request: NextRequest) {
    const apiKey = await getGroqApiKey();
    if (!apiKey) {
        return NextResponse.json(
            createApiError("CONFIG_ERROR", "GROQ_API_KEY is not configured on the server or in profile settings."),
            { status: 503 }
        );
    }

    try {
        const body = await request.json();

        // Support two modes:
        // 1. Pre-parsed profiles: { resumeProfile, jdProfile }
        // 2. Raw text: { resumeText, jdText } — we parse first then analyze
        let resumeProfile, jdProfile;

        if (body.resumeProfile && body.jdProfile) {
            // Validate pre-parsed profiles
            const rp = ResumeProfileSchema.safeParse(body.resumeProfile);
            const jp = JobDescriptionProfileSchema.safeParse(body.jdProfile);
            if (!rp.success) {
                return NextResponse.json(
                    createApiError("INVALID_REQUEST", "Invalid resumeProfile", rp.error.issues),
                    { status: 400 }
                );
            }
            if (!jp.success) {
                return NextResponse.json(
                    createApiError("INVALID_REQUEST", "Invalid jdProfile", jp.error.issues),
                    { status: 400 }
                );
            }
            resumeProfile = rp.data;
            jdProfile = jp.data;
        } else if (body.resumeText && body.jdText) {
            const parsed = await parseRun(body.resumeText.trim(), body.jdText.trim());
            resumeProfile = parsed.resumeProfile;
            jdProfile = parsed.jdProfile;
        } else {
            return NextResponse.json(
                createApiError("INVALID_REQUEST", "Provide either {resumeProfile, jdProfile} or {resumeText, jdText}."),
                { status: 400 }
            );
        }

        const run = await analyzeRun(resumeProfile, jdProfile);

        return NextResponse.json({
            runId: run.id,
            resumeProfile: run.resumeProfile,
            jdProfile: run.jdProfile,
            originalMatch: run.originalMatch,
            gapAnalysis: run.gapAnalysis,
            status: run.status,
            createdAt: run.createdAt,
        });
    } catch (error) {
        console.error("[POST /api/analyze] Error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            createApiError("LLM_INVALID_JSON", `Analysis failed: ${message}`),
            { status: 500 }
        );
    }
}
