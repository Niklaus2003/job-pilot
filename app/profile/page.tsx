"use client";

import React, { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Globe, 
  Briefcase, 
  Key, 
  Server, 
  ShieldAlert, 
  Save, 
  Loader2, 
  CheckCircle2 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    portfolio_url: "",
    skills: "",
    background: "",
    base_resume_text: "",
    smtp_host: "smtp.gmail.com",
    smtp_port: "587",
    smtp_user: "",
    smtp_password: "",
    groq_api_key: "",
    dry_run: true
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch profile
    async function loadProfile() {
      try {
        const res = await fetch("/api/backend/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("Failed to load profile", err);
        setError("Could not establish connection with FastAPI backend. Ensure uvicorn is running.");
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setProfile((prev) => ({
      ...prev,
      [name]: val
    }));
  };

  const handleToggle = (field: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev]
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/backend/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const data = await res.json();
        setError(data.detail || "Failed to save settings.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error when connecting to the API server.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading profile configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5 text-slate-300">
      <div className="pb-4 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Profile & Credentials</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure your personal details, API keys, and email protocols. This state flows into all modules.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-950/40 border border-red-500/20 text-red-300 text-sm">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Candidates Section */}
          <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5">
              <User className="h-4 w-4 text-indigo-400" />
              <h3 className="font-bold text-white text-sm">Candidate Information</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="e.g. Aaron Francis"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="e.g. aaron@gmail.com"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Portfolio URL</label>
                <input
                  type="url"
                  name="portfolio_url"
                  value={profile.portfolio_url}
                  onChange={handleChange}
                  placeholder="e.g. https://github.com/aaron"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Key Skills (Comma Separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={profile.skills}
                  onChange={handleChange}
                  placeholder="e.g. React, Next.js, Python, FastAPI, LLM integration"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Candidate Background (LLM context)</label>
                <textarea
                  name="background"
                  value={profile.background}
                  onChange={handleChange}
                  placeholder="Summarize your professional experience for outreach personalization."
                  rows={3}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Credentials / SMTP Section */}
          <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5">
              <Server className="h-4 w-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">Credentials & Mail Server</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Key className="h-3 w-3 text-indigo-400" />
                  Groq API Key
                </label>
                <input
                  type="password"
                  name="groq_api_key"
                  value={profile.groq_api_key}
                  onChange={handleChange}
                  placeholder="gsk_..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">SMTP Host</label>
                  <input
                    type="text"
                    name="smtp_host"
                    value={profile.smtp_host}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">SMTP Port</label>
                  <input
                    type="text"
                    name="smtp_port"
                    value={profile.smtp_port}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">SMTP Username (Login Email)</label>
                <input
                  type="email"
                  name="smtp_user"
                  value={profile.smtp_user}
                  onChange={handleChange}
                  placeholder="e.g. sender@gmail.com"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">SMTP Password (App Password)</label>
                <input
                  type="password"
                  name="smtp_password"
                  value={profile.smtp_password}
                  onChange={handleChange}
                  placeholder="16-character App Password"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Toggle Safe mode */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-slate-950/40">
                <div className="space-y-0.5">
                  <span className="block text-xs font-semibold text-white">Safe Simulation Mode (Dry Run)</span>
                  <span className="block text-[10px] text-slate-500">Emails will be simulated and drafts saved locally without sending live mail.</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("dry_run")}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    profile.dry_run ? "bg-indigo-600" : "bg-slate-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      profile.dry_run ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Base Resume Section */}
        <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/5">
            <Briefcase className="h-4 w-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Base Resume Text</h3>
          </div>
          <div>
            <textarea
              name="base_resume_text"
              value={profile.base_resume_text}
              onChange={handleChange}
              placeholder="Paste your baseline resume text here. This will be matched and tailored against Job Descriptions."
              rows={5}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none font-mono"
              required
            />
          </div>
        </div>

        {/* Submit bar */}
        <div className="flex items-center justify-between p-4 border border-white/5 bg-slate-900/20 rounded-2xl">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {saveSuccess && (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold animate-fade-in">
                <CheckCircle2 className="h-4 w-4" />
                Settings saved successfully!
              </span>
            )}
          </div>
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-wide px-6 py-5 rounded-xl border border-indigo-400/20 shadow-lg shadow-indigo-900/20 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving Profiles...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Configuration
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
