"use client";

import React, { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, Upload, Loader2 } from "lucide-react";

interface ResumeInputProps {
  value: string;
  onChange: (value: string) => void;
}

const SAMPLE_RESUME = `José Doe
jose.doe@example.com | +1-555-0199 | San Francisco, CA
LinkedIn: linkedin.com/in/josedoe | GitHub: github.com/josedoe

SUMMARY
Experienced software engineer working with Node.js and React.

EXPERIENCE
Acme Corp — Software Engineer (2022-01 to Present)
- Built React dashboards for internal tools.
- Optimized database queries in Node.js backend.

EDUCATION
University of California, Berkeley
B.S. in Computer Science (2018-2021)`;

export default function ResumeInput({ value, onChange }: ResumeInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const charCount = value.length;

  const handleLoadSample = () => {
    onChange(SAMPLE_RESUME);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Upload failed");

      onChange(data.text);
    } catch (err) {
      console.error("File upload failed", err);
      alert(err instanceof Error ? err.message : "Failed to parse file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden transition-all duration-300 border-white/10 hover:border-indigo-500/30">
      {/* Visual top border line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-cyan-500 opacity-60" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white">Your Resume</h3>
            <p className="text-xs text-muted-foreground">Paste text or upload file</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.docx,.doc,.txt"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="text-[10px] sm:text-xs gap-1.5 border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
          >
            {isUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            Upload
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLoadSample}
            className="text-[10px] sm:text-xs gap-1.5 border-white/10 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/10 hover:border-indigo-500/30"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Load Sample
          </Button>
        </div>
      </div>

      <div className="relative">
        <Textarea
          placeholder="Paste the plain text of your resume here... (Experience, skills, contact info, etc.)"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
          className="min-h-[280px] font-mono text-sm leading-relaxed bg-background/50 border-white/10 text-slate-100 placeholder:text-slate-500 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500/50 resize-y"
        />
        {isUploading && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center rounded-md z-10 transition-all">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
              <p className="text-xs font-bold text-white tracking-widest uppercase">Extracting Content...</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
        <span>Supports PDF, DOCX, and TXT</span>
        <span className="font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">
          {charCount.toLocaleString()} chars
        </span>
      </div>
    </div>
  );
}
