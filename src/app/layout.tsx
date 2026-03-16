import type { Metadata } from "next";
import { NavbarRoot, NavbarBrand, NavbarLinks } from "@/components/ui";
import { Logo } from "@/components/ui/Logo";
import { NavLink } from "@/components/ui/NavLink";
import { TRPCReactProvider } from "@/trpc/client";
import "./globals.css";

export const metadata: Metadata = {
  title: "devroast — paste your code, get roasted",
  description:
    "Drop your code and we'll rate it — brutally honest or full roast mode",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <TRPCReactProvider>
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
        </TRPCReactProvider>
      </body>
    </html>
  );
}
