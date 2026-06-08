"use client";

import React from "react";
import { Info } from "lucide-react";

export default function DisclaimerBanner() {
  return (
    <div className="w-full bg-slate-950/40 border-t border-white/5 py-4 px-4 backdrop-blur-sm mt-8">
      <div className="mx-auto max-w-7xl flex items-center justify-center gap-2.5 text-center">
        <Info className="h-4 w-4 text-indigo-400 shrink-0" />
        <p className="text-[11px] sm:text-xs text-slate-400 leading-normal max-w-3xl">
          <span className="font-semibold text-slate-300">Disclaimer:</span> Resume Shapeshifter uses advanced language models to analyze and optimize your resume. AI recommendations are suggestions; please carefully verify all edited experiences and dates to ensure they remain completely factual before applying to jobs.
        </p>
      </div>
    </div>
  );
}
