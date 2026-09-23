"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthBar, NavLink } from "./AuthBar";

// Brand on the left (hidden on the home page, which shows the full logo), links on the right.
// About and Privacy live in the footer, to keep this bar uncluttered.
export function TopBar() {
  const onHome = usePathname() === "/";

  return (
    <div className="flex items-center justify-between gap-4">
      {onHome ? (
        <span />
      ) : (
        <Link href="/" className="flex shrink-0 items-center gap-2 font-serif text-xl font-semibold tracking-tight">
          <Image src="/brand/emblem.png" alt="" width={36} height={36} priority />
          <span className="hidden sm:inline">Loquitur</span>
        </Link>
      )}
      <nav className="flex items-center gap-5 whitespace-nowrap text-sm sm:gap-6" aria-label="Main">
        <NavLink href="/dictionary">Dictionary</NavLink>
        <NavLink href="/study">Study</NavLink>
        <AuthBar />
      </nav>
    </div>
  );
}
