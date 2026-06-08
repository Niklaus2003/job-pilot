"use client";

import React from "react";
import { TailoredResume, ResumeProfile } from "@/lib/schemas";
import BulletChangeCard from "./BulletChangeCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowRight, ShieldCheck, UserCheck, Plus } from "lucide-react";

interface SideBySideDiffProps {
  tailoredResume: TailoredResume;
  originalProfile: ResumeProfile;
  onBulletUpdate?: (expIdx: number, bulletIdx: number, accepted: boolean) => void;
}

export default function SideBySideDiff({ tailoredResume, originalProfile, onBulletUpdate }: SideBySideDiffProps) {
  const { tailoredSummary, tailoredSkills = [], tailoredExperience = [] } = tailoredResume;
  const originalSummary = originalProfile.summary;
  const originalSkills = originalProfile.skills;


  // Identify added skills
  const addedSkills = tailoredSkills.filter((s) => !originalSkills.includes(s));
  const maintainedSkills = tailoredSkills.filter((s) => originalSkills.includes(s));

  return (
    <div className="space-y-6">
      {/* 1. Summary Comparison */}
      {tailoredSummary && (
        <Card className="glass-panel border-white/10 overflow-hidden shadow-xl">
          <CardHeader className="border-b border-white/5 pb-4 bg-white/[0.01]">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-indigo-400" />
              Summary Statement Alignment
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="font-semibold text-[10px] text-slate-500 uppercase tracking-wider block">
                  Original Summary
                </span>
                <div className="bg-slate-950/40 border border-white/5 rounded-lg p-4 text-xs text-slate-400 leading-relaxed min-h-[80px]">
                  {originalSummary || "No summary provided"}
                </div>
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-[10px] text-indigo-400 uppercase tracking-wider block">
                  Tailored Summary
                </span>
                <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-lg p-4 text-xs text-slate-200 leading-relaxed min-h-[80px]">
                  {tailoredSummary}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. Skills Comparison */}
      {tailoredSkills.length > 0 && (
        <Card className="glass-panel border-white/10 overflow-hidden shadow-xl">
          <CardHeader className="border-b border-white/5 pb-4 bg-white/[0.01]">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-indigo-400" />
              Skill Matrix Tailoring
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original Skills */}
              <div className="space-y-2">
                <span className="font-semibold text-[10px] text-slate-500 uppercase tracking-wider block">
                  Original Skills ({originalSkills.length})
                </span>
                <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-slate-950/40 border border-white/5 min-h-[60px]">
                  {originalSkills.map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-slate-800/60 text-slate-300 border border-white/5 text-xs font-normal">
                      {skill}
                    </Badge>
                  ))}
                  {originalSkills.length === 0 && (
                    <span className="text-xs text-slate-500 italic">No skills listed</span>
                  )}
                </div>
              </div>

              {/* Tailored Skills */}
              <div className="space-y-2">
                <span className="font-semibold text-[10px] text-indigo-400 uppercase tracking-wider block">
                  Tailored Skills ({tailoredSkills.length})
                </span>
                <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-indigo-950/10 border border-indigo-500/10 min-h-[60px]">
                  {/* Maintained Skills */}
                  {maintainedSkills.map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-slate-800/60 text-slate-300 border border-white/5 text-xs font-normal">
                      {skill}
                    </Badge>
                  ))}
                  {/* Added/Tailored Skills */}
                  {addedSkills.map((skill, idx) => (
                    <Badge key={idx} className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-medium flex items-center gap-1">
                      <Plus className="h-3 w-3" />
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. Bullet Point Adjustments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-2 pl-1">
            <UserCheck className="h-5 w-5 text-indigo-400" />
            Resume Bullet Tailoring
          </h3>
          <span className="text-xs text-slate-400">
            Review and adjust AI-generated bullets
          </span>
        </div>

        {tailoredExperience.map((exp, expIdx) => (
          <div key={expIdx} className="space-y-3">
            {/* Experience Section Title */}
            <div className="flex items-center gap-2 pl-1.5 pt-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <h4 className="font-bold text-slate-200 text-sm tracking-tight">
                {exp.company}
              </h4>
              <span className="text-slate-500 text-xs">—</span>
              <span className="text-slate-400 text-xs font-medium">{exp.title}</span>
            </div>

            {/* Bullets */}
            <div className="space-y-3">
              {exp.bullets.map((bullet, bulletIdx) => (
                <BulletChangeCard
                  key={bulletIdx}
                  bullet={bullet}
                  onAcceptToggle={(accepted) => onBulletUpdate?.(expIdx, bulletIdx, accepted)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
