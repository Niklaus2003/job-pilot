"use client";

import React from "react";
import { JobDescriptionProfile } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Award, ListChecks, CheckCircle2, ChevronRight } from "lucide-react";

interface JDSummaryProps {
  jdProfile: JobDescriptionProfile;
}

export default function JDSummary({ jdProfile }: JDSummaryProps) {
  const {
    jobTitle,
    company,
    requiredSkills = [],
    preferredSkills = [],
    responsibilities = [],
    qualifications = [],
    seniorityLevel = "mid",
  } = jdProfile;

  return (
    <Card className="glass-panel border-white/10 overflow-hidden shadow-xl">
      <CardHeader className="border-b border-white/5 pb-4 bg-white/[0.01]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white tracking-tight leading-tight">
                {jobTitle}
              </CardTitle>
              {company && (
                <p className="text-sm font-medium text-cyan-300 mt-1">
                  at {company}
                </p>
              )}
            </div>
          </div>
          <Badge className="w-fit self-start md:self-center bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 capitalize font-mono px-3 py-1 text-xs">
            <Award className="h-3 w-3 mr-1" />
            {seniorityLevel} Level
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Skills */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Required Skills
              </h4>
              {requiredSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {requiredSkills.map((skill, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="bg-slate-800/60 text-slate-200 border border-white/5 hover:border-cyan-500/30 transition-all text-xs font-normal"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">None listed</p>
              )}
            </div>

            {preferredSkills.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Preferred Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {preferredSkills.map((skill, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="bg-emerald-950/20 text-emerald-300 border border-emerald-500/10 hover:border-emerald-500/30 transition-all text-xs font-normal"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Responsibilities & Qualifications */}
          <div className="space-y-5 border-t md:border-t-0 md:border-l border-white/5 pt-5 md:pt-0 md:pl-6">
            {responsibilities.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <ListChecks className="h-4 w-4 text-cyan-400" />
                  Key Responsibilities
                </h4>
                <ul className="space-y-2">
                  {responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-start text-xs text-slate-300 leading-relaxed">
                      <ChevronRight className="h-3.5 w-3.5 text-cyan-500 shrink-0 mt-0.5 mr-1" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {qualifications.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  Qualifications
                </h4>
                <ul className="space-y-2">
                  {qualifications.map((qual, idx) => (
                    <li key={idx} className="flex items-start text-xs text-slate-300 leading-relaxed">
                      <span className="text-cyan-500 shrink-0 mr-1.5">•</span>
                      <span>{qual}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
