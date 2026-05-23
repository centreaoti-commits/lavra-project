import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary-muted text-primary-foreground",
        success: "bg-success-muted text-success",
        warning: "bg-warning-muted text-warning",
        danger: "bg-danger-muted text-danger",
        accent: "bg-accent-muted text-accent",
        outline: "border border-surface-border text-text-secondary",
        fomo: "bg-danger-muted text-danger",
        panic: "bg-warning-muted text-warning",
        revenge: "bg-red-900/30 text-red-400",
        overtrade: "bg-yellow-900/30 text-yellow-400",
        diamond: "bg-success-muted text-success",
        planned: "bg-primary-muted text-primary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
