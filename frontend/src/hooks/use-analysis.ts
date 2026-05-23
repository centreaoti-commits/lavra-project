"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Analysis, type ScanResult } from "@/lib/api";

export function useAnalysis(walletAddress: string | null, token: string | null) {
  return useQuery({
    queryKey: ["analysis", walletAddress],
    queryFn: () => api.getAnalysis((token || ""), walletAddress || ""),
    enabled: !!walletAddress && !!token,
    refetchInterval: 30000,
  });
}

export function useStartScan(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ walletAddress, chains }: { walletAddress: string; chains: string[] }) =>
      api.startScan((token || ""), walletAddress, chains),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analysis"] });
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    },
  });
}
