"use client";

import React, { useState, useEffect } from "react";
import { 
  Mail, 
  Send, 
  FileText, 
  SkipForward, 
  AlertTriangle, 
  Trash2, 
  Loader2, 
  RefreshCw 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CloserPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    sent: 0,
    drafts: 0,
    skipped: 0,
    failed: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/backend/outreach/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data || []);
        
        // Calculate stats
        const calculated = { sent: 0, drafts: 0, skipped: 0, failed: 0 };
        data.forEach((row: any) => {
          const status = (row.Status || "").toLowerCase();
          if (status === "sent") calculated.sent++;
          else if (status === "drafted") calculated.drafts++;
          else if (status === "skipped") calculated.skipped++;
          else if (status === "failed") calculated.failed++;
        });
        setStats(calculated);
      } else {
        setError("Failed to fetch outreach logs.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to API server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to delete all transaction logs?")) return;
    setIsClearing(true);
    try {
      const res = await fetch("/api/backend/outreach/clear-logs", { method: "POST" });
      if (res.ok) {
        setLogs([]);
        setStats({ sent: 0, drafts: 0, skipped: 0, failed: 0 });
      } else {
        alert("Failed to clear logs.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-300 bg-slate-950">
      <div className="pb-4 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Mail className="h-6 w-6 text-indigo-400" />
            The Closer (Outreach Logs)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Audit trail of outbound messages, including simulated deliveries, drafts compiled, and server connection diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={fetchLogs}
            disabled={isLoading}
            variant="outline"
            className="text-xs border-white/10 hover:bg-slate-900 text-slate-300 flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Logs
          </Button>

          {logs.length > 0 && (
            <Button
              onClick={handleClearLogs}
              disabled={isClearing}
              variant="outline"
              className="text-xs border-red-500/20 hover:bg-red-950/20 text-red-400 flex items-center gap-1.5"
            >
              {isClearing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Clear Logs
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/20 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sent */}
        <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500/40" />
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Send className="h-4 w-4" />
          </div>
          <div>
            <span className="block text-2xl font-black text-white">{stats.sent}</span>
            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Emails Sent</span>
          </div>
        </div>

        {/* Drafts */}
        <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-500/40" />
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <span className="block text-2xl font-black text-white">{stats.drafts}</span>
            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Local Drafts</span>
          </div>
        </div>

        {/* Skipped */}
        <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-indigo-500/40" />
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <SkipForward className="h-4 w-4" />
          </div>
          <div>
            <span className="block text-2xl font-black text-white">{stats.skipped}</span>
            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Skipped Targets</span>
          </div>
        </div>

        {/* Failed */}
        <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-5 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-500/40" />
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <span className="block text-2xl font-black text-white">{stats.failed}</span>
            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">SMTP Failures</span>
          </div>
        </div>
      </div>

      {/* Transaction Logs Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
        </div>
      ) : logs.length > 0 ? (
        <div className="bg-slate-900/10 border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/40 text-slate-400 font-semibold">
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Recipient</th>
                  <th className="px-6 py-4">Job Target</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log, idx) => {
                  const status = (log.Status || "").toLowerCase();
                  
                  return (
                    <tr key={idx} className="hover:bg-white/2 transition-colors">
                      <td className="px-6 py-4 text-slate-400 font-mono whitespace-nowrap">{log.Timestamp}</td>
                      <td className="px-6 py-4 text-white font-medium">{log.RecipientEmail}</td>
                      <td className="px-6 py-4 space-y-0.5">
                        <span className="block text-white font-bold">{log.Company}</span>
                        <span className="block text-[11px] text-slate-400">{log.Role}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-300 max-w-xs truncate">{log.Subject}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black border ${
                          status === "sent" 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : status === "drafted"
                            ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                            : status === "skipped"
                            ? "bg-slate-800 border-white/5 text-slate-400"
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 max-w-sm truncate">
                        {log.ErrorMessage || (status === "sent" ? "Delivered successfully" : "Draft saved locally")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/10 border border-white/5 rounded-2xl space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900/80 border border-white/5 text-slate-500 mx-auto">
            <Mail className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-white text-sm">No transaction history</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Outreach logs record email dispatches, skips, and draft payload compiling in real-time.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
