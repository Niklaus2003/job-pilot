import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Split, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";
import { TailoringRun } from "@/lib/schemas";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  run: TailoringRun;
}

export default function PDFExportButton({ run }: Props) {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // Check if any low-confidence (high-risk) bullets are NOT yet confirmed
  const unconfirmedHighRiskCount = run.tailoredResume?.tailoredExperience.reduce((count, exp) => {
    return count + exp.bullets.filter(b => b.confidence === "low" && !b.userConfirmed).length;
  }, 0) || 0;

  const canExport = disclaimerAccepted && unconfirmedHighRiskCount === 0;

  const handleExport = async (format: "clean" | "comparison") => {
    if (!canExport) return;
    setIsExporting(format);
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ run, format }),
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = format === "comparison" ? `comparison-${run.id}.pdf` : `tailored-resume-${run.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Risk Alert & Disclaimer */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
        {unconfirmedHighRiskCount > 0 ? (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Review Required</p>
              <p className="leading-relaxed opacity-80">
                You have {unconfirmedHighRiskCount} high-risk bullet(s) that must be reviewed and confirmed before you can export. These bullets contain new numbers or terms not found in your original resume.
              </p>
              <button
                onClick={() => {
                  const firstBullet = document.querySelector('[id^="bullet-"]');
                  firstBullet?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="mt-2 text-amber-400 hover:text-amber-300 font-bold underline flex items-center gap-1"
              >
                Find first bullet requiring review
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs text-center justify-center">
            <ShieldCheck className="h-4 w-4" />
            <p className="font-medium">All high-risk adjustments have been reviewed.</p>
          </div>
        )}

        <div className="flex items-start space-x-3 pt-1">
          <Checkbox
            id="disclaimer"
            checked={disclaimerAccepted}
            onCheckedChange={(checked) => setDisclaimerAccepted(!!checked)}
            className="mt-1 border-white/20 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
          />
          <label
            htmlFor="disclaimer"
            className="text-[11px] leading-relaxed text-slate-400 cursor-pointer select-none"
          >
            I acknowledge that this resume was generated with AI assistance. I have verified all
            achievements, metrics, and facts are 100% truthful and I take full responsibility
            for the accuracy of this submission.
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => handleExport("clean")}
          disabled={!canExport || !!isExporting}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 px-6 py-6 rounded-xl border border-indigo-400/20 disabled:opacity-40"
        >
          {isExporting === "clean" ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          Download Tailored Resume
        </Button>

        <Button
          onClick={() => handleExport("comparison")}
          disabled={!canExport || !!isExporting}
          variant="secondary"
          className="flex-1 bg-slate-800/60 hover:bg-slate-800 border border-white/5 text-slate-100 px-6 py-6 rounded-xl backdrop-blur-sm disabled:opacity-40"
        >
          {isExporting === "comparison" ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Split className="h-4 w-4 mr-2" />
          )}
          Download Comparison PDF
        </Button>
      </div>
    </div>
  );
}


