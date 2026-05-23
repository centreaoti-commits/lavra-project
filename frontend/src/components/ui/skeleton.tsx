import * as React from "react";
import { cn} from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-shimmer rounded-md bg-surface-border", className)}
      {...props}
    />
  );
}

export { Skeleton };
