import * as React from "react";
import { twMerge } from "tailwind-merge";

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
      className={twMerge(
        "w-full max-w-240 flex flex-col gap-4 md:gap-8 px-4 md:px-0",
        className,
      )}
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
      className={twMerge(
        "flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4",
        className,
      )}
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
    <div className={twMerge("flex items-center gap-2", className)}>
      <span className="text-accent-green font-jb text-xs md:text-sm font-bold">
        {prompt}
      </span>
      <span className="text-text-primary font-jb text-xs md:text-sm font-bold">
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
      className={twMerge("text-text-tertiary font-ibm text-[13px]", className)}
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
      className={twMerge(
        "w-full border border-border-primary overflow-x-auto",
        className,
      )}
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
      className={twMerge(
        "flex items-center h-8 md:h-10 px-3 md:px-5 bg-bg-surface border-b border-border-primary min-w-full",
        className,
      )}
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
      className={twMerge(
        "flex items-start px-3 md:px-5 py-3 md:py-4 border-b border-border-primary last:border-b-0 min-w-full",
        className,
      )}
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
    <span className={twMerge("font-jb text-xs", className)} {...props}>
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
      className={twMerge(
        "text-text-tertiary font-ibm text-xs text-center",
        className,
      )}
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
    <span className={twMerge(`font-jb text-xs font-bold ${color}`, className)}>
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
