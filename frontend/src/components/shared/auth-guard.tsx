"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useAccount } from "wagmi";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { isConnected } = useAccount();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Always allow access — dashboard handles empty state gracefully
    setHasAccess(true);
    setChecking(false);
  }, []);

  if (checking || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#06060a]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-14 w-14 animate-spin rounded-full border-2 border-purple-500/20 border-t-purple-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg">🧠</span>
            </div>
          </div>
          <p className="text-sm text-[#94a3b8]">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
