/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */

import { extractText } from "unpdf";

// Markers for Next.js to treat as external (already handled in next.config.ts)
const mammoth = require("mammoth");

export async function extractTextFromFile(buffer: Buffer, mimeType: string): Promise<string> {
    if (mimeType === "application/pdf") {
        try {
            // Use unpdf which is serverless-compatible (doesn't require DOMMatrix)
            // unpdf requires Uint8Array, not Buffer
            const uint8Array = new Uint8Array(buffer);
            const { text } = await extractText(uint8Array);
            return Array.isArray(text) ? text.join("\n") : "";
        } catch (err: any) {
            console.error("PDF Parse error:", err);
            throw new Error(`Failed to parse PDF document: ${err?.message || "Unknown error"}`);
        }
    } else if (
        mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        mimeType === "application/msword"
    ) {
        try {
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        } catch (err) {
            console.error("Mammoth Parse error", err);
            throw new Error("Failed to parse DOCX document");
        }
    } else if (mimeType === "text/plain") {
        return buffer.toString("utf-8");
    } else {
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
}
