import type { Metadata } from "next";
import { Suspense } from "react";
import { DictionaryBrowser } from "@/components/DictionaryBrowser";

export const metadata: Metadata = {
  title: "Dictionary",
  description:
    "Every Latin and Greek word root and prescription abbreviation Loquitur knows, with origins, meanings and memory hooks.",
};

export default function DictionaryPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-10 pt-4 sm:px-6">
      <header className="mb-6">
        <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">Dictionary</h1>
        <p className="mt-1 font-serif text-lg italic text-muted">
          The Latin and Greek behind medical words, one piece at a time.
        </p>
      </header>
      {/* Suspense is required because the browser reads ?tab= and ?q= from the address bar. */}
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <DictionaryBrowser />
      </Suspense>
    </main>
  );
}
