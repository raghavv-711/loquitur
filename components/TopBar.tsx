"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountButton, NavLink, UserLinks } from "./AuthBar";

// Brand and account on the first row; tabs beside them on wide screens, or on their own row on phones.
// About and Privacy live in the footer, to keep this bar uncluttered.
export function TopBar() {
  const pathname = usePathname();
  const onHome = pathname === "/";

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm">
      {onHome ? (
        <span className="sm:hidden" />
      ) : (
        <Link href="/" className="flex shrink-0 items-center gap-2 font-serif text-xl font-semibold tracking-tight">
          <Image src="/brand/emblem.png" alt="" width={36} height={36} priority />
          <span className="hidden sm:inline">Loquitur</span>
        </Link>
      )}

      <div className="flex items-center gap-6 sm:order-3">
        <AccountButton />
      </div>

      <nav
        aria-label="Main"
        // On very narrow phones (signed in = 5 tabs) the row scrolls sideways instead of squishing.
        className="order-last -mx-1 flex w-[calc(100%+0.5rem)] items-center justify-between gap-2.5 text-[13px] sm:text-sm overflow-x-auto whitespace-nowrap border-t border-line px-1 pt-3 [scrollbar-width:none] sm:order-2 sm:mx-0 sm:ml-auto sm:w-auto sm:justify-end sm:gap-6 sm:overflow-visible sm:border-0 sm:px-0 sm:pt-0"
      >
        <DecodeTab active={onHome} />
        <NavLink href="/dictionary">Dictionary</NavLink>
        <NavLink href="/study">Study</NavLink>
        <UserLinks />
      </nav>
    </div>
  );
}

// The main feature, so it stands out on every page: an outlined pill, filled when you're on it.
function DecodeTab({ active }: { active: boolean }) {
  return (
    <Link
      href="/"
      aria-current={active ? "page" : undefined}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition sm:px-3.5 ${
        active
          ? "bg-linear-to-r from-accent to-accent-2 text-bg"
          : "border border-accent/60 text-accent hover:border-accent hover:bg-accent/10"
      }`}
    >
      <span aria-hidden="true">📷</span> Decode
    </Link>
  );
}
