import { cn } from "@/lib/utils";
import { CHAINS } from "@/lib/constants";

interface ChainIconProps {
  chain: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ChainIcon({ chain, size = "md", className }: ChainIconProps) {
  const chainData = CHAINS.find(
    (c) => c.name.toLowerCase() === chain.toLowerCase() || c.symbol.toLowerCase() === chain.toLowerCase()
  );

  const sizes = {
    sm: "h-4 w-4 text-[8px]",
    md: "h-6 w-6 text-[10px]",
    lg: "h-8 w-8 text-xs",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-bold",
        sizes[size],
        className
      )}
      style={{ backgroundColor: chainData?.color || "#64748b" }}
      title={chainData?.name || chain}
    >
      {chainData?.symbol?.[0] || chain[0]?.toUpperCase()}
    </div>
  );
}
