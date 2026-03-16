import * as React from "react";

/* ─── Sub-components ─── */

interface NavbarRootProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

const NavbarRoot = ({ children, className, ...props }: NavbarRootProps) => {
  return (
    <nav
      className={[
        "flex items-center justify-between h-14 px-10 bg-page border-b border-border-primary",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </nav>
  );
};
NavbarRoot.displayName = "NavbarRoot";

const NavbarBrand = ({
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
NavbarBrand.displayName = "NavbarBrand";

const NavbarLinks = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={["flex items-center gap-6", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
};
NavbarLinks.displayName = "NavbarLinks";

/* ─── Exports ─── */

export { NavbarRoot, NavbarBrand, NavbarLinks };
