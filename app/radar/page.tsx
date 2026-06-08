"use client";

import React, { useState, useEffect } from "react";
import { 
  Radar, 
  Search, 
  MapPin, 
  Briefcase, 
  ArrowRight, 
  Layers,
  Loader2, 
  Check, 
  AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBackendUrl } from "@/lib/api-helper";

export default function JobRadarPage() {
  const [searchOptions, setSearchOptions] = useState({
    title: "",
    location: "",
    experience: "",
    sources: ["remoteok", "naukri", "wellfound"],
    pages: 2
  });

  const [isScraping, setIsScraping] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [promotingIds, setPromotingIds] = useState<string[]>([]);
  const [pipelineUrls, setPipelineUrls] = useState<string[]>([]);

  // Load existing pipeline URLs to prevent duplicates locally
  useEffect(() => {
    async function loadPipeline() {
      try {
        const res = await fetch(getBackendUrl("/api/backend/pipeline"));
        if (res.ok) {
          const data = await res.json();
          setPipelineUrls(data.map((c: any) => c.url.toLowerCase().trim()));
        }
      } catch (err) {
        console.error("Failed to load pipeline list", err);
      }
    }
    loadPipeline();
  }, []);

  const handleSourceToggle = (source: string) => {
    setSearchOptions((prev) => {
      const current = [...prev.sources];
      if (current.includes(source)) {
        return { ...prev, sources: current.filter((s) => s !== source) };
      } else {
        return { ...prev, sources: [...current, source] };
      }
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchOptions((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchOptions.title.trim()) return;
    if (searchOptions.sources.length === 0) {
      setError("Please select at least one source.");
      return;
    }

    setIsScraping(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(getBackendUrl("/api/backend/scrape"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: searchOptions.title.trim(),
          location: searchOptions.location.trim() || null,
          experience: searchOptions.experience.trim() || null,
          sources: searchOptions.sources,
          pages: Number(searchOptions.pages)
        })
      });

      if (!res.ok) {
        throw new Error("Scraping server returned an error.");
      }

      const data = await res.json();
      setJobs(data.jobs || []);
      
      if (data.errors && data.errors.length > 0) {
        setError(`Partial warning: ${data.errors.join("; ")}`);
      } else {
        setSuccessMsg(`Search complete! Found ${data.jobs_found} jobs.`);
      }
    } catch (err) {
      console.error(err);
      setError("Search request failed. Ensure the backend FastAPI server is running.");
    } finally {
      setIsScraping(false);
    }
  };

  const handlePromote = async (job: any, index: number) => {
    const promoId = `${job.url}-${index}`;
    setPromotingIds((prev) => [...prev, promoId]);

    try {
      const res = await fetch(getBackendUrl("/api/backend/promote"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary,
          url: job.url,
          source: job.source
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Update local pipeline urls
        setPipelineUrls((prev) => [...prev, job.url.toLowerCase().trim()]);
        
        // Update job item in view state to duplicate
        setJobs((prev) => 
          prev.map((j) => (j.url === job.url ? { ...j, is_duplicate: true } : j))
        );
      }
    } catch (err) {
      console.error("Promotion failed", err);
    } finally {
      setPromotingIds((prev) => prev.filter((id) => id !== promoId));
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-300 bg-slate-950">
      <div className="pb-4 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Radar className="h-6 w-6 text-indigo-400 animate-pulse" />
            Job Radar
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Scan and aggregate listings from Naukri, RemoteOK, and Wellfound in a unified schema, and promote selected targets to your active pipeline.
          </p>
        </div>
      </div>

      {/* Control panel / Search panel */}
      <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-6">
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Job Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                <Search className="h-3.5 w-3.5 text-indigo-400" />
                Job Title / Keywords
              </label>
              <input
                type="text"
                name="title"
                value={searchOptions.title}
                onChange={handleChange}
                placeholder="e.g. Software Engineer"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                Location (optional)
              </label>
              <input
                type="text"
                name="location"
                value={searchOptions.location}
                onChange={handleChange}
                placeholder="e.g. Bangalore or Remote"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 text-emerald-400" />
                Experience (optional / Years)
              </label>
              <input
                type="text"
                name="experience"
                value={searchOptions.experience}
                onChange={handleChange}
                placeholder="e.g. 2"
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-2">
            {/* Sources selection */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-slate-400">Scrape Sources</span>
              <div className="flex flex-wrap gap-2">
                {["remoteok", "naukri", "wellfound"].map((source) => {
                  const isChecked = searchOptions.sources.includes(source);
                  return (
                    <button
                      key={source}
                      type="button"
                      onClick={() => handleSourceToggle(source)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all uppercase ${
                        isChecked
                          ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-300"
                          : "bg-slate-950 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300"
                      }`}
                    >
                      {source}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pages slider and search button */}
            <div className="flex items-center gap-6 w-full sm:w-auto">
              <div className="space-y-1 w-28">
                <label className="block text-[10px] text-slate-500 font-bold uppercase">Pages: {searchOptions.pages}</label>
                <input
                  type="range"
                  name="pages"
                  min="1"
                  max="5"
                  value={searchOptions.pages}
                  onChange={handleChange}
                  className="w-full accent-indigo-500 bg-slate-950 rounded-lg appearance-none h-1 cursor-pointer"
                />
              </div>

              <Button
                type="submit"
                disabled={isScraping || !searchOptions.title}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-wide px-6 py-5 rounded-xl border border-indigo-400/20 shadow-lg shadow-indigo-900/20 flex items-center gap-2 shrink-0"
              >
                {isScraping ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching listings...
                  </>
                ) : (
                  <>
                    <Radar className="h-4 w-4" />
                    Search Jobs
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-950/40 border border-red-500/20 text-red-300 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-sm animate-fade-in">
          <Check className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Results Listings */}
      {jobs.length > 0 ? (
        <div className="bg-slate-900/10 border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/40 text-slate-400 font-semibold">
                  <th className="px-6 py-4">Title / Company</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Salary</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {jobs.map((job, idx) => {
                  const jobKey = `${job.url}-${idx}`;
                  const isPromoting = promotingIds.includes(jobKey);
                  const isDuplicate = job.is_duplicate || pipelineUrls.includes(job.url.toLowerCase().trim());

                  return (
                    <tr key={jobKey} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4 space-y-0.5">
                        <a 
                          href={job.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="font-bold text-white hover:text-indigo-400 hover:underline transition-colors block text-sm"
                        >
                          {job.title}
                        </a>
                        <span className="block text-xs text-slate-400 font-medium">{job.company}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{job.location || "N/A"}</td>
                      <td className="px-6 py-4 font-semibold text-emerald-400">{job.salary || "Not Disclosed"}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-800 text-[10px] uppercase font-bold text-slate-400 border border-white/5">
                          {job.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isDuplicate ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase">
                            <Layers className="h-3 w-3" />
                            In Pipeline
                          </div>
                        ) : (
                          <Button
                            onClick={() => handlePromote(job, idx)}
                            disabled={isPromoting}
                            size="sm"
                            className="bg-indigo-600/20 hover:bg-indigo-600/90 text-indigo-300 hover:text-white border border-indigo-500/30 text-[10px] font-bold uppercase rounded-lg transition-all"
                          >
                            {isPromoting ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                Promote
                                <ArrowRight className="h-3 w-3 ml-1" />
                              </>
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        !isScraping && (
          <div className="text-center py-16 bg-slate-900/10 border border-white/5 rounded-2xl space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900/80 border border-white/5 text-slate-500 mx-auto">
              <Search className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-sm">No Jobs aggregation loaded</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Configure your search terms and click search to aggregate real-time listings from scraping targets.
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
}
