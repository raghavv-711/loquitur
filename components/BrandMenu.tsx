"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// The logo in the top left opens a small menu with About and Privacy.
// Opens on click (and on hover with a mouse); closes on outside click, Escape, or navigating.
export function BrandMenu() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Hover opens it for mouse users; a short delay stops it flickering while moving into the menu.
  const hoverOpen = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hoverClose = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div ref={root} className="relative" onPointerEnter={hoverOpen} onPointerLeave={hoverClose}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex shrink-0 items-center gap-2 rounded-full py-1 pl-1 pr-2 font-serif text-xl font-semibold tracking-tight transition hover:bg-surface"
      >
        <Image src="/brand/emblem.png" alt="" width={36} height={36} priority />
        <span className="hidden sm:inline">Loquitur</span>
        <span aria-hidden="true" className={`text-xs text-muted transition ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-40 mt-2 w-64 rounded-2xl border border-line bg-surface p-2 shadow-xl shadow-black/40"
        >
          <MenuLink href="/about" title="About Loquitur" hint="Who built it and why" />
          <MenuLink href="/privacy" title="Privacy" hint="What happens to your information" />
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, title, hint }: { href: string; title: string; hint: string }) {
  return (
    <Link href={href} role="menuitem" className="block rounded-xl px-3 py-2.5 transition hover:bg-surface-2">
      <span className="block text-sm font-medium text-fg">{title}</span>
      <span className="block text-xs text-muted">{hint}</span>
    </Link>
  );
}
