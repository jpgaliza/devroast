import * as React from "react";

/* ─── Sub-components ─── */

interface LeaderboardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const LeaderboardRoot = ({
  children,
  className,
  ...props
}: LeaderboardRootProps) => {
  return (
    <div
      className={["w-full max-w-[960px] flex flex-col gap-8", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
};
LeaderboardRoot.displayName = "LeaderboardRoot";

interface LeaderboardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const LeaderboardHeader = ({
  children,
  className,
  ...props
}: LeaderboardHeaderProps) => {
  return (
    <div
      className={[
        "flex items-center justify-between w-full",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
};
LeaderboardHeader.displayName = "LeaderboardHeader";

interface LeaderboardTitleProps {
  prompt?: string;
  children: React.ReactNode;
  className?: string;
}

const LeaderboardTitle = ({
  prompt = "//",
  children,
  className,
}: LeaderboardTitleProps) => {
  return (
    <div
      className={["flex items-center gap-2", className]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="text-accent-green font-jb text-sm font-bold">
        {prompt}
      </span>
      <span className="text-text-primary font-jb text-sm font-bold">
        {children}
      </span>
    </div>
  );
};
LeaderboardTitle.displayName = "LeaderboardTitle";

const LeaderboardSubtitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <p
      className={["text-text-tertiary font-ibm text-[13px]", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </p>
  );
};
LeaderboardSubtitle.displayName = "LeaderboardSubtitle";

interface LeaderboardTableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const LeaderboardTable = ({
  children,
  className,
  ...props
}: LeaderboardTableProps) => {
  return (
    <div
      className={["w-full border border-border-primary", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
};
LeaderboardTable.displayName = "LeaderboardTable";

const LeaderboardTableHead = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={[
        "flex items-center h-10 px-5 bg-bg-surface border-b border-border-primary",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
};
LeaderboardTableHead.displayName = "LeaderboardTableHead";

const LeaderboardTableRow = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={[
        "flex items-start px-5 py-4 border-b border-border-primary last:border-b-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
};
LeaderboardTableRow.displayName = "LeaderboardTableRow";

const LeaderboardTableCell = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={["font-jb text-xs", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </span>
  );
};
LeaderboardTableCell.displayName = "LeaderboardTableCell";

const LeaderboardFooter = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <p
      className={[
        "text-text-tertiary font-ibm text-xs text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </p>
  );
};
LeaderboardFooter.displayName = "LeaderboardFooter";

interface LeaderboardScoreProps {
  value: number;
  className?: string;
}

const LeaderboardScore = ({ value, className }: LeaderboardScoreProps) => {
  const color =
    value <= 2
      ? "text-accent-red"
      : value <= 4
        ? "text-accent-amber"
        : "text-accent-green";
  return (
    <span
      className={[`font-jb text-xs font-bold ${color}`, className]
        .filter(Boolean)
        .join(" ")}
    >
      {value.toFixed(1)}
    </span>
  );
};
LeaderboardScore.displayName = "LeaderboardScore";

/* ─── Exports ─── */

export {
  LeaderboardRoot,
  LeaderboardHeader,
  LeaderboardTitle,
  LeaderboardSubtitle,
  LeaderboardTable,
  LeaderboardTableHead,
  LeaderboardTableRow,
  LeaderboardTableCell,
  LeaderboardFooter,
  LeaderboardScore,
};
