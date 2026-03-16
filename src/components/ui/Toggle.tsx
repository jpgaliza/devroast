import * as React from "react";

/* ─── Sub-components ─── */

interface ToggleRootProps extends React.HTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

const ToggleRoot = ({ children, className, ...props }: ToggleRootProps) => {
  return (
    <label
      className={[
        "inline-flex items-center cursor-pointer select-none gap-2.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </label>
  );
};
ToggleRoot.displayName = "ToggleRoot";

type ToggleSwitchProps = React.InputHTMLAttributes<HTMLInputElement> & {
  isOn?: boolean;
};

const ToggleSwitch = React.forwardRef<HTMLInputElement, ToggleSwitchProps>(
  ({ isOn, className, ...props }, ref) => {
    const on = isOn ?? props.checked ?? props.defaultChecked ?? false;

    return (
      <>
        <input ref={ref} type="checkbox" className="sr-only" {...props} />
        <span
          aria-hidden
          className={[
            "h-[22px] w-10 rounded-full transition-colors duration-300 ease-in-out relative",
            on ? "bg-accent-green" : "bg-border-primary",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span
            className={`absolute top-[3px] h-4 w-4 rounded-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${on ? "left-[21px] bg-[#0A0A0A]" : "left-[3px] bg-[#6B7280]"}`}
          />
        </span>
      </>
    );
  },
);
ToggleSwitch.displayName = "ToggleSwitch";

interface ToggleLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  isOn?: boolean;
  children: React.ReactNode;
}

const ToggleLabel = ({ isOn, children, className, ...props }: ToggleLabelProps) => {
  return (
    <span
      className={[
        "select-none font-jb text-xs",
        isOn ? "text-accent-green" : "text-text-tertiary",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </span>
  );
};
ToggleLabel.displayName = "ToggleLabel";

/* ─── Exports ─── */

export { ToggleRoot, ToggleSwitch, ToggleLabel };
