import { ResumeProfile, TailoredBullet } from "./schemas";

/**
 * Validates a tailored bullet point against the original resume to detect hallucinations.
 * Returns the updated bullet with risk flags and adjusted confidence.
 */
export function validateBullet(
    originalBullet: string,
    tailoredBullet: string,
    resumeProfile: ResumeProfile
): { riskFlag?: string; confidence: "high" | "medium" | "low" } {
    let riskFlag: string | undefined = undefined;
    let confidence: "high" | "medium" | "low" = "high";

    // 1. New Metrics Detection
    const metricRegex = /(\d+(?:\.\d+)?%|\d{2,}(?:\+)?(?!\d))/g;
    const originalMetrics = (originalBullet.match(metricRegex) || []) as string[];
    const tailoredMetrics = (tailoredBullet.match(metricRegex) || []) as string[];

    const newMetrics = tailoredMetrics.filter(m => !originalMetrics.includes(m));

    if (newMetrics.length > 0) {
        riskFlag = `unsupported_metric: detected new numbers (${newMetrics.join(", ")})`;
        confidence = "low";
    }

    // 2. New Tools/Skills Detection
    const capitalizedWords = tailoredBullet.match(/\b[A-Z][a-zA-Z0-9+#.]*\b/g) || [];
    const sourceText = (originalBullet + " " + resumeProfile.skills.join(" ")).toLowerCase();

    const unknownTerms = capitalizedWords.filter(word => {
        if (word.length < 2) return false;
        if (sourceText.includes(word.toLowerCase())) return false;
        return true;
    });

    if (unknownTerms.length > 0 && !riskFlag) {
        riskFlag = `unsupported_skill: detected terms not found in profile (${unknownTerms.slice(0, 3).join(", ")})`;
        confidence = "medium";
    }

    // 3. Keyword Density / Length Check
    if (tailoredBullet.length > originalBullet.length * 2.5) {
        riskFlag = "excessive_expansion: bullet grew significantly, verify precision";
        confidence = "medium";
    }

    return { riskFlag, confidence };
}

/**
 * Bulk validation for an experience item's bullets.
 */
export function validateExperienceBullets(
    experience: { company: string; title: string; bullets: TailoredBullet[] },
    resumeProfile: ResumeProfile
): TailoredBullet[] {
    return experience.bullets.map(b => {
        const { riskFlag, confidence } = validateBullet(b.original, b.tailored, resumeProfile);
        const isLow = confidence === "low" || b.confidence === "low";
        return {
            ...b,
            riskFlag: b.riskFlag || riskFlag,
            confidence: isLow ? "low" :
                (confidence === "medium" || b.confidence === "medium" ? "medium" : "high"),
            userConfirmed: b.userConfirmed !== undefined ? b.userConfirmed : !isLow
        };
    });
}
