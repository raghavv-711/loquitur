import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DictionaryBrowser } from "@/components/DictionaryBrowser";

export const metadata: Metadata = {
  title: "Dictionary",
  description:
    "Every Latin and Greek word root and prescription abbreviation Loquitur knows, with origins, meanings and memory hooks.",
};

export default function DictionaryPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-8 sm:pt-12">
      <header className="mb-6">
        <h1 className="font-serif text-5xl font-medium sm:text-6xl">Dictionary</h1>
        <p className="mt-1 font-serif text-lg italic text-muted">
          Every root and abbreviation I&apos;ve checked by hand.
        </p>
        <Link href="/pocket-card" className="mt-3 inline-block -rotate-1 font-hand text-2xl text-accent hover:text-accent-soft">
          print a pocket card of prescription shorthand &rarr;
        </Link>
      </header>
      {/* Suspense is required because the browser reads ?tab= and ?q= from the address bar. */}
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <DictionaryBrowser />
      </Suspense>
    </main>
  );
}
