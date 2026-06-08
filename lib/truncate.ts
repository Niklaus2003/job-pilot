/**
 * Truncates text while attempting to respect paragraph/section boundaries.
 */
export function truncateText(text: string, maxChars: number): string {
    if (text.length <= maxChars) return text;

    // Try to find a good breaking point near the limit
    const buffer = 200;
    const cutPoint = maxChars - buffer;
    const searchSpace = text.slice(cutPoint, maxChars);

    // Look for double newline (section break)
    const lastDoubleNewline = searchSpace.lastIndexOf("\n\n");
    if (lastDoubleNewline !== -1) {
        return text.slice(0, cutPoint + lastDoubleNewline) + "\n\n... (truncated)";
    }

    // Look for single newline
    const lastNewline = searchSpace.lastIndexOf("\n");
    if (lastNewline !== -1) {
        return text.slice(0, cutPoint + lastNewline) + "\n... (truncated)";
    }

    // Fallback to hard cut
    return text.slice(0, maxChars) + "... (truncated)";
}

export const MAX_RESUME_CHARS = parseInt(process.env.MAX_RESUME_CHARS || "50000");
export const MAX_JD_CHARS = parseInt(process.env.MAX_JD_CHARS || "30000");
