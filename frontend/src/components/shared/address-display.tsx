"use client";

import { cn } from "@/lib/utils";
import { formatAddress } from "@/lib/format";

interface AddressDisplayProps {
  address: string;
  className?: string;
}

export function AddressDisplay({ address, className }: AddressDisplayProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
  };

  return (
    <button
      onClick={copyToClipboard}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg bg-surface px-2 py-1 font-mono text-xs text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary",
        className
      )}
      title={address}
    >
      <span>{formatAddress(address)}</span>
      <svg className="h-3 w-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    </button>
  );
}
