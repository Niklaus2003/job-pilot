import { NextRequest, NextResponse } from "next/server";
import { extractTextFromFile } from "@/lib/file-parser";
import { createApiError } from "@/lib/api-error";

// The 'config' export is for Pages Router and is deprecated in App Router.
// App Router routes automatically handle multipart/form-data.

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                createApiError("INVALID_REQUEST", "No file uploaded"),
                { status: 400 }
            );
        }

        // 5MB Limit
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                createApiError("INVALID_REQUEST", "File too large (max 5MB)"),
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const text = await extractTextFromFile(buffer, file.type || "application/pdf");

        if (!text || text.trim().length === 0) {
            return NextResponse.json(
                createApiError("PARSE_FAILED", "Could not extract text from file"),
                { status: 422 }
            );
        }

        return NextResponse.json({ text: text.trim() });
    } catch (error) {
        console.error("[POST /api/upload] Error:", error);
        return NextResponse.json(
            createApiError("PARSE_FAILED", "Internal error during file parsing"),
            { status: 500 }
        );
    }
}
