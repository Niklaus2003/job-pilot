"use client";

import React, { useState } from "react";
import { TailoredBullet } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, HelpCircle, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";

interface BulletChangeCardProps {
  bullet: TailoredBullet;
  onAcceptToggle?: (accepted: boolean) => void;
}

export default function BulletChangeCard({ bullet, onAcceptToggle }: BulletChangeCardProps) {
  // If userConfirmed is false, it means it's high risk and needs explicit review
  const [isAccepted, setIsAccepted] = useState<boolean>(bullet.userConfirmed ?? true);
  const isPendingReview = bullet.confidence === "low" && bullet.userConfirmed === false && !isAccepted;

  const handleAccept = () => {
    setIsAccepted(true);
    if (onAcceptToggle) onAcceptToggle(true);
  };

  const handleReject = () => {
    setIsAccepted(false);
    if (onAcceptToggle) onAcceptToggle(false);
  };

  const getConfidenceBadge = (confidence: TailoredBullet["confidence"]) => {
    switch (confidence) {
      case "high":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
            High Confidence
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono">
            Medium Confidence
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono">
            Low Confidence
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div
      id={`bullet-${bullet.original.substring(0, 20).replace(/\W/g, '')}`}
      className={`relative rounded-xl border p-5 transition-all duration-300 ${isPendingReview
        ? "bg-amber-500/5 border-amber-500/30 ring-1 ring-amber-500/20 shadow-lg shadow-amber-500/10"
        : isAccepted
          ? "glass-panel border-white/10 hover:border-indigo-500/30"
          : "bg-slate-950/20 border-red-500/20 opacity-70"
        }`}
    >
      {/* Visual left indicator line based on status */}
      <div
        className={`absolute top-0 bottom-0 left-0 w-[3px] rounded-l-xl transition-colors ${isPendingReview ? "bg-amber-500" : isAccepted ? "bg-indigo-500" : "bg-red-500"
          }`}
      />

      {/* Header with confidence & risk info */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pl-1">
        <div className="flex items-center gap-2">
          {getConfidenceBadge(bullet.confidence)}

          {bullet.riskFlag && (
            <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-mono flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {bullet.riskFlag}
            </Badge>
          )}
        </div>

        {/* Action button toggles */}
        <div className="flex items-center gap-1.5">
          {isPendingReview ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mr-1 animate-pulse">
                Needs Review
              </span>
              <Button
                size="sm"
                variant="default"
                onClick={handleAccept}
                className="h-8 bg-amber-500 hover:bg-amber-400 text-black font-bold px-3 shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Confirm
              </Button>
            </div>
          ) : isAccepted ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleReject}
              className="h-7 text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 px-2.5 gap-1"
            >
              <X className="h-3.5 w-3.5" />
              Reject change
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleAccept}
              className="h-7 text-xs text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/30 px-2.5 gap-1"
            >
              <Check className="h-3.5 w-3.5" />
              Accept change
            </Button>
          )}
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-center pl-1">
        {/* Original Bullet */}
        <div className="bg-slate-950/40 border border-white/5 rounded-lg p-3 text-xs leading-relaxed text-slate-400">
          <span className="font-semibold text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
            Original Bullet:
          </span>
          {bullet.original}
        </div>

        {/* Arrow Divider */}
        <div className="hidden lg:flex justify-center items-center h-full text-slate-600">
          <ArrowRight className="h-4 w-4" />
        </div>

        {/* Tailored Bullet */}
        <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-lg p-3 text-xs leading-relaxed text-slate-200">
          <span className="font-semibold text-[10px] text-indigo-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
            Tailored Bullet:
            {isAccepted && <ShieldCheck className="h-3 w-3 text-emerald-400" />}
          </span>
          {bullet.tailored}
        </div>
      </div>

      {/* Detailed Meta: Explanation & Keywords */}
      <div className="mt-4 pt-3 border-t border-white/5 space-y-3 pl-1 text-xs">
        <div className="flex gap-2">
          <HelpCircle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-300">Adjustment Justification: </span>
            <span className="text-slate-400 leading-relaxed">{bullet.changeReason}</span>
          </div>
        </div>

        {bullet.keywordsAddressed.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
              Keywords Added:
            </span>
            {bullet.keywordsAddressed.map((kw, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] py-0 px-2 font-normal"
              >
                {kw}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
