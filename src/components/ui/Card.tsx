import * as React from "react";

/* ─── Sub-components ─── */

interface CardRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardRoot = ({ children, className, ...props }: CardRootProps) => {
  return (
    <div
      className={[
        "flex flex-col gap-3 border border-border-primary p-5",
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
CardRoot.displayName = "CardRoot";

const CardHeader = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={["flex items-center gap-2", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
};
CardHeader.displayName = "CardHeader";

const CardTitle = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p
      className={["font-jb text-[13px] text-text-primary", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </p>
  );
};
CardTitle.displayName = "CardTitle";

const CardDescription = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p
      className={[
        "font-ibm text-xs text-text-secondary leading-relaxed",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </p>
  );
};
CardDescription.displayName = "CardDescription";

/* ─── Exports ─── */

export { CardRoot, CardHeader, CardTitle, CardDescription };
