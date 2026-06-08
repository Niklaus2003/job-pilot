import { NextRequest, NextResponse } from "next/server";
import { parseRun } from "@/lib/orchestrator";
import { createApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
    if (!process.env.GROQ_API_KEY) {
        return NextResponse.json(
            createApiError("CONFIG_ERROR", "GROQ_API_KEY is not configured on the server."),
            { status: 503 }
        );
    }

    try {
        const body = await request.json();
        const { resumeText, jdText } = body;

        if (!resumeText || typeof resumeText !== "string" || !resumeText.trim()) {
            return NextResponse.json(
                createApiError("INVALID_REQUEST", "resumeText is required and must be a non-empty string."),
                { status: 400 }
            );
        }
        if (!jdText || typeof jdText !== "string" || !jdText.trim()) {
            return NextResponse.json(
                createApiError("INVALID_REQUEST", "jdText is required and must be a non-empty string."),
                { status: 400 }
            );
        }

        const { resumeProfile, jdProfile } = await parseRun(resumeText.trim(), jdText.trim());

        return NextResponse.json({ resumeProfile, jdProfile });
    } catch (error) {
        console.error("[POST /api/parse] Error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            createApiError("PARSE_FAILED", `Failed to parse inputs: ${message}`),
            { status: 500 }
        );
    }
}
