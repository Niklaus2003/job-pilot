"use client";

import React from "react";
import { GapAnalysis, ResumeGap } from "@/lib/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Lightbulb, ShieldCheck, ShieldAlert } from "lucide-react";

interface GapAnalysisProps {
  gapAnalysis: GapAnalysis;
}

export default function GapAnalysisComponent({ gapAnalysis }: GapAnalysisProps) {
  const gaps = gapAnalysis?.gaps || [];

  const getImportanceBadge = (importance: ResumeGap["importance"]) => {
    switch (importance) {
      case "high":
        return (
          <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-mono">
            High Priority
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono">
            Medium Priority
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
            Low Priority
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="glass-panel border-white/10 overflow-hidden shadow-xl">
      <CardHeader className="border-b border-white/5 pb-4 bg-white/[0.01]">
        <CardTitle className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          Gap Analysis & Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {gaps.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-slate-400 italic">No significant resume gaps found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {gaps.map((gap, idx) => (
              <div
                key={idx}
                className="group relative rounded-xl bg-slate-900/50 border border-white/5 hover:border-white/10 p-5 transition-all duration-300 space-y-4"
              >
                {/* Gap header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                    <h4 className="font-bold text-white text-sm tracking-tight">{gap.name}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Safety Badge */}
                    {gap.canSafelyAdd ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Safe to Add
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-800 text-slate-400 border border-white/5 text-[10px] font-mono flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3" /> Needs Review
                      </Badge>
                    )}
                    {getImportanceBadge(gap.importance)}
                  </div>
                </div>

                {/* Evidence Comparisons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950/40 p-3 rounded-lg border border-white/[0.03]">
                    <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                      Expected in Job Description:
                    </span>
                    <p className="text-slate-300 leading-relaxed italic">
                      "{gap.jdEvidence || 'Implicit expectation'}"
                    </p>
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-lg border border-white/[0.03]">
                    <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                      Found in Resume:
                    </span>
                    <p className="text-slate-400 leading-relaxed italic">
                      {gap.resumeEvidence ? `"${gap.resumeEvidence}"` : "Not detected / missing"}
                    </p>
                  </div>
                </div>

                {/* Suggested Action */}
                <div className="flex gap-2.5 items-start bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 rounded-lg p-3 transition-colors">
                  <Lightbulb className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-semibold text-indigo-300 block mb-0.5">Suggested Action:</span>
                    <p className="text-slate-300 leading-relaxed">{gap.suggestedAction}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
