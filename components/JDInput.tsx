"use client";

import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Briefcase, Sparkles } from "lucide-react";

interface JDInputProps {
  value: string;
  onChange: (value: string) => void;
}

const SAMPLE_JD = `Senior Frontend Engineer at TechFuture Inc

We are looking for a Senior Frontend Engineer to develop and maintain web applications using Next.js and Tailwind CSS.

Responsibilities:
- Develop and maintain web applications using Next.js and Tailwind.
- Optimize application performance and bundle sizes.

Qualifications:
- 5+ years of experience.
- Degree in Computer Science or equivalent.
- Strong skills in React, TypeScript, Next.js, Tailwind CSS, and Testing Library.
- Preferred skills: GraphQL, Node.js.`;

export default function JDInput({ value, onChange }: JDInputProps) {
  const charCount = value.length;

  const handleLoadSample = () => {
    onChange(SAMPLE_JD);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden transition-all duration-300 border-white/10 hover:border-cyan-500/30">
      {/* Visual top border line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 to-emerald-500 opacity-60" />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
            <Briefcase className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white">Job Description</h3>
            <p className="text-xs text-muted-foreground">Paste the target job description</p>
          </div>
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleLoadSample}
          className="text-xs gap-1.5 border-white/10 text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10 hover:border-cyan-500/30"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Load Sample
        </Button>
      </div>

      <div className="relative">
        <Textarea
          placeholder="Paste the target job description here... (Responsibilities, requirements, skills, company name, etc.)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[280px] font-sans text-sm leading-relaxed bg-background/50 border-white/10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-500/30 focus-visible:border-cyan-500/50 resize-y"
        />
      </div>

      <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
        <span>Required skills & qualifications help match scores</span>
        <span className="font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded">
          {charCount.toLocaleString()} chars
        </span>
      </div>
    </div>
  );
}
