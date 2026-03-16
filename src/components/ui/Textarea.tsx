import * as React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  placeholder?: string;
  rows?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ placeholder, rows, className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        placeholder={placeholder}
        rows={rows}
        className={[
          "w-full",
          "min-h-[200px]",
          "bg-input",
          "border border-primary",
          "text-primary",
          "font-ibm",
          "rounded-md",
          "p-3",
          "resize-none",
          "focus:outline-none",
          "focus:ring-2",
          "focus:ring-offset-2",
          "focus:ring-primary",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";