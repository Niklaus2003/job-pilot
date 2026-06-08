import { describe, it, expect, vi } from "vitest";

// Mock @react-pdf/renderer
vi.mock("@react-pdf/renderer", () => ({
    renderToBuffer: vi.fn(async () => Buffer.from("fake-pdf-content")),
    Document: ({ children }: any) => children,
    Page: ({ children }: any) => children,
    View: ({ children }: any) => children,
    Text: ({ children }: any) => children,
    StyleSheet: { create: (s: any) => s },
}));

import { generateTailoredResumeBuffer, generateComparisonPDFBuffer } from "./render";
import { TailoringRun } from "../schemas";

const mockRun: TailoringRun = {
    id: "test-run",
    createdAt: new Date().toISOString(),
    status: "tailored",
    resumeProfile: {
        contact: { name: "Test User" },
        summary: "Original summary",
        skills: ["Skill1"],
        experience: [],
        projects: [],
        education: [],
        certifications: [],
    },
    jdProfile: {
        jobTitle: "Test Job",
        company: "Test Co",
        seniorityLevel: "senior",
        requiredSkills: [],
        preferredSkills: [],
        responsibilities: [],
        qualifications: [],
        tools: [],
        keywords: [],
        domainSignals: [],
    },
    originalMatch: {
        overallScore: 50,
        skillCoverageScore: 50,
        responsibilityAlignmentScore: 50,
        keywordScore: 50,
        seniorityScore: 50,
        explanation: "test",
        criticalMissingRequirements: [],
    },
    tailoredMatch: {
        overallScore: 80,
        skillCoverageScore: 80,
        responsibilityAlignmentScore: 80,
        keywordScore: 80,
        seniorityScore: 80,
        explanation: "test-improved",
        criticalMissingRequirements: [],
    },
    tailoredResume: {
        tailoredSummary: "Improved summary",
        tailoredSkills: ["Skill1", "Skill2"],
        tailoredExperience: [
            {
                company: "Test Co",
                title: "Dev",
                bullets: [
                    {
                        original: "Built stuff",
                        tailored: "Built great stuff",
                        changeReason: "Better",
                        keywordsAddressed: [],
                        confidence: "high",
                    },
                ],
            },
        ],
    },
};

describe("PDF Rendering", () => {
    it("generates a buffer for tailored resume", async () => {
        const buffer = await generateTailoredResumeBuffer(mockRun);
        expect(buffer).toBeDefined();
        expect(buffer.toString()).toBe("fake-pdf-content");
    });

    it("generates a buffer for comparison PDF", async () => {
        const buffer = await generateComparisonPDFBuffer(mockRun);
        expect(buffer).toBeDefined();
        expect(buffer.toString()).toBe("fake-pdf-content");
    });
});

