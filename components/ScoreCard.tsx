"use client";

import React from "react";
import { MatchScore } from "@/lib/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";

interface ScoreCardProps {
  originalScore: MatchScore;
  tailoredScore?: MatchScore;
}

export default function ScoreCard({ originalScore, tailoredScore }: ScoreCardProps) {
  const isCompared = !!tailoredScore;
  const currentScore = tailoredScore || originalScore;

  // SVG parameters for radial gauge
  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  const getStrokeColor = (score: number) => {
    if (score >= 80) return "url(#emeraldGradient)";
    if (score >= 60) return "url(#cyanGradient)";
    return "url(#amberGradient)";
  };

  const getRadialGauge = (score: number, label: string, gradientId: string, gradientColors: { start: string, end: string }) => {
    const strokeDashoffset = circumference - (score / 100) * circumference;
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="relative w-32 h-32">
          {/* Radial SVG */}
          <svg className="w-full h-full transform -rotate-90">
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={gradientColors.start} />
                <stop offset="100%" stopColor={gradientColors.end} />
              </linearGradient>
              {/* Drop shadow for glow */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {/* Background circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              className="stroke-slate-800/80"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Foreground circle with glow */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke={getStrokeColor(score)}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{ filter: "drop-shadow(0px 0px 6px rgba(0,229,255,0.15))" }}
            />
          </svg>
          {/* Inner score label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black tracking-tight text-white">{score}%</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{label}</span>
          </div>
        </div>
      </div>
    );
  };

  // Compare helper for progress bar
  const renderSubscoreRow = (
    title: string,
    origVal: number,
    tailVal?: number
  ) => {
    return (
      <div className="space-y-1.5 py-2 border-b border-white/5 last:border-0">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-300 font-medium">{title}</span>
          <div className="flex items-center gap-2 font-mono">
            {tailVal !== undefined ? (
              <>
                <span className="text-slate-500 line-through">{origVal}%</span>
                <ChevronRight className="h-3 w-3 text-cyan-400" />
                <span className="text-cyan-400 font-bold">{tailVal}%</span>
              </>
            ) : (
              <span className="text-indigo-400 font-semibold">{origVal}%</span>
            )}
          </div>
        </div>
        <div className="relative h-2 w-full bg-slate-800/50 rounded-full overflow-hidden">
          {tailVal !== undefined ? (
            <>
              {/* Original bar (background track highlight) */}
              <div
                className="absolute top-0 left-0 h-full bg-slate-600 rounded-full transition-all duration-500"
                style={{ width: `${origVal}%` }}
              />
              {/* Tailored bar (layered on top) */}
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${tailVal}%` }}
              />
            </>
          ) : (
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-1000"
              style={{ width: `${origVal}%` }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="glass-panel border-white/10 overflow-hidden shadow-xl">
      <CardHeader className="border-b border-white/5 pb-4 bg-white/[0.01]">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-400" />
            Match Analysis
          </CardTitle>
          {isCompared && (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
              +{tailoredScore.overallScore - originalScore.overallScore}% Increase
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Radial Gauges Grid */}
        <div className="flex flex-col sm:flex-row justify-around items-center gap-6 bg-slate-900/40 rounded-2xl p-4 border border-white/5">
          {getRadialGauge(
            originalScore.overallScore,
            isCompared ? "Original" : "Match Score",
            "amberGradient",
            { start: "#f59e0b", end: "#f97316" }
          )}

          {isCompared &&
            getRadialGauge(
              tailoredScore.overallScore,
              "Tailored",
              "emeraldGradient",
              { start: "#06b6d4", end: "#10b981" }
            )}
        </div>

        {/* Subscores */}
        <div className="space-y-1">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Detailed Metrics
          </h4>
          {renderSubscoreRow(
            "Skill Alignment & Coverage",
            originalScore.skillCoverageScore,
            tailoredScore?.skillCoverageScore
          )}
          {renderSubscoreRow(
            "Responsibility Matching",
            originalScore.responsibilityAlignmentScore,
            tailoredScore?.responsibilityAlignmentScore
          )}
          {renderSubscoreRow(
            "Keyword Enrichment",
            originalScore.keywordScore,
            tailoredScore?.keywordScore
          )}
          {renderSubscoreRow(
            "Seniority Compatibility",
            originalScore.seniorityScore,
            tailoredScore?.seniorityScore
          )}
        </div>

        {/* Explanation text */}
        <div className="rounded-xl bg-white/[0.02] p-4 border border-white/5 space-y-2">
          <h5 className="text-xs font-semibold text-slate-300">Analysis Summary</h5>
          <p className="text-xs text-slate-400 leading-relaxed">
            {currentScore.explanation}
          </p>
        </div>

        {/* Critical Missing Requirements */}
        {currentScore.criticalMissingRequirements.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Critical Gaps Detected ({currentScore.criticalMissingRequirements.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentScore.criticalMissingRequirements.map((req, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-300 border border-amber-500/20"
                >
                  {req}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>All Critical Requirements Addressed</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
