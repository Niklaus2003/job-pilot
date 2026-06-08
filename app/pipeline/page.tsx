"use client";

import React, { useState, useEffect } from "react";
import { 
  Layers, 
  MapPin, 
  DollarSign, 
  Link as LinkIcon, 
  ArrowRight, 
  Sparkles, 
  Mail, 
  Send, 
  FileText, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Trash2,
  AlertTriangle,
  PenTool,
  Check,
  RotateCcw,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ScoreCard from "@/components/ScoreCard";
import GapAnalysisComponent from "@/components/GapAnalysis";
import SideBySideDiff from "@/components/SideBySideDiff";
import PDFExportButton from "@/components/PDFExportButton";

const STATUSES = [
  { key: "discovered", label: "Discovered", color: "border-slate-500/20 text-slate-400 bg-slate-900/10" },
  { key: "tailored", label: "Resume Tailored", color: "border-indigo-500/20 text-indigo-400 bg-indigo-950/10" },
  { key: "drafted", label: "Outreach Drafted", color: "border-cyan-500/20 text-cyan-400 bg-cyan-950/10" },
  { key: "sent", label: "Outreach Sent", color: "border-emerald-500/20 text-emerald-400 bg-emerald-950/10" },
  { key: "replied", label: "Replied / Rejected", color: "border-purple-500/20 text-purple-400 bg-purple-950/10" }
];

function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function PipelinePage() {
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "tailor" | "outreach">("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // Recipient input states
  const [recipient, setRecipient] = useState({
    recipient_name: "",
    recipient_email: "",
    personalization_note: ""
  });
  const [isSavingRecipient, setIsSavingRecipient] = useState(false);

  // Tailoring flow states
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailoringError, setTailoringError] = useState<string | null>(null);

  // Email generation & sending states
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [isDispatchingEmail, setIsDispatchingEmail] = useState<string | null>(null); // "send" | "draft" | "skip"
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const fetchPipeline = async () => {
    try {
      const res = await fetch("/api/backend/pipeline");
      if (res.ok) {
        const data = await res.json();
        setPipeline(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/backend/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        if (data.base_resume_text) {
          setResumeText(data.base_resume_text);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchPipeline(), fetchProfile()]);
      setIsLoading(false);
    };
    init();
  }, []);

  // Sync recipient state when selected card changes
  useEffect(() => {
    if (selectedCard) {
      setRecipient({
        recipient_name: selectedCard.recipient_name || "",
        recipient_email: selectedCard.recipient_email || "",
        personalization_note: selectedCard.personalization_note || ""
      });
      // Try to load job description contents. Let's see if JD matches title or URL.
      setJdText(`Job Title: ${selectedCard.title}\nCompany: ${selectedCard.company}\nLocation: ${selectedCard.location}\nSalary: ${selectedCard.salary}\nJob URL: ${selectedCard.url}\n\n[Paste full Job Description text here for comprehensive tailoring and analysis]`);
      
      // Load card email values
      setEmailSubject(selectedCard.outreach_subject || "");
      setEmailBody(selectedCard.outreach_body || "");
      setEmailError(selectedCard.outreach_error || null);
      setEmailStatus(selectedCard.outreach_status || null);
    }
  }, [selectedCard]);

  const updateCardStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/backend/pipeline/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (res.ok) {
        fetchPipeline();
        if (selectedCard && selectedCard.id === id) {
          setSelectedCard((prev: any) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveRecipient = async () => {
    if (!selectedCard) return;
    setIsSavingRecipient(true);
    try {
      const res = await fetch("/api/backend/pipeline/update-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedCard.id,
          recipient_name: recipient.recipient_name.trim(),
          recipient_email: recipient.recipient_email.trim(),
          personalization_note: recipient.personalization_note.trim()
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedCard(data.card);
        fetchPipeline();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingRecipient(false);
    }
  };

  // Next.js API based Resume Tailoring inside the Card Modal
  const handleAnalyzeResume = async () => {
    if (!selectedCard || !resumeText.trim() || !jdText.trim()) return;
    setIsAnalyzing(true);
    setTailoringError(null);
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

      // Save analysis results back to FastAPI database
      const updateRes = await fetch("/api/backend/pipeline/update-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedCard.id,
          match_score: data.originalMatch.overallScore,
          gap_analysis: data.gapAnalysis,
          tailored_resume_text: null,
          tailored_bullets: null
        })
      });

      if (updateRes.ok) {
        const updated = await updateRes.json();
        // Construct a pseudo run schema for circular display helper
        const pseudoRun = {
          id: data.runId,
          createdAt: data.createdAt,
          resumeProfile: data.resumeProfile,
          jdProfile: data.jdProfile,
          originalMatch: data.originalMatch,
          gapAnalysis: data.gapAnalysis,
          status: "analyzed"
        };
        setSelectedCard((prev: any) => ({
          ...prev,
          ...updated.card,
          // Attach Next.js run parameters dynamically
          resumeProfile: data.resumeProfile,
          jdProfile: data.jdProfile,
          originalMatch: data.originalMatch,
          runId: data.runId
        }));
        
        // Update status to tailored/analyzed
        await updateCardStatus(selectedCard.id, "discovered");
        fetchPipeline();
      }
    } catch (err) {
      console.error(err);
      setTailoringError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTailorResume = async () => {
    if (!selectedCard || !selectedCard.runId) return;
    setIsTailoring(true);
    setTailoringError(null);
    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId: selectedCard.runId,
          resumeProfile: selectedCard.resumeProfile,
          jdProfile: selectedCard.jdProfile,
          gapAnalysis: selectedCard.gap_analysis,
          originalMatch: selectedCard.originalMatch,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || "Tailoring failed");
      }

      // Save tailored bullets back to FastAPI
      const updateRes = await fetch("/api/backend/pipeline/update-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedCard.id,
          match_score: data.tailoredMatch?.overallScore || selectedCard.match_score,
          tailored_resume_text: data.tailoredResume?.tailoredSummary || "",
          tailored_bullets: data.tailoredResume?.tailoredExperience || []
        })
      });

      if (updateRes.ok) {
        const updated = await updateRes.json();
        setSelectedCard((prev: any) => ({
          ...prev,
          ...updated.card,
          tailoredResume: data.tailoredResume,
          tailoredMatch: data.tailoredMatch
        }));

        await updateCardStatus(selectedCard.id, "tailored");
        fetchPipeline();
      }
    } catch (err) {
      console.error(err);
      setTailoringError(err instanceof Error ? err.message : "Tailoring failed.");
    } finally {
      setIsTailoring(false);
    }
  };

  const handleBulletUpdate = (expIdx: number, bulletIdx: number, userConfirmed: boolean) => {
    if (!selectedCard || !selectedCard.tailored_bullets) return;

    const newExperience = [...selectedCard.tailored_bullets];
    newExperience[expIdx].bullets[bulletIdx] = {
      ...newExperience[expIdx].bullets[bulletIdx],
      userConfirmed
    };

    setSelectedCard((prev: any) => ({
      ...prev,
      tailored_bullets: newExperience
    }));

    // Update on the backend
    fetch("/api/backend/pipeline/update-card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedCard.id,
        tailored_bullets: newExperience
      })
    });
  };

  // Cold Outreach Generation and Send
  const handleGenerateOutreach = async () => {
    if (!selectedCard) return;
    setIsGeneratingEmail(true);
    setEmailError(null);
    try {
      const res = await fetch("/api/backend/outreach/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedCard.id, status: selectedCard.status })
      });
      if (res.ok) {
        const data = await res.json();
        setEmailSubject(data.subject);
        setEmailBody(data.body);
        
        // Update selected card state
        setSelectedCard((prev: any) => ({
          ...prev,
          outreach_subject: data.subject,
          outreach_body: data.body,
          status: "drafted"
        }));
        fetchPipeline();
      } else {
        const errData = await res.json();
        setEmailError(errData.detail || "Email generation failed.");
      }
    } catch (err) {
      console.error(err);
      setEmailError("Failed to communicate with outreach API.");
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const handleSendOutreach = async (mode: "send" | "draft" | "skip") => {
    if (!selectedCard) return;
    setIsDispatchingEmail(mode);
    setEmailError(null);
    try {
      // Save composer edits first
      await fetch("/api/backend/pipeline/update-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedCard.id,
          outreach_subject: emailSubject.trim(),
          outreach_body: emailBody.trim()
        })
      });

      const res = await fetch("/api/backend/outreach/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedCard.id,
          subject: emailSubject.trim(),
          body: emailBody.trim(),
          mode
        })
      });

      if (res.ok) {
        const data = await res.json();
        setEmailStatus(mode === "send" ? "sent" : mode === "draft" ? "drafted" : "skipped");
        
        // Update local selectedCard
        setSelectedCard((prev: any) => ({
          ...prev,
          outreach_status: mode === "send" ? "sent" : mode === "draft" ? "drafted" : "skipped",
          status: mode === "send" ? "sent" : mode === "draft" ? "drafted" : "skipped"
        }));
        
        fetchPipeline();
      } else {
        const errData = await res.json();
        setEmailError(errData.detail || "Dispatch failed.");
      }
    } catch (err) {
      console.error(err);
      setEmailError("Outbox dispatch request failed.");
    } finally {
      setIsDispatchingEmail(null);
    }
  };

  const wordCount = countWords(emailBody);
  const isEmailValid = wordCount <= 150;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-300">
      
      {/* Header */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-indigo-400" />
            Pipeline Hub
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Standardized tracking of active job targets. Promoted jobs advance through resume tailoring and automated outreach.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
            <p className="text-sm text-slate-400">Loading pipeline metrics...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto p-8 max-w-7xl w-full mx-auto">
          {/* Columns grid */}
          <div className="grid grid-cols-5 gap-6 min-w-[1000px] h-full items-start">
            {STATUSES.map((statusCol) => {
              const cardsInCol = pipeline.filter((card) => card.status === statusCol.key);

              return (
                <div key={statusCol.key} className="flex flex-col bg-slate-900/20 border border-white/5 rounded-2xl p-4 space-y-4">
                  {/* Column Title */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${statusCol.color} px-2.5 py-0.5 rounded-full border`}>
                      {statusCol.label}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{cardsInCol.length}</span>
                  </div>

                  {/* Column Cards */}
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {cardsInCol.length > 0 ? (
                      cardsInCol.map((card) => (
                        <div
                          key={card.id}
                          onClick={() => {
                            setSelectedCard(card);
                            setActiveTab("overview");
                          }}
                          className="bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-white/10 rounded-xl p-4 cursor-pointer transition-all duration-300 relative group"
                        >
                          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-indigo-500 to-cyan-500 opacity-0 group-hover:opacity-60 transition-opacity rounded-t-xl" />
                          <h4 className="font-bold text-white text-xs line-clamp-1 group-hover:text-indigo-400 transition-colors">{card.title}</h4>
                          <span className="block text-[10px] text-slate-400 font-medium mt-0.5">{card.company}</span>
                          
                          <div className="flex items-center justify-between mt-3 text-[10px] text-slate-500 font-bold uppercase">
                            <span>{card.source}</span>
                            {card.match_score && (
                              <span className="text-indigo-400 font-semibold">{card.match_score}% Match</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-[10px] text-slate-600 border border-dashed border-white/5 rounded-xl">
                        Empty column
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detail Slide-over Panel (Modal Overlay) */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          {/* Backdrop close */}
          <div className="absolute inset-0" onClick={() => setSelectedCard(null)} />

          {/* Panel */}
          <div className="relative w-full max-w-4xl bg-slate-950 border-l border-white/5 h-full flex flex-col shadow-2xl text-slate-300 overflow-hidden">
            
            {/* Header info */}
            <div className="p-6 border-b border-white/5 bg-slate-900/20 flex items-start justify-between">
              <div className="space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  {selectedCard.status}
                </span>
                <h3 className="text-lg font-black text-white">{selectedCard.title}</h3>
                <p className="text-xs text-slate-400 font-medium">{selectedCard.company} &bull; {selectedCard.location}</p>
              </div>
              <button 
                onClick={() => setSelectedCard(null)}
                className="h-8 w-8 rounded-lg border border-white/10 flex items-center justify-center hover:bg-slate-900 transition-colors text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className="flex px-6 border-b border-white/5 bg-slate-950 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-3 border-b-2 transition-all ${
                  activeTab === "overview" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                1. Overview & Recipient
              </button>
              <button
                onClick={() => setActiveTab("tailor")}
                className={`px-4 py-3 border-b-2 transition-all ${
                  activeTab === "tailor" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                2. Resume Tailoring
              </button>
              <button
                onClick={() => setActiveTab("outreach")}
                className={`px-4 py-3 border-b-2 transition-all ${
                  activeTab === "outreach" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                3. Closer Outreach
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Job Details Card */}
                  <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-5 space-y-3">
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">Job Target Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="block text-slate-500">Source Aggregator</span>
                        <span className="font-semibold text-white uppercase">{selectedCard.source}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500">Compensation</span>
                        <span className="font-semibold text-emerald-400">{selectedCard.salary || "Not Disclosed"}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-slate-500">Job Posting Link</span>
                        <a 
                          href={selectedCard.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="font-semibold text-indigo-400 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <LinkIcon className="h-3 w-3" />
                          Open original job posting webpage
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Recipient Personalization */}
                  <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-5 space-y-4">
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">Recipient Outreach Details</h4>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Contact Name</label>
                          <input
                            type="text"
                            value={recipient.recipient_name}
                            onChange={(e) => setRecipient((prev) => ({ ...prev, recipient_name: e.target.value }))}
                            placeholder="e.g. Priya Gupta"
                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Contact Email</label>
                          <input
                            type="email"
                            value={recipient.recipient_email}
                            onChange={(e) => setRecipient((prev) => ({ ...prev, recipient_email: e.target.value }))}
                            placeholder="e.g. priya@acme.ai"
                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Personalization Hook Note</label>
                        <textarea
                          value={recipient.personalization_note}
                          onChange={(e) => setRecipient((prev) => ({ ...prev, personalization_note: e.target.value }))}
                          placeholder="e.g. Loved your tech talk at PyCon or referenced shared connection..."
                          rows={3}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <Button
                          onClick={handleSaveRecipient}
                          disabled={isSavingRecipient}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] px-4 py-2.5 rounded-lg border border-indigo-400/20"
                        >
                          {isSavingRecipient ? "Saving..." : "Save Contact Info"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: RESUME TAILORING */}
              {activeTab === "tailor" && (
                <div className="space-y-6">
                  {/* Score & Gap analysis summary if exists */}
                  {selectedCard.match_score !== null && selectedCard.match_score !== undefined && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                      <div className="md:col-span-2">
                        <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-5 space-y-2">
                          <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">Gap Analysis Summary</h4>
                          {selectedCard.gap_analysis ? (
                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="text-slate-500 font-semibold block uppercase text-[10px]">Missing Skills</span>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {selectedCard.gap_analysis.missingSkills?.map((s: string, idx: number) => (
                                    <span key={idx} className="px-2 py-0.5 bg-red-950/20 text-red-400 border border-red-500/10 rounded-md text-[10px]">
                                      {s}
                                    </span>
                                  )) || <span className="text-slate-400">None</span>}
                                </div>
                              </div>
                              <div className="pt-1">
                                <span className="text-slate-500 font-semibold block uppercase text-[10px]">Key Requirements</span>
                                <ul className="list-disc pl-4 text-slate-400 mt-1 space-y-1">
                                  {selectedCard.gap_analysis.requiredCredentials?.slice(0, 3).map((r: string, idx: number) => (
                                    <li key={idx}>{r}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500">No gap analysis details extracted.</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                        <span className="text-slate-500 font-semibold uppercase text-[10px] mb-2">Original Match Score</span>
                        <div className="relative flex items-center justify-center h-24 w-24">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
                            <circle cx="48" cy="48" r="40" stroke="#6366f1" strokeWidth="6" fill="transparent"
                              strokeDasharray={`${2 * Math.PI * 40}`}
                              strokeDashoffset={`${2 * Math.PI * 40 * (1 - selectedCard.match_score / 100)}`}
                              className="transition-all duration-1000"
                            />
                          </svg>
                          <span className="absolute text-xl font-black text-white">{selectedCard.match_score}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tailoring actions */}
                  <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-5 space-y-4">
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">Resume & Job Postings Inputs</h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Resume Baseline (Editable)</label>
                        <textarea
                          value={resumeText}
                          onChange={(e) => setResumeText(e.target.value)}
                          rows={6}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono resize-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Job Description Target (Paste context)</label>
                        <textarea
                          value={jdText}
                          onChange={(e) => setJdText(e.target.value)}
                          rows={6}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                        />
                      </div>
                    </div>

                    {tailoringError && (
                      <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/20 text-red-300 text-xs">
                        {tailoringError}
                      </div>
                    )}

                    <div className="flex justify-center gap-3 pt-2">
                      <Button
                        onClick={handleAnalyzeResume}
                        disabled={isAnalyzing || isTailoring}
                        className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-bold text-xs px-6 py-4 rounded-xl border border-indigo-500/30"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          "Analyze Fit & Score"
                        )}
                      </Button>

                      {selectedCard.runId && (
                        <Button
                          onClick={handleTailorResume}
                          disabled={isAnalyzing || isTailoring}
                          className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold text-xs px-6 py-4 rounded-xl border border-emerald-500/30"
                        >
                          {isTailoring ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Tailoring bullets...
                            </>
                          ) : (
                            "Generate Tailored Resume"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Side by side preview if tailored bullets exist */}
                  {selectedCard.tailored_bullets && (
                    <div className="space-y-4">
                      <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">Review Tailored Bullet Points</h4>
                      <SideBySideDiff
                        tailoredResume={{ tailoredExperience: selectedCard.tailored_bullets }}
                        originalProfile={selectedCard.resumeProfile}
                        onBulletUpdate={handleBulletUpdate}
                      />
                      
                      <div className="flex justify-end p-4 bg-slate-900/30 border border-white/5 rounded-2xl">
                        <PDFExportButton 
                          run={{
                            id: selectedCard.runId,
                            createdAt: selectedCard.promoted_at,
                            resumeProfile: selectedCard.resumeProfile,
                            jdProfile: selectedCard.jdProfile,
                            originalMatch: selectedCard.originalMatch,
                            gapAnalysis: selectedCard.gap_analysis,
                            tailoredResume: { tailoredExperience: selectedCard.tailored_bullets, tailoredSummary: selectedCard.tailored_resume_text },
                            tailoredMatch: { overallScore: selectedCard.match_score } as any,
                            status: "tailored"
                          }} 
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: OUTREACH & SEND */}
              {activeTab === "outreach" && (
                <div className="space-y-6">
                  {/* Config header */}
                  <div className="flex items-center justify-between p-4 bg-slate-900/30 border border-white/5 rounded-2xl text-xs">
                    <div className="space-y-0.5">
                      <span className="block font-bold text-white uppercase text-[10px]">Outbox Channel Setup</span>
                      <span className="block text-slate-400 font-medium">
                        SMTP user: {profile?.smtp_user || "N/A"} &bull; Mode: {profile?.dry_run ? "🟢 Simulation (Dry Run)" : "⚠️ Live Server Dispatch"}
                      </span>
                    </div>
                    
                    <Button
                      onClick={handleGenerateOutreach}
                      disabled={isGeneratingEmail}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] px-4 py-2.5 rounded-lg border border-indigo-400/20"
                    >
                      {isGeneratingEmail ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        "Generate Email"
                      )}
                    </Button>
                  </div>

                  {emailError && (
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/20 text-red-300 text-xs">
                      {emailError}
                    </div>
                  )}

                  {emailStatus && (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-1.5">
                      <Check className="h-4 w-4" />
                      Email dispatch status logged: <span className="font-bold uppercase">{emailStatus}</span>
                    </div>
                  )}

                  {/* Composer */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Subject Line</label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Subject Line will be auto-generated or type manually..."
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1 flex items-center justify-between">
                        <span>Email Body (Markdown friendly)</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          isEmailValid ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                        }`}>
                          {wordCount} / 150 Words
                        </span>
                      </label>
                      <textarea
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        placeholder="Write or generate cold email content..."
                        rows={12}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none font-mono"
                      />
                    </div>

                    {/* Dispatch actions */}
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <Button
                        onClick={() => handleSendOutreach("send")}
                        disabled={!!isDispatchingEmail || !isEmailValid || !emailBody}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-4 rounded-xl border border-indigo-400/20 shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-1.5"
                      >
                        {isDispatchingEmail === "send" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Send Outreach
                      </Button>
                      
                      <Button
                        onClick={() => handleSendOutreach("draft")}
                        disabled={!!isDispatchingEmail || !emailBody}
                        variant="secondary"
                        className="bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 font-bold text-xs py-4 rounded-xl flex items-center justify-center gap-1.5"
                      >
                        {isDispatchingEmail === "draft" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                        Save Draft
                      </Button>

                      <Button
                        onClick={() => handleSendOutreach("skip")}
                        disabled={!!isDispatchingEmail}
                        variant="outline"
                        className="border-white/10 hover:bg-slate-900 text-slate-400 hover:text-slate-200 font-bold text-xs py-4 rounded-xl flex items-center justify-center gap-1.5"
                      >
                        {isDispatchingEmail === "skip" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Skip Target
                      </Button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
