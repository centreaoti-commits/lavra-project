"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type UserProfile, type Wallet } from "@/lib/api";

export function useProfile(token: string | null) {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => api.getProfile((token || "")),
    enabled: !!token,
  });
}

export function useUpdateSettings(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Record<string, unknown>) =>
api.updateSettings(token || "", settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useWallets(token: string | null) {
  return useQuery({
    queryKey: ["wallets"],
    queryFn: () => api.getWallets((token || "")),
    enabled: !!token,
  });
}

export function useAddWallet(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ address, label }: { address: string; label?: string }) =>
      api.addWallet((token || ""), address, label),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
  });
}

export function useRemoveWallet(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (walletId: string) => api.removeWallet((token || ""), walletId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
  });
}
