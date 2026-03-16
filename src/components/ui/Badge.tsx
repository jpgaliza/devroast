import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export const badgeVariants = cva("inline-flex items-center gap-2", {
  variants: {
    variant: {
      // Terminal-style dot + colored text — no background fill
      critical: "text-accent-red",
      warning: "text-accent-amber",
      good: "text-accent-green",
      default: "text-text-tertiary",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type ResolvedVariant = "critical" | "warning" | "good" | "default";

const DOT_COLOR: Record<ResolvedVariant, string> = {
  critical: "bg-accent-red",
  warning: "bg-accent-amber",
  good: "bg-accent-green",
  default: "bg-text-tertiary",
};

// Backwards-compat aliases
const ALIAS: Record<string, ResolvedVariant> = {
  error: "critical",
  success: "good",
  info: "default",
};

export type BadgeVariant = ResolvedVariant | "error" | "success" | "info";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const resolved: ResolvedVariant = (ALIAS[variant] ??
      variant) as ResolvedVariant;

    return (
      <span
        ref={ref}
        className={twMerge(badgeVariants({ variant: resolved }), className)}
        {...props}
      >
        <span
          className={twMerge(
            "w-2 h-2 rounded-full shrink-0",
            DOT_COLOR[resolved],
          )}
          aria-hidden
        />
        <span className="font-jb text-xs">{children}</span>
      </span>
    );
  },
);
Badge.displayName = "Badge";
