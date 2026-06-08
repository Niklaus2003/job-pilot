import { describe, it, expect, vi } from "vitest";

// We test the deterministic skill-overlap logic that could be extracted,
// plus integration with the schema validation.
// Since match-engine currently delegates to LLM, we mock callLlmJson.

vi.mock("./llm", () => ({
    callLlmJson: vi.fn(),
}));

import { calculateMatchScore } from "./match-engine";
import { callLlmJson } from "./llm";
import type { ResumeProfile, JobDescriptionProfile, MatchScore } from "./schemas";

const mockedCallLlmJson = vi.mocked(callLlmJson);

const sampleResume: ResumeProfile = {
    contact: { name: "Jane Doe" },
    summary: "Full-stack engineer with TypeScript expertise.",
    skills: ["Python", "TypeScript", "React"],
    experience: [
        {
            company: "Acme Corp",
            title: "Software Engineer",
            startDate: "2022-01",
            endDate: "Present",
            bullets: ["Built APIs with Python.", "Developed React dashboards."],
        },
    ],
    projects: [],
    education: [{ institution: "MIT", degree: "B.S. CS", dates: "2018-2022" }],
    certifications: [],
};

const sampleJd: JobDescriptionProfile = {
    jobTitle: "Senior Frontend Engineer",
    company: "TechCo",
    requiredSkills: ["React", "TypeScript", "Next.js"],
    preferredSkills: ["GraphQL"],
    responsibilities: ["Build web applications"],
    qualifications: ["5+ years experience"],
    tools: ["Git"],
    keywords: ["frontend", "performance"],
    seniorityLevel: "senior",
    domainSignals: ["SaaS"],
};

const mockScoreResult: MatchScore = {
    overallScore: 65,
    skillCoverageScore: 60,
    responsibilityAlignmentScore: 70,
    keywordScore: 50,
    seniorityScore: 80,
    criticalMissingRequirements: ["Next.js"],
    explanation: "Good fit but missing Next.js.",
};

describe("calculateMatchScore", () => {
    it("returns a valid MatchScore from LLM", async () => {
        mockedCallLlmJson.mockResolvedValueOnce(mockScoreResult);

        const result = await calculateMatchScore(sampleResume, sampleJd);

        expect(result.overallScore).toBe(65);
        expect(result.criticalMissingRequirements).toContain("Next.js");
        expect(result.explanation).toBeTruthy();
    });

    it("passes resume and JD to the LLM prompt", async () => {
        mockedCallLlmJson.mockResolvedValueOnce(mockScoreResult);

        await calculateMatchScore(sampleResume, sampleJd);

        expect(mockedCallLlmJson).toHaveBeenCalledTimes(1);
        const promptArg = mockedCallLlmJson.mock.calls[0][0];
        expect(promptArg).toContain("TechCo");
        expect(promptArg).toContain("Jane Doe");
    });

    it("throws when LLM returns invalid data", async () => {
        mockedCallLlmJson.mockRejectedValueOnce(new Error("LLM_INVALID_JSON"));

        await expect(calculateMatchScore(sampleResume, sampleJd)).rejects.toThrow("LLM_INVALID_JSON");
    });
});
