import type { Metadata } from "next";
import Link from "next/link";
import { DECKS, deckSize, type Deck } from "@/lib/decks";
import { Difficulty } from "@/components/Difficulty";
import { abbrevDisplay, rootDisplay } from "@/lib/display";

export const metadata: Metadata = {
  title: "Study",
  description: "Free study decks of medical Latin and Greek: heart, kidneys, lungs, prescription Latin and a pre-med starter.",
};

// Each deck is a "book" (liber), numbered the Roman way.
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

const WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
const COUNT_WORD = WORDS[DECKS.length] ?? String(DECKS.length);

// A taste of what's inside each deck, like the running words under a chapter title.
function preview(deck: Deck): string {
  const words = [...deck.roots.slice(0, 5).map(rootDisplay), ...deck.abbreviations.slice(0, 5).map(abbrevDisplay)];
  return words.slice(0, 5).join(", ") + "…";
}

// Laid out as a book's table of contents: numeral, title, dotted leader, word count.
export default function StudyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-12 pt-8 sm:px-8 sm:pt-12">
      <header className="mb-10 text-center">
        <p className="font-serif text-lg italic text-accent">Contents</p>
        <h1 className="mt-1 font-serif text-5xl font-medium sm:text-6xl">Study</h1>
        <p className="mt-2 font-serif text-lg italic text-muted">
          {COUNT_WORD} small books drawn from Loquitur&apos;s dictionary. Ten questions a round, no account needed.
        </p>
        <p className="mt-4 text-sm text-faint">
          Stars show difficulty, from <span className="text-accent">★</span> for beginners to{" "}
          <span className="text-accent">★★★★★</span> for experts.
        </p>
      </header>

      <ol className="border-t border-line">
        {DECKS.map((deck, i) => (
          <li key={deck.id} className="border-b border-line">
            <Link
              href={`/study/${deck.id}`}
              className="group grid grid-cols-[3.5rem_1fr] gap-x-4 py-6 sm:grid-cols-[5rem_1fr] sm:gap-x-6"
            >
              <span className="pt-1 text-right font-serif text-2xl italic text-accent sm:text-3xl" aria-hidden="true">
                {ROMAN[i]}
              </span>
              <span className="min-w-0">
                <span className="flex items-baseline gap-3">
                  <span className="font-serif text-2xl font-semibold transition group-hover:text-accent sm:text-3xl">
                    {deck.title}
                  </span>
                  {i === 0 && <span className="hidden -rotate-2 whitespace-nowrap font-hand text-xl text-accent sm:inline">start here</span>}
                  <span
                    className="hidden flex-1 translate-y-[-0.3em] border-b border-dotted border-line-strong sm:block"
                    aria-hidden="true"
                  />
                  <span className="ml-auto hidden shrink-0 items-baseline gap-3 text-sm text-faint sm:ml-0 sm:flex">
                    <Difficulty level={deck.difficulty} />
                    <span>{deckSize(deck)} words</span>
                  </span>
                </span>
                {/* On phones the stars and count get their own line so long titles don't get squeezed. */}
                <span className="mt-1 flex items-baseline gap-3 text-sm text-faint sm:hidden">
                  <Difficulty level={deck.difficulty} />
                  <span>{deckSize(deck)} words</span>
                </span>
                <span className="mt-1 block text-[17px] text-muted">{deck.description}</span>
                <span className="mt-1 block font-serif text-lg italic text-faint">{preview(deck)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <p className="mt-10 text-center text-muted">
        Want reviews spaced out over days so words stick?{" "}
        <Link href="/my-words" className="text-accent underline underline-offset-4">
          Save words to My Words
        </Link>{" "}
        and use Review. Or{" "}
        <Link href="/pocket-card" className="text-accent underline underline-offset-4">
          print a pocket card
        </Link>{" "}
        to keep the most common ones on you.
      </p>
    </main>
  );
}
