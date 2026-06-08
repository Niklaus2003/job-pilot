import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { TailoredResumeTemplate } from "./templates/TailoredResumeTemplate";
import { ComparisonPDFTemplate } from "./templates/ComparisonPDFTemplate";
import { TailoringRun } from "../schemas";

export async function generateTailoredResumeBuffer(run: TailoringRun): Promise<Buffer> {
    if (!run.tailoredResume) throw new Error("No tailored resume in run");
    return await renderToBuffer(
        <TailoredResumeTemplate
            tailoredResume={run.tailoredResume}
            resumeProfile={run.resumeProfile}
        />
    );
}

export async function generateComparisonPDFBuffer(run: TailoringRun): Promise<Buffer> {
    return await renderToBuffer(
        <ComparisonPDFTemplate run={run} />
    );
}
