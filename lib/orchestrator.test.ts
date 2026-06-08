import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock all domain services
vi.mock("./resume-parser", () => ({
    parseResume: vi.fn(),
}));
vi.mock("./jd-parser", () => ({
    parseJobDescription: vi.fn(),
}));
vi.mock("./match-engine", () => ({
    calculateMatchScore: vi.fn(),
}));
vi.mock("./gap-engine", () => ({
    performGapAnalysis: vi.fn(),
}));
vi.mock("./tailoring-engine", () => ({
    tailorResume: vi.fn(),
}));

import { parseRun, analyzeRun, tailorRun } from "./orchestrator";
import { parseResume } from "./resume-parser";
import { parseJobDescription } from "./jd-parser";
import { calculateMatchScore } from "./match-engine";
import { performGapAnalysis } from "./gap-engine";
import { tailorResume } from "./tailoring-engine";
import type { ResumeProfile, JobDescriptionProfile, MatchScore, GapAnalysis, TailoredResume } from "./schemas";

const mockedParseResume = vi.mocked(parseResume);
const mockedParseJD = vi.mocked(parseJobDescription);
const mockedScore = vi.mocked(calculateMatchScore);
const mockedGap = vi.mocked(performGapAnalysis);
const mockedTailor = vi.mocked(tailorResume);

const fakeResume: ResumeProfile = {
    summary: "Engineer",
    skills: ["React"],
    experience: [{ company: "Acme", title: "Dev", bullets: ["Built stuff."] }],
    projects: [],
    education: [{ institution: "MIT" }],
    certifications: [],
};

const fakeJd: JobDescriptionProfile = {
    jobTitle: "Frontend Engineer",
    requiredSkills: ["React", "TypeScript"],
    preferredSkills: [],
    responsibilities: ["Build UIs"],
    qualifications: ["3+ years"],
    tools: ["Git"],
    keywords: ["frontend"],
    seniorityLevel: "mid",
    domainSignals: [],
};

const fakeScore: MatchScore = {
    overallScore: 60,
    skillCoverageScore: 50,
    responsibilityAlignmentScore: 70,
    keywordScore: 40,
    seniorityScore: 80,
    criticalMissingRequirements: ["TypeScript"],
    explanation: "Missing TypeScript",
};

const fakeGap: GapAnalysis = {
    gaps: [
        {
            name: "TypeScript",
            importance: "high",
            jdEvidence: "Required",
            resumeEvidence: "",
            suggestedAction: "Add if experienced",
            canSafelyAdd: false,
        },
    ],
};

const fakeTailoredResume: TailoredResume = {
    tailoredSummary: "Frontend engineer with React expertise.",
    tailoredSkills: ["React", "TypeScript"],
    tailoredExperience: [
        {
            company: "Acme",
            title: "Dev",
            bullets: [
                {
                    original: "Built stuff.",
                    tailored: "Built responsive React UIs.",
                    changeReason: "Aligned with JD",
                    keywordsAddressed: ["React"],
                    confidence: "high",
                },
            ],
        },
    ],
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe("parseRun", () => {
    it("calls both parsers and returns profiles", async () => {
        mockedParseResume.mockResolvedValueOnce(fakeResume);
        mockedParseJD.mockResolvedValueOnce(fakeJd);

        const result = await parseRun("resume text", "jd text");

        expect(result.resumeProfile).toEqual(fakeResume);
        expect(result.jdProfile).toEqual(fakeJd);
        expect(mockedParseResume).toHaveBeenCalledWith("resume text");
        expect(mockedParseJD).toHaveBeenCalledWith("jd text");
    });
});

describe("analyzeRun", () => {
    it("returns a run with analyzed status, score, and gaps", async () => {
        mockedScore.mockResolvedValueOnce(fakeScore);
        mockedGap.mockResolvedValueOnce(fakeGap);

        const result = await analyzeRun(fakeResume, fakeJd);

        expect(result.status).toBe("analyzed");
        expect(result.originalMatch.overallScore).toBe(60);
        expect(result.gapAnalysis?.gaps).toHaveLength(1);
        expect(result.id).toMatch(/^run-/);
        expect(result.createdAt).toBeTruthy();
    });
});

describe("tailorRun", () => {
    it("tailors resume and re-scores", async () => {
        mockedTailor.mockResolvedValueOnce(fakeTailoredResume);
        mockedScore.mockResolvedValueOnce({ ...fakeScore, overallScore: 82 });

        const result = await tailorRun(fakeResume, fakeJd, fakeGap);

        expect(result.tailoredResume.tailoredSummary).toBe("Frontend engineer with React expertise.");
        expect(result.tailoredMatch.overallScore).toBe(82);
        expect(mockedTailor).toHaveBeenCalledWith(fakeResume, fakeJd, fakeGap);
    });

    it("works without gapAnalysis", async () => {
        mockedTailor.mockResolvedValueOnce(fakeTailoredResume);
        mockedScore.mockResolvedValueOnce({ ...fakeScore, overallScore: 75 });

        const result = await tailorRun(fakeResume, fakeJd);

        expect(result.tailoredResume).toBeDefined();
        expect(result.tailoredMatch.overallScore).toBe(75);
    });
});
