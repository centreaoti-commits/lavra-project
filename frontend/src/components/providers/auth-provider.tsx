"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { api } from "@/lib/api";
import { logger } from "@/lib/logger";

interface AuthState {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  token: null,
  userId: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  // Load token from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("ct_token");
    const storedUserId = localStorage.getItem("ct_user_id");
    if (stored && storedUserId) {
      setToken(stored);
      setUserId(storedUserId);
    }
    setIsLoading(false);
  }, []);

  // Auto-login when wallet connects (triggers signature popup)
  useEffect(() => {
    if (isConnected && address && !token && !isLoading) {
      login().catch(() => {
        // User rejected signature or error — that's OK, they can still use public features
      });
    }
  }, [isConnected, address]);

  const login = useCallback(async () => {
    if (!address) throw new Error("No wallet connected");

    setIsLoading(true);
    try {
      // Step 1: Get nonce
      const { message } = await api.getNonce(address);

      // Step 2: Sign message
      const signature = await signMessageAsync({ message });

      // Step 3: Verify and get token
      const result = await api.verifySignature(address, signature, message);

      setToken(result.token);
      setUserId(result.user_id);
      localStorage.setItem("ct_token", result.token);
      localStorage.setItem("ct_user_id", result.user_id);
    } catch (err) {
      logger.error("Login failed:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, signMessageAsync]);

  const logout = useCallback(() => {
    setToken(null);
    setUserId(null);
    localStorage.removeItem("ct_token");
    localStorage.removeItem("ct_user_id");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
