import { describe, it, expect } from "vitest";
import {
  ResumeProfileSchema,
  JobDescriptionProfileSchema,
  MatchScoreSchema,
  TailoredBulletSchema,
  TailoredResumeSchema,
  GapAnalysisSchema,
  TailoringRunSchema,
} from "./schemas";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------
const validResumeProfile = {
  contact: {
    name: "José Doe",
    email: "jose@example.com",
    phone: "+1-555-0199",
    location: "San Francisco, CA",
    linkedin: "https://linkedin.com/in/josedoe",
    github: "https://github.com/josedoe",
  },
  summary: "Experienced software engineer.",
  skills: ["React", "TypeScript"],
  experience: [
    {
      company: "Acme Corp",
      title: "Engineer",
      startDate: "2022-01",
      endDate: "Present",
      bullets: ["Built dashboards."],
    },
  ],
  projects: [{ name: "Portfolio", description: "My site", bullets: [] }],
  education: [
    { institution: "UC Berkeley", degree: "B.S. Computer Science", dates: "2018-2021" },
  ],
  certifications: ["AWS Certified Developer"],
};

const validJdProfile = {
  jobTitle: "Senior Frontend Engineer",
  company: "TechCo",
  requiredSkills: ["React", "TypeScript", "Next.js"],
  preferredSkills: ["GraphQL"],
  responsibilities: ["Build web apps"],
  qualifications: ["5+ years"],
  tools: ["Git", "VS Code"],
  keywords: ["frontend", "performance"],
  seniorityLevel: "senior",
  domainSignals: ["SaaS"],
};

const validMatchScore = {
  overallScore: 65,
  skillCoverageScore: 60,
  responsibilityAlignmentScore: 70,
  keywordScore: 50,
  seniorityScore: 80,
  criticalMissingRequirements: ["Next.js"],
  explanation: "Good fit but missing Next.js.",
};

// ---------------------------------------------------------------------------
// ResumeProfile
// ---------------------------------------------------------------------------
describe("ResumeProfileSchema", () => {
  it("P0-EC-001: accepts empty skills array (valid)", () => {
    const result = ResumeProfileSchema.safeParse({ ...validResumeProfile, skills: [] });
    expect(result.success).toBe(true);
  });

  it("P0-EC-001: defaults skills to [] when omitted", () => {
    const { skills: _, ...rest } = validResumeProfile;
    const result = ResumeProfileSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.skills).toEqual([]);
  });

  it("P0-EC-002: succeeds when optional contact fields are missing", () => {
    const result = ResumeProfileSchema.safeParse({
      ...validResumeProfile,
      contact: { name: "Jane" }, // only name provided
    });
    expect(result.success).toBe(true);
  });

  it("P0-EC-002: succeeds when contact itself is omitted", () => {
    const { contact: _, ...rest } = validResumeProfile;
    const result = ResumeProfileSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  it("P0-EC-007: accepts empty bullets array in experience", () => {
    const data = {
      ...validResumeProfile,
      experience: [{ company: "Acme", title: "Dev", bullets: [] }],
    };
    const result = ResumeProfileSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("P0-EC-008: preserves unicode names (José, 李明)", () => {
    const result = ResumeProfileSchema.safeParse({
      ...validResumeProfile,
      contact: { name: "李明 José" },
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.contact?.name).toBe("李明 José");
  });

  it("P0-EC-022: rejects null instead of [] for skills", () => {
    const result = ResumeProfileSchema.safeParse({ ...validResumeProfile, skills: null });
    expect(result.success).toBe(false);
  });

  it("rejects unknown extra keys (strict mode)", () => {
    const result = ResumeProfileSchema.safeParse({ ...validResumeProfile, unknownField: true });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// MatchScore
// ---------------------------------------------------------------------------
describe("MatchScoreSchema", () => {
  it("accepts valid match score", () => {
    expect(MatchScoreSchema.safeParse(validMatchScore).success).toBe(true);
  });

  it("P0-EC-003: rejects overallScore > 100", () => {
    const result = MatchScoreSchema.safeParse({ ...validMatchScore, overallScore: 150 });
    expect(result.success).toBe(false);
  });

  it("P0-EC-003: rejects overallScore < 0", () => {
    const result = MatchScoreSchema.safeParse({ ...validMatchScore, overallScore: -5 });
    expect(result.success).toBe(false);
  });

  it("P0-EC-023: rejects missing explanation", () => {
    const { explanation: _, ...rest } = validMatchScore;
    const result = MatchScoreSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("P0-EC-022: rejects null for criticalMissingRequirements", () => {
    const result = MatchScoreSchema.safeParse({
      ...validMatchScore,
      criticalMissingRequirements: null,
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// TailoredBullet
// ---------------------------------------------------------------------------
describe("TailoredBulletSchema", () => {
  const validBullet = {
    original: "Built dashboards.",
    tailored: "Built Next.js dashboards.",
    changeReason: "Aligned with JD.",
    keywordsAddressed: ["Next.js"],
    confidence: "high" as const,
  };

  it("accepts valid bullet", () => {
    expect(TailoredBulletSchema.safeParse(validBullet).success).toBe(true);
  });

  it("P0-EC-004: rejects confidence = 'High' (wrong case)", () => {
    const result = TailoredBulletSchema.safeParse({ ...validBullet, confidence: "High" });
    expect(result.success).toBe(false);
  });

  it("accepts all valid confidence values", () => {
    for (const c of ["high", "medium", "low"] as const) {
      expect(TailoredBulletSchema.safeParse({ ...validBullet, confidence: c }).success).toBe(true);
    }
  });

  it("accepts optional riskFlag and userConfirmed", () => {
    const result = TailoredBulletSchema.safeParse({
      ...validBullet,
      riskFlag: "unsupported_metric",
      userConfirmed: false,
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// GapAnalysis
// ---------------------------------------------------------------------------
describe("GapAnalysisSchema", () => {
  const validGap = {
    name: "Next.js",
    importance: "high" as const,
    jdEvidence: "Build with Next.js",
    resumeEvidence: "",
    suggestedAction: "Add Next.js project",
    canSafelyAdd: true,
  };

  it("accepts valid gap analysis", () => {
    expect(GapAnalysisSchema.safeParse({ gaps: [validGap] }).success).toBe(true);
  });

  it("P0-EC-005: rejects importance = 'critical' (invalid enum)", () => {
    const result = GapAnalysisSchema.safeParse({
      gaps: [{ ...validGap, importance: "critical" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty gaps array", () => {
    expect(GapAnalysisSchema.safeParse({ gaps: [] }).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// TailoringRun
// ---------------------------------------------------------------------------
describe("TailoringRunSchema", () => {
  const validRun = {
    id: "run-001",
    createdAt: "2026-05-21T10:00:00Z",
    resumeProfile: validResumeProfile,
    jdProfile: validJdProfile,
    originalMatch: validMatchScore,
    status: "analyzed" as const,
  };

  it("accepts a valid analyzed run (no tailoredResume)", () => {
    expect(TailoringRunSchema.safeParse(validRun).success).toBe(true);
  });

  it("P0-EC-010: rejects invalid status value", () => {
    const result = TailoringRunSchema.safeParse({ ...validRun, status: "in-progress" });
    expect(result.success).toBe(false);
  });

  it("accepts all valid status values", () => {
    for (const s of ["parsed", "analyzed", "tailored", "exported"] as const) {
      expect(TailoringRunSchema.safeParse({ ...validRun, status: s }).success).toBe(true);
    }
  });

  it("accepts optional tailoredMatch and tailoredResume being absent", () => {
    const result = TailoringRunSchema.safeParse(validRun);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tailoredMatch).toBeUndefined();
      expect(result.data.tailoredResume).toBeUndefined();
    }
  });

  it("P0-EC-022: rejects null for required id field", () => {
    const result = TailoringRunSchema.safeParse({ ...validRun, id: null });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// JobDescriptionProfile
// ---------------------------------------------------------------------------
describe("JobDescriptionProfileSchema", () => {
  it("accepts valid JD profile", () => {
    expect(JobDescriptionProfileSchema.safeParse(validJdProfile).success).toBe(true);
  });

  it("P0-EC-014: accepts JD with no company (optional)", () => {
    const { company: _, ...rest } = validJdProfile;
    expect(JobDescriptionProfileSchema.safeParse(rest).success).toBe(true);
  });

  it("rejects extra unknown keys (strict mode)", () => {
    const result = JobDescriptionProfileSchema.safeParse({ ...validJdProfile, extra: true });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Fixture validation (P0-EC-011)
// ---------------------------------------------------------------------------
describe("Fixture validation", () => {
  it("sample-run.json passes TailoringRunSchema", async () => {
    const fixture = await import("./fixtures/sample-run.json");
    const result = TailoringRunSchema.safeParse(fixture.default ?? fixture);
    expect(result.success).toBe(true);
  });

  it("sample-run-analyzed.json passes TailoringRunSchema", async () => {
    const fixture = await import("./fixtures/sample-run-analyzed.json");
    const result = TailoringRunSchema.safeParse(fixture.default ?? fixture);
    expect(result.success).toBe(true);
  });

  it("invalid payload fails TailoringRunSchema (P0-EC-021)", () => {
    const result = TailoringRunSchema.safeParse({ id: "bad", status: "unknown" });
    expect(result.success).toBe(false);
  });
});
