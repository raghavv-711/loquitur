"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthBar } from "./AuthBar";

// Brand on the left (hidden on the home page, which shows the full logo), links on the right.
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
      <div className="flex items-center gap-3 whitespace-nowrap text-sm">
        <Link href="/dictionary" className="text-muted hover:text-fg">
          Dictionary
        </Link>
        {/* On phones About lives in the footer, to keep the bar from crowding. */}
        <Link href="/about" className="hidden text-muted hover:text-fg sm:inline">
          About
        </Link>
        <AuthBar />
      </div>
    </div>
  );
}
