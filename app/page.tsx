import Link from "next/link";
import { ArrowRight, Sparkles, Target, Zap, ShieldAlert, BadgeCheck, Bot, Layers, Mail, Radar } from "lucide-react";
import DisclaimerBanner from "@/components/DisclaimerBanner";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-slate-950">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center pt-24 pb-16 px-4 text-center sm:px-6 lg:px-8 overflow-hidden flex-1">
        {/* Glow effect backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto space-y-8 flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold animate-pulse">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Job Hunting Operating System
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] max-w-3xl text-white">
            HuntOS is here. <br />
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Automate your job application pipeline.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
            HuntOS integrates the Job Hunt Agent, Resume Shapeshifter, and The Closer outreach engine into one single, cohesive, end-to-end platform. Scraping, tailoring, and cold emailing combined.
          </p>

          {/* CTA Button */}
          <div className="pt-4">
            <Link
              href="/pipeline"
              className="group relative inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 p-[1.5px] font-semibold text-white shadow-xl shadow-indigo-500/20 transition-transform active:scale-95"
            >
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950 px-6 transition-colors group-hover:bg-slate-900/60">
                <span className="flex items-center gap-2">
                  Launch HuntOS Pipeline Hub
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            The Three Pillars of HuntOS
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            Standardized interfaces connecting discovery, tailoring, and outreach
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden bg-slate-900/40 border border-white/5">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-indigo-500/40" />
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20">
              <Radar className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">1. Discovery Radar</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scrape and filter job postings across Naukri, RemoteOK, and Wellfound using structured stealth scrapers, then promote selected targets in one click.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden bg-slate-900/40 border border-white/5">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-500/40" />
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 mb-4 border border-cyan-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">2. Resume Shapeshifter</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tailor achievements truths to match target job descriptions. Analyze missing credentials, check match score delta, and download side-by-side PDFs.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden bg-slate-900/40 border border-white/5">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500/40" />
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">3. The Closer Outreach</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate custom cold outreach messages using Groq LLM, dispatch SMTP mails or save local drafts, and verify connections via a transaction log audit trail.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Banner */}
      <DisclaimerBanner />
    </div>
  );
}
