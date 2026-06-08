"use client";

import React, { useState, useEffect } from "react";
import { useTailoringRun } from "@/lib/hooks/useTailoringRun";
import type { TailoringRun } from "@/lib/schemas";
import ResumeInput from "@/components/ResumeInput";
import JDInput from "@/components/JDInput";
import JDSummary from "@/components/JDSummary";
import ScoreCard from "@/components/ScoreCard";
import GapAnalysisComponent from "@/components/GapAnalysis";
import SideBySideDiff from "@/components/SideBySideDiff";
import PDFExportButton from "@/components/PDFExportButton";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles,
  RefreshCw,
  Compass,
  RotateCcw,
  ArrowRight,
  Sparkle,
  CheckCircle2,
  FileCheck
} from "lucide-react";

export default function TailorWorkspace() {
  const {
    run,
    setRun,
    reset,
    status,
    isLoaded,
    isIdle,
    isAnalyzed,
    isTailored,
  } = useTailoringRun();

  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Synchronize inputs with sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedResume = sessionStorage.getItem("raw_resume_text");
      const savedJd = sessionStorage.getItem("raw_jd_text");
      if (savedResume) setResumeText(savedResume);
      if (savedJd) setJdText(savedJd);
    }
  }, []);

  const handleResumeChange = (val: string) => {
    setResumeText(val);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("raw_resume_text", val);
    }
  };

  const handleJdChange = (val: string) => {
    setJdText(val);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("raw_jd_text", val);
    }
  };

  const handleReset = () => {
    reset();
    setResumeText("");
    setJdText("");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("raw_resume_text");
      sessionStorage.removeItem("raw_jd_text");
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jdText.trim()) return;
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: resumeText.trim(), jdText: jdText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || "Analysis failed");
      }
      const result: TailoringRun = {
        id: data.runId,
        createdAt: data.createdAt,
        resumeProfile: data.resumeProfile,
        jdProfile: data.jdProfile,
        originalMatch: data.originalMatch,
        gapAnalysis: data.gapAnalysis,
        status: "analyzed",
      };
      setRun(result);
    } catch (err) {
      console.error("Analysis failed", err);
      setErrorMessage(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTailor = async () => {
    if (!run) return;
    setIsTailoring(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId: run.id,
          resumeProfile: run.resumeProfile,
          jdProfile: run.jdProfile,
          gapAnalysis: run.gapAnalysis,
          originalMatch: run.originalMatch,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || "Tailoring failed");
      }
      setRun({
        ...run,
        tailoredResume: data.tailoredResume,
        tailoredMatch: data.tailoredMatch,
        status: "tailored",
      });
    } catch (err) {
      console.error("Tailoring failed", err);
      setErrorMessage(err instanceof Error ? err.message : "Tailoring failed. Please try again.");
    } finally {
      setIsTailoring(false);
    }
  };

  const handleBulletUpdate = (expIdx: number, bulletIdx: number, userConfirmed: boolean) => {
    if (!run || !run.tailoredResume) return;

    const newExperience = [...run.tailoredResume.tailoredExperience];
    newExperience[expIdx].bullets[bulletIdx] = {
      ...newExperience[expIdx].bullets[bulletIdx],
      userConfirmed
    };

    setRun({
      ...run,
      tailoredResume: {
        ...run.tailoredResume,
        tailoredExperience: newExperience
      }
    });
  };

  const isInputEmpty = !resumeText.trim() || !jdText.trim();

  // Helper for Stepper UI
  const getStepStatus = (step: number) => {
    if (step === 1) {
      if (isAnalyzed || isTailored) return "completed";
      if (!isInputEmpty) return "active";
      return "pending";
    }
    if (step === 2) {
      if (isTailored) return "completed";
      if (isAnalyzed || isAnalyzing) return "active";
      return "pending";
    }
    if (step === 3) {
      if (isTailored) return "active";
      return "pending";
    }
    return "pending";
  };

  const renderStepIcon = (step: number) => {
    const stepStatus = getStepStatus(step);
    if (stepStatus === "completed") {
      return (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold">
          ✓
        </span>
      );
    }
    if (stepStatus === "active") {
      return (
        <span className="flex h-6 w-6 animate-pulse items-center justify-center rounded-full bg-indigo-500 text-white text-xs font-bold shadow-[0_0_8px_rgba(99,102,241,0.5)]">
          {step}
        </span>
      );
    }
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-slate-500 text-xs font-bold border border-white/5">
        {step}
      </span>
    );
  };

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Workspace Subheading / Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Tailoring Workspace</h2>
          <p className="text-xs text-slate-400 mt-1">
            Build, measure, and optimize your application materials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(status !== "idle" || resumeText || jdText) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs border-white/10 hover:bg-slate-900 text-slate-300 gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Workspace
            </Button>
          )}
        </div>
      </div>

      {/* Stepper Wizard Indicator */}
      <div className="grid grid-cols-3 max-w-3xl mx-auto w-full gap-4 py-2 border border-white/5 bg-slate-900/30 rounded-2xl px-6">
        <div className="flex items-center gap-2">
          {renderStepIcon(1)}
          <span className="text-xs font-semibold text-slate-300">1. Paste Inputs</span>
        </div>
        <div className="flex items-center gap-2">
          {renderStepIcon(2)}
          <span className="text-xs font-semibold text-slate-300">2. Analyze Fit</span>
        </div>
        <div className="flex items-center gap-2">
          {renderStepIcon(3)}
          <span className="text-xs font-semibold text-slate-300">3. Tailor Bullet points</span>
        </div>
      </div>

      {/* SECTION 1: Input stage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResumeInput value={resumeText} onChange={handleResumeChange} />
        <JDInput value={jdText} onChange={handleJdChange} />
      </div>
      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-950/40 border border-red-500/20 text-red-300 text-sm">
          <span className="shrink-0">⚠️</span>
          <span className="flex-1">{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-200 text-xs font-bold">✕</button>
        </div>
      )}

      {/* Action Button: Analyze */}
      {isIdle && (
        <div className="flex justify-center pt-2">
          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={isInputEmpty || isAnalyzing}
            className="w-full sm:w-64 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white font-bold tracking-wide hover:opacity-90 shadow-lg shadow-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-xl"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4.5 w-4.5 animate-spin mr-2" />
                Analyzing Match...
              </>
            ) : (
              <>
                <Compass className="h-4.5 w-4.5 mr-2" />
                Analyze Match Score
              </>
            )}
          </Button>
        </div>
      )}

      {/* SECTION 2: Skeletons for Analysis */}
      {isAnalyzing && (
        <div className="space-y-6 pt-4 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="glass-panel rounded-2xl p-6 space-y-4">
                <Skeleton className="h-8 w-1/3 bg-slate-800" />
                <Skeleton className="h-4 w-2/3 bg-slate-800" />
                <hr className="border-white/5" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-slate-800" />
                  <Skeleton className="h-4 w-full bg-slate-800" />
                  <Skeleton className="h-4 w-5/6 bg-slate-800" />
                </div>
              </div>
            </div>
            <div>
              <div className="glass-panel rounded-2xl p-6 space-y-4">
                <Skeleton className="h-8 w-1/2 bg-slate-800" />
                <div className="flex justify-center">
                  <Skeleton className="h-28 w-28 rounded-full bg-slate-800" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full bg-slate-800" />
                  <Skeleton className="h-3 w-4/5 bg-slate-800" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Analysis Results */}
      {run && (isAnalyzed || isTailored) && !isAnalyzing && (
        <div className="space-y-8 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
              <JDSummary jdProfile={run.jdProfile} />
            </div>
            <div>
              <ScoreCard
                originalScore={run.originalMatch}
                tailoredScore={run.tailoredMatch}
              />
            </div>
          </div>

          {run.gapAnalysis && (
            <GapAnalysisComponent gapAnalysis={run.gapAnalysis} />
          )}

          {/* Action Button: Tailor */}
          {isAnalyzed && (
            <div className="flex flex-col items-center justify-center gap-4 py-8 border-t border-b border-white/5 bg-indigo-950/10 rounded-2xl px-6">
              <div className="text-center space-y-1 max-w-md">
                <h4 className="font-bold text-white text-base">Generate Optimized Content</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Our AI engine will restructure your achievements to weave in required keywords and close the match gaps while preserving accuracy.
                </p>
              </div>

              <Button
                size="lg"
                onClick={handleTailor}
                disabled={isTailoring}
                className="w-full sm:w-72 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 text-white font-bold tracking-wide hover:opacity-90 shadow-lg shadow-cyan-500/10 disabled:opacity-50 transition-all rounded-xl"
              >
                {isTailoring ? (
                  <>
                    <RefreshCw className="h-4.5 w-4.5 animate-spin mr-2" />
                    Shapeshifting Bullet Points...
                  </>
                ) : (
                  <>
                    <Sparkle className="h-4.5 w-4.5 mr-2 animate-bounce" />
                    Generate Tailored Resume
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: Skeletons for Tailoring */}
      {isTailoring && (
        <div className="space-y-6 pt-4">
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <Skeleton className="h-6 w-1/4 bg-slate-800" />
            <Skeleton className="h-24 w-full bg-slate-800" />
            <Skeleton className="h-24 w-full bg-slate-800" />
          </div>
        </div>
      )}

      {/* SECTION 5: Tailored Review */}
      {run && isTailored && !isTailoring && (
        <div className="space-y-8 pt-4">
          {run.tailoredResume && (
            <SideBySideDiff
              tailoredResume={run.tailoredResume}
              originalProfile={run.resumeProfile}
              onBulletUpdate={handleBulletUpdate}
            />
          )}

          {/* SECTION 6: Export Actions */}
          <div className="glass-panel border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-60" />

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Tailoring Phase Complete!</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
                  Your resume has been optimized from {run.originalMatch.overallScore}% to {run.tailoredMatch?.overallScore}%. You can now export the tailored resume or a comparison report.
                </p>
              </div>
            </div>

            <PDFExportButton run={run} />
          </div>
        </div>
      )}

      <DisclaimerBanner />
    </div>
  );
}
