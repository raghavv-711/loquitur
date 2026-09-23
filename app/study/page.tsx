import type { Metadata } from "next";
import Link from "next/link";
import { DECKS, deckSize } from "@/lib/decks";

export const metadata: Metadata = {
  title: "Study",
  description: "Free study decks of medical Latin and Greek: heart, kidneys, lungs, prescription Latin and a pre-med starter.",
};

export default function StudyPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 pb-10 pt-4 sm:px-6">
      <header className="mb-8">
        <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">Study</h1>
        <p className="mt-1 font-serif text-lg italic text-muted">
          Ready-made decks from Loquitur&apos;s dictionary. No account needed.
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DECKS.map((deck) => (
          <li key={deck.id}>
            <Link
              href={`/study/${deck.id}`}
              className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5 transition hover:border-accent"
            >
              <span className="text-3xl" aria-hidden="true">
                {deck.icon}
              </span>
              <span className="mt-3 font-serif text-xl font-semibold">{deck.title}</span>
              <span className="mt-1 text-sm text-muted">{deck.description}</span>
              <span className="mt-auto pt-4 text-xs text-faint">
                {deckSize(deck)} words · 10 questions per round
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm text-muted">
        Want reviews spaced out over days so words stick?{" "}
        <Link href="/codex" className="text-accent underline underline-offset-2">
          Save words to your Codex
        </Link>{" "}
        and use Review.
      </p>
    </main>
  );
}
