import * as React from "react";

export type DiffLineType = "removed" | "added" | "context";

export interface DiffLineProps extends React.HTMLAttributes<HTMLDivElement> {
  type: DiffLineType;
  code: string;
}

const DIFF_CONFIG = {
  removed: {
    bg: "bg-[#1A0A0A]",
    prefix: "-",
    prefixColor: "text-accent-red",
    codeColor: "text-text-secondary",
  },
  added: {
    bg: "bg-[#0A1A0F]",
    prefix: "+",
    prefixColor: "text-accent-green",
    codeColor: "text-text-primary",
  },
  context: {
    bg: "",
    prefix: " ",
    prefixColor: "text-text-tertiary",
    codeColor: "text-text-secondary",
  },
} as const;

export const DiffLine = React.forwardRef<HTMLDivElement, DiffLineProps>(
  ({ type, code, className, ...props }, ref) => {
    const { bg, prefix, prefixColor, codeColor } = DIFF_CONFIG[type];

    return (
      <div
        ref={ref}
        className={["flex items-center gap-2 px-4 py-2", bg, className]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        <span
          className={[
            "font-jb text-[13px] w-3 shrink-0 select-none",
            prefixColor,
          ].join(" ")}
        >
          {prefix}
        </span>
        <span className={["font-jb text-[13px]", codeColor].join(" ")}>
          {code}
        </span>
      </div>
    );
  },
);
DiffLine.displayName = "DiffLine";
