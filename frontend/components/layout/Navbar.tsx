"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@mysten/dapp-kit";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/leagues", label: "Leagues" },
  { href: "/portfolio", label: "Portfolio" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#131313] flex justify-between items-center h-20 px-8 border-b border-white/5">
      <div className="flex items-center gap-12">
        <Link href="/" className="text-2xl font-black italic text-[#D2FF00] tracking-tighter uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          OneFantasy
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`uppercase tracking-tighter transition-colors text-sm font-bold ${
                  active
                    ? "text-[#D2FF00] border-b-2 border-[#D2FF00] pb-1"
                    : "text-white/60 hover:text-white"
                }`}
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
      <ConnectButton />
    </nav>
  );
}
