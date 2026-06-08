import { TailoringRun, TailoringRunSchema } from "./schemas";
import sampleRunAnalyzed from "./fixtures/sample-run-analyzed.json";
import sampleRunFull from "./fixtures/sample-run.json";

// Helper to simulate a network delay of 300ms - 800ms
const delay = () => {
  const ms = Math.floor(Math.random() * (800 - 300 + 1)) + 300;
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Simulates the initial analysis of a resume and job description.
 * Returns the "analyzed" state showing match scores and gap analysis.
 */
export async function mockAnalyze(
  resumeText: string,
  jdText: string
): Promise<TailoringRun> {
  await delay();

  // Validate and cast the analyzed run fixture
  const parsedRun = TailoringRunSchema.parse(sampleRunAnalyzed);

  // We can enrich the run with the user's actual text if they provided it,
  // keeping the structured data from the mock fixture.
  return {
    ...parsedRun,
    resumeProfile: {
      ...parsedRun.resumeProfile,
      summary: resumeText.trim() ? resumeText.substring(0, 100) + "..." : parsedRun.resumeProfile.summary,
    },
    status: "analyzed",
  };
}

/**
 * Simulates generating a tailored resume.
 * Returns the final "tailored" state containing side-by-side bullet comparisons.
 */
export async function mockTailor(
  currentRun: TailoringRun
): Promise<TailoringRun> {
  await delay();

  // Validate and cast the full tailored run fixture
  const parsedRun = TailoringRunSchema.parse(sampleRunFull);

  // Maintain consistency of identifiers but return the tailored results
  return {
    ...parsedRun,
    id: currentRun.id,
    status: "tailored",
  };
}
