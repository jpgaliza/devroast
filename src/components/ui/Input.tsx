import * as React from "react";

/* ─── Sub-components ─── */

interface InputRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const InputRoot = ({ children, className, ...props }: InputRootProps) => {
  return (
    <div
      className={["flex flex-col gap-1", className].filter(Boolean).join(" ")}
      {...props}
    >
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
      className={["text-sm font-medium text-text-secondary", className]
        .filter(Boolean)
        .join(" ")}
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
      className={[
        "rounded-md border border-border-primary bg-input text-text-primary px-3 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
});
InputField.displayName = "InputField";

/* ─── Exports ─── */

export { InputRoot, InputLabel, InputField };
