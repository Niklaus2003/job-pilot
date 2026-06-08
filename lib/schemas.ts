import { z } from "zod";

/**
 * PROJECT-WIDE SCHEMA POLICY: Strict Validation (.strict())
 * To prevent silent schema drift and handle unknown keys from future LLM updates,
 * all object schemas in this project are configured with .strict(). Any unexpected fields
 * will fail validation immediately, forcing explicit alignment between LLM prompts and schemas.
 */

// 1. Resume Profile
export const ContactSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().or(z.string().length(0)).optional(), // allow optional empty email
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
}).strict();

export const ExperienceItemSchema = z.object({
  company: z.string(),
  title: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  bullets: z.array(z.string()).default([]),
}).strict();

export const ProjectItemSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  bullets: z.array(z.string()).default([]),
}).strict();

export const EducationItemSchema = z.object({
  institution: z.string(),
  degree: z.string().optional(),
  dates: z.string().optional(),
}).strict();

export const ResumeProfileSchema = z.object({
  contact: ContactSchema.optional(),
  summary: z.string().default(""),
  skills: z.array(z.string()).default([]),
  experience: z.array(ExperienceItemSchema).default([]),
  projects: z.array(ProjectItemSchema).default([]),
  education: z.array(EducationItemSchema).default([]),
  certifications: z.array(z.string()).default([]),
}).strict();

// Types derived from ResumeProfile
export type Contact = z.infer<typeof ContactSchema>;
export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;
export type ProjectItem = z.infer<typeof ProjectItemSchema>;
export type EducationItem = z.infer<typeof EducationItemSchema>;
export type ResumeProfile = z.infer<typeof ResumeProfileSchema>;


// 2. Job Description Profile
export const JobDescriptionProfileSchema = z.object({
  jobTitle: z.string(),
  company: z.string().optional(),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  qualifications: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  seniorityLevel: z.string(),
  domainSignals: z.array(z.string()).default([]),
}).strict();

export type JobDescriptionProfile = z.infer<typeof JobDescriptionProfileSchema>;


// 3. Match Score
export const MatchScoreSchema = z.object({
  overallScore: z.number().min(0).max(100),
  skillCoverageScore: z.number().min(0).max(100),
  responsibilityAlignmentScore: z.number().min(0).max(100),
  keywordScore: z.number().min(0).max(100),
  seniorityScore: z.number().min(0).max(100),
  criticalMissingRequirements: z.array(z.string()).default([]),
  explanation: z.string(),
}).strict();

export type MatchScore = z.infer<typeof MatchScoreSchema>;


// 4. Tailored Resume / Tailored Bullets
export const TailoredBulletSchema = z.object({
  original: z.string(),
  tailored: z.string(),
  changeReason: z.string(),
  keywordsAddressed: z.array(z.string()).default([]),
  confidence: z.enum(["high", "medium", "low"]),
  riskFlag: z.string().optional(),
  userConfirmed: z.boolean().optional(),
}).strict();

export const TailoredExperienceItemSchema = z.object({
  company: z.string(),
  title: z.string(),
  bullets: z.array(TailoredBulletSchema).default([]),
}).strict();

export const TailoredResumeSchema = z.object({
  tailoredSummary: z.string().optional(),
  tailoredSkills: z.array(z.string()).optional(),
  tailoredExperience: z.array(TailoredExperienceItemSchema).default([]),
}).strict();

export type TailoredBullet = z.infer<typeof TailoredBulletSchema>;
export type TailoredExperienceItem = z.infer<typeof TailoredExperienceItemSchema>;
export type TailoredResume = z.infer<typeof TailoredResumeSchema>;


// 5. Resume Gaps / Gap Analysis
export const ResumeGapSchema = z.object({
  name: z.string(),
  importance: z.enum(["high", "medium", "low"]),
  jdEvidence: z.string(),
  resumeEvidence: z.string(),
  suggestedAction: z.string(),
  canSafelyAdd: z.boolean(),
}).strict();

export const GapAnalysisSchema = z.object({
  gaps: z.array(ResumeGapSchema).default([]),
}).strict();

export type ResumeGap = z.infer<typeof ResumeGapSchema>;
export type GapAnalysis = z.infer<typeof GapAnalysisSchema>;


// 6. Tailoring Run (Aggregate Root)
export const TailoringRunSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  resumeProfile: ResumeProfileSchema,
  jdProfile: JobDescriptionProfileSchema,
  originalMatch: MatchScoreSchema,
  tailoredMatch: MatchScoreSchema.optional(),
  gapAnalysis: GapAnalysisSchema.optional(),
  tailoredResume: TailoredResumeSchema.optional(),
  status: z.enum(["parsed", "analyzed", "tailored", "exported"]),
  metadata: z.object({
    resumeSource: z.enum(["text", "pdf", "docx"]),
    jdSource: z.enum(["paste"]),
  }).strict().optional(),
}).strict();

export type TailoringRun = z.infer<typeof TailoringRunSchema>;
