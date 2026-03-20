import { NavbarRoot, NavbarBrand, NavbarLinks } from "@/components/ui";
import { Logo } from "@/components/ui/Logo";
import { NavLink } from "@/components/ui/NavLink";

export default function ResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavbarRoot>
        <NavbarBrand>
          <a href="/" className="flex items-center gap-2 cursor-pointer">
            <Logo />
          </a>
        </NavbarBrand>
        <NavbarLinks>
          <NavLink href="/leaderboard">leaderboard</NavLink>
        </NavbarLinks>
      </NavbarRoot>
      {children}
    </>
  );
}
