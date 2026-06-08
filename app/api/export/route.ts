import { NextRequest, NextResponse } from "next/server";
import { generateTailoredResumeBuffer, generateComparisonPDFBuffer } from "@/lib/pdf/render";
import { TailoringRunSchema } from "@/lib/schemas";
import { createApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { run, format } = body;

        const validatedRun = TailoringRunSchema.safeParse(run);
        if (!validatedRun.success) {
            return NextResponse.json(
                createApiError("INVALID_REQUEST", "Invalid run data", validatedRun.error.issues),
                { status: 400 }
            );
        }

        let buffer: Buffer;
        let filename: string;

        if (format === "comparison") {
            buffer = await generateComparisonPDFBuffer(validatedRun.data);
            filename = `comparison-${validatedRun.data.id}.pdf`;
        } else {
            buffer = await generateTailoredResumeBuffer(validatedRun.data);
            filename = `tailored-resume-${validatedRun.data.id}.pdf`;
        }

        return new NextResponse(buffer as any, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("[POST /api/export] Error:", error);
        return NextResponse.json(
            createApiError("EXPORT_FAILED", "Failed to generate PDF"),
            { status: 500 }
        );
    }
}
