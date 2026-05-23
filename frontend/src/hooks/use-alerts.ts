"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type AlertItem } from "@/lib/api";

export function useAlerts(token: string | null, page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ["alerts", page, limit],
    queryFn: () => api.getAlerts((token || ""), { page, limit }),
    enabled: !!token,
  });
}

export function useMarkAlertRead(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: string) => api.markAlertRead((token || ""), alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useUpdateAlertSettings(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
mutationFn: (settings: Record<string, unknown>) => api.updateSettings(token || "", settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alertSettings"] });
    },
  });
}
