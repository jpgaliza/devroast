import * as React from "react";
import { twMerge } from "tailwind-merge";

/* ─── Sub-components ─── */

interface NavbarRootProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

const NavbarRoot = ({ children, className, ...props }: NavbarRootProps) => {
  return (
    <nav
      className={twMerge(
        "flex items-center justify-between h-14 px-10 bg-page border-b border-border-primary",
        className,
      )}
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
    <div className={twMerge("flex items-center gap-2", className)} {...props}>
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
    <div className={twMerge("flex items-center gap-6", className)} {...props}>
      {children}
    </div>
  );
};
NavbarLinks.displayName = "NavbarLinks";

/* ─── Exports ─── */

export { NavbarRoot, NavbarBrand, NavbarLinks };
