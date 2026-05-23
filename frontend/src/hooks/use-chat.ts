"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useChatHistory(token: string | null, limit: number = 50) {
  return useQuery({
    queryKey: ["chatHistory", limit],
    queryFn: () => api.getChatHistory((token || ""), limit),
    enabled: !!token,
  });
}

export function useSendChatMessage(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: string) => {
      if (token) {
        return api.sendChatMessage(token, message);
      }
      // Public chat — use scan results as context
      let analysisData = undefined;
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("ct_scan_results");
          if (stored) {
            const parsed = JSON.parse(stored);
            analysisData = {
              scores: parsed.scores || {},
              personality: parsed.personality || {},
              stats: parsed.stats || {},
              insights: parsed.insights || [],
            };
          }
        } catch {}
      }
      return api.sendPublicChatMessage(message, analysisData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
    },
  });
}
