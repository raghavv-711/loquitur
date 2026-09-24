"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { wordOfTheDay } from "@/lib/word-of-day";
import { SaveButton } from "./SaveButton";

// Picked in the browser (not at build time) so it changes every day on the live site.
export function WordOfTheDay() {
  const [word, setWord] = useState<ReturnType<typeof wordOfTheDay> | null>(null);
  useEffect(() => setWord(wordOfTheDay()), []);

  if (!word) return <div className="h-40" aria-hidden="true" />; // hold the space so the page doesn't jump

  return (
    <section className="rounded-md border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-accent">Word of the day</h2>
          <p className="mt-2 font-serif text-3xl font-semibold">{word.display}</p>
        </div>
        <SaveButton
          entry={{
            kind: "root",
            key: word.key,
            term: word.display,
            details: { origin: word.origin, meaning: word.meaning, hook: word.hook },
            source_word: null,
          }}
        />
      </div>
      <p className="mt-1 text-muted">
        {word.origin} · <strong className="text-fg">{word.meaning}</strong>
      </p>
      <p className="mt-3 text-sm text-fg/85">
        You&apos;ll see it in{" "}
        {word.examples.map((w, i) => (
          <span key={w.word}>
            {i > 0 && (i === word.examples.length - 1 ? " and " : ", ")}
            <strong className="text-fg">{w.word}</strong> ({w.meaning})
          </span>
        ))}
        .
      </p>
      <p className="mt-3 flex flex-wrap gap-4 text-sm">
        <Link href={`/dictionary?q=${word.key}`} className="text-accent underline underline-offset-2">
          See it in the dictionary
        </Link>
        <Link href="/study" className="text-accent underline underline-offset-2">
          Study more roots
        </Link>
      </p>
    </section>
  );
}
