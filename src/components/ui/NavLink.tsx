import * as React from "react";

interface NavLinkProps {
  href?: string;
  children: React.ReactNode;
  className?: string;
}

export const NavLink = ({ href = "#", children, className }: NavLinkProps) => {
  return (
    <a
      href={href}
      className={[
        "text-text-secondary font-jb text-[13px] hover:text-primary transition-colors",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </a>
  );
};

NavLink.displayName = "NavLink";
