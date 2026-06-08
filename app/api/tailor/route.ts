import { NextRequest, NextResponse } from "next/server";
import { tailorRun } from "@/lib/orchestrator";
import { createApiError } from "@/lib/api-error";
import { ResumeProfileSchema, JobDescriptionProfileSchema, GapAnalysisSchema } from "@/lib/schemas";
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

        // Validate required profiles
        const rp = ResumeProfileSchema.safeParse(body.resumeProfile);
        if (!rp.success) {
            return NextResponse.json(
                createApiError("INVALID_REQUEST", "Invalid resumeProfile", rp.error.issues),
                { status: 400 }
            );
        }

        const jp = JobDescriptionProfileSchema.safeParse(body.jdProfile);
        if (!jp.success) {
            return NextResponse.json(
                createApiError("INVALID_REQUEST", "Invalid jdProfile", jp.error.issues),
                { status: 400 }
            );
        }

        // Gap analysis is optional
        let gapAnalysis;
        if (body.gapAnalysis) {
            const ga = GapAnalysisSchema.safeParse(body.gapAnalysis);
            if (ga.success) {
                gapAnalysis = ga.data;
            }
        }

        const { tailoredResume, tailoredMatch } = await tailorRun(
            rp.data,
            jp.data,
            gapAnalysis
        );

        return NextResponse.json({
            runId: body.runId,
            tailoredResume,
            tailoredMatch,
            originalMatch: body.originalMatch,
        });
    } catch (error) {
        console.error("[POST /api/tailor] Error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            createApiError("LLM_INVALID_JSON", `Tailoring failed: ${message}`),
            { status: 500 }
        );
    }
}
