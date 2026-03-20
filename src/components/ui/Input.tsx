import * as React from "react";
import { twMerge } from "tailwind-merge";

/* ─── Sub-components ─── */

interface InputRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const InputRoot = ({ children, className, ...props }: InputRootProps) => {
  return (
    <div className={twMerge("flex flex-col gap-1", className)} {...props}>
      {children}
    </div>
  );
};
InputRoot.displayName = "InputRoot";

const InputLabel = ({
  children,
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) => {
  return (
    <label
      className={twMerge("text-sm font-medium text-text-secondary", className)}
      {...props}
    >
      {children}
    </label>
  );
};
InputLabel.displayName = "InputLabel";

const InputField = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={twMerge(
        "rounded-md border border-border-primary bg-input text-text-primary px-3 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring",
        className,
      )}
      {...props}
    />
  );
});
InputField.displayName = "InputField";

/* ─── Exports ─── */

export { InputRoot, InputLabel, InputField };
