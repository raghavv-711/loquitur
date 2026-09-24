"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountButton, NavLink, UserLinks } from "./AuthBar";
import { BrandMenu } from "./BrandMenu";

// Logo menu (About, Privacy) and account on the first row; tabs beside them on wide screens,
// or on their own row on phones.
export function TopBar() {
  const pathname = usePathname();
  const onHome = pathname === "/";

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm">
      <BrandMenu />

      <div className="flex items-center gap-6 sm:order-3">
        <AccountButton />
      </div>

      <nav
        aria-label="Main"
        // On very narrow phones (signed in = 5 tabs) the row scrolls sideways instead of squishing.
        className="order-last -mx-1 flex w-[calc(100%+0.5rem)] items-center justify-between gap-2.5 text-sm sm:text-base overflow-x-auto whitespace-nowrap border-t border-line px-1 pt-3 [scrollbar-width:none] sm:order-2 sm:mx-0 sm:ml-auto sm:w-auto sm:justify-end sm:gap-8 sm:overflow-visible sm:border-0 sm:px-0 sm:pt-0"
      >
        <DecodeTab active={onHome} />
        <NavLink href="/dictionary">Dictionary</NavLink>
        <NavLink href="/study">Study</NavLink>
        <UserLinks />
      </nav>
    </div>
  );
}

// The main feature, so it leads the tabs and gets a camera mark on every page.
function DecodeTab({ active }: { active: boolean }) {
  return (
    <Link
      href="/"
      aria-current={active ? "page" : undefined}
      className={`flex shrink-0 items-center gap-1.5 transition ${
        active ? "border-b border-accent pb-0.5 text-accent" : "text-fg hover:text-accent"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
        <circle cx="12" cy="13" r="3.5" />
      </svg>
      Decode
    </Link>
  );
}
