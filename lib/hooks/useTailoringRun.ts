"use client";

import { useState, useEffect } from "react";
import { TailoringRun, TailoringRunSchema } from "../schemas";

const STORAGE_KEY = "resume_shapeshifter_run";

export function useTailoringRun() {
  const [run, setRunState] = useState<TailoringRun | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const validated = TailoringRunSchema.parse(parsed);
          setRunState(validated);
        }
      } catch (err) {
        console.error("Failed to load tailoring run from session storage", err);
        // Clear corrupt data
        sessionStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  // Save to sessionStorage when run changes
  const setRun = (newRun: TailoringRun | null) => {
    setRunState(newRun);
    if (typeof window !== "undefined") {
      if (newRun) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newRun));
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  };

  const reset = () => {
    setRun(null);
  };

  const status = run?.status || "idle";

  return {
    run,
    setRun,
    reset,
    status,
    isLoaded,
    isIdle: status === "idle",
    isParsed: status === "parsed",
    isAnalyzed: status === "analyzed",
    isTailored: status === "tailored",
    isExported: status === "exported",
  };
}
