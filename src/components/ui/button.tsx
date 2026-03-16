import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-jb transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Primary: green fill, near-black text — main CTA
        default: "bg-accent-green text-[#0A0A0A] hover:bg-emerald-400",
        // Secondary: border only, primary text
        secondary:
          "border border-border-primary bg-transparent text-text-primary hover:bg-bg-surface",
        // Ghost: border only, secondary text — tertiary actions
        ghost:
          "border border-border-primary bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-surface",
        // Destructive: red fill for dangerous actions
        destructive: "bg-accent-red text-[#0A0A0A] hover:opacity-80",
        // Link: text-only, no border
        link: "text-text-secondary hover:text-text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "py-[10px] px-6 text-[13px] font-medium",
        sm: "py-2 px-4 text-xs",
        lg: "py-3 px-8 text-sm",
        icon: "h-9 w-9 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Optional icon to display before the text */
  icon?: React.ReactNode;
  /** Whether the button is in a loading state */
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    const {
      variant = "default",
      size = "default",
      icon,
      isLoading,
      children,
      ...rest
    } = props;
    return (
      <button
        className={twMerge(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || rest.disabled}
        {...rest}
      >
        {icon && (
          <span className="flex h-4 w-4 shrink-0 items-center justify-center">
            {icon}
          </span>
        )}
        {isLoading ? (
          <span className="flex h-4 w-4 shrink-0 items-center justify-center">
            <div className="animate-spin rounded-full border-2 border-current border-t-transparent w-4 h-4" />
          </span>
        ) : (
          children
        )}
      </button>
    );
  },
);
Button.displayName = "Button";
