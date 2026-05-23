"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "ct_scan_results";

export function useScanResults() {
  const [data, setData] = useState<any>(null);

  const readStorage = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setData(stored ? JSON.parse(stored) : null);
    } catch {}
  }, []);

  useEffect(() => {
    readStorage();
    // Listen for custom event when scan completes
    const handler = () => readStorage();
    window.addEventListener("scan-results-updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("scan-results-updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, [readStorage]);

  return data;
}
