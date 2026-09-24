import type { Metadata } from "next";
import Link from "next/link";
import { DECKS, deckSize } from "@/lib/decks";

export const metadata: Metadata = {
  title: "Study",
  description: "Free study decks of medical Latin and Greek: heart, kidneys, lungs, prescription Latin and a pre-med starter.",
};

// Each deck is a "book" (liber), numbered the Roman way.
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export default function StudyPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-8 sm:pt-12">
      <header className="mb-8">
        <h1 className="font-serif text-5xl font-medium sm:text-6xl">Study</h1>
        <p className="mt-1 font-serif text-lg italic text-muted">
          Ready-made decks from Loquitur&apos;s dictionary. No account needed.
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DECKS.map((deck, i) => (
          <li key={deck.id}>
            <Link
              href={`/study/${deck.id}`}
              className="flex h-full flex-col rounded-md border border-line bg-surface p-5 transition hover:border-accent"
            >
              <span className="font-serif text-lg italic text-accent" aria-hidden="true">
                Liber {ROMAN[i]}
              </span>
              <span className="mt-1 font-serif text-xl font-semibold">{deck.title}</span>
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
        <Link href="/my-words" className="text-accent underline underline-offset-2">
          Save words to My Words
        </Link>{" "}
        and use Review.
      </p>
    </main>
  );
}
