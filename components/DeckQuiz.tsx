"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { CodexEntry, NewCodexEntry } from "@/lib/codex";
import { deckEntries, findDeck } from "@/lib/decks";
import { buildQuestion, type Question } from "@/lib/quiz";
import { QuestionCard } from "./QuestionCard";
import { SaveButton } from "./SaveButton";

const ROUND = 10;

type Card = { entry: CodexEntry; question: Question };

// Practice a deck: 10 random questions per round, no account and no schedule.
export function DeckQuiz({ deckId }: { deckId: string }) {
  const deck = findDeck(deckId)!;
  const [cards, setCards] = useState<Card[] | null>(null);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState<CodexEntry[]>([]);

  // Shuffling happens in the browser, so each round (and each visit) is different.
  const start = useCallback(() => {
    const entries = deckEntries(deck);
    const picked = [...entries].sort(() => Math.random() - 0.5).slice(0, ROUND);
    // No "you know…" in decks: the learner hasn't necessarily met these parts yet.
    setCards(picked.map((entry) => ({ entry, question: buildQuestion(entry, new Set()) })));
    setIndex(0);
    setChosen(null);
    setScore(0);
    setMissed([]);
  }, [deck]);

  useEffect(start, [start]);

  function answer(option: number) {
    if (!cards || chosen !== null) return;
    setChosen(option);
    if (option === cards[index].question.answer) setScore((s) => s + 1);
    else setMissed((m) => [...m, cards[index].entry]);
  }

  const toSave = (e: CodexEntry): NewCodexEntry => ({
    kind: e.kind,
    key: e.key,
    term: e.term,
    details: e.details,
    source_word: null,
  });

  return (
    <main className="mx-auto max-w-2xl px-4 pb-10 pt-4 sm:px-6">
      <Link href="/study" className="text-sm text-muted hover:text-fg">
        ← All decks
      </Link>
      <header className="mb-8 mt-3">
        <h1 className="font-serif text-5xl font-medium">
          {deck.title}
        </h1>
        <p className="mt-1 text-muted">{deck.description}</p>
      </header>

      {!cards ? (
        <p className="text-muted">Shuffling…</p>
      ) : index < cards.length ? (
        <QuestionCard
          card={cards[index]}
          position={`${index + 1} of ${cards.length}`}
          chosen={chosen}
          onAnswer={answer}
          onNext={() => {
            setChosen(null);
            setIndex((i) => i + 1);
          }}
          error={null}
          practice
          extra={<SaveButton entry={toSave(cards[index].entry)} label="Save to My Words" />}
        />
      ) : (
        <section className="rounded-md border border-line bg-surface p-6 text-center">
          <p className="font-serif text-5xl font-semibold">
            {score}/{cards.length}
          </p>
          <p className="mt-2 text-muted">
            {score === cards.length ? "Optime! A perfect round." : score >= cards.length / 2 ? "Bene! Nice work." : "Keep at it. Every round helps."}
          </p>
          {missed.length > 0 && (
            <div className="mt-5 text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">To practice</p>
              <ul className="mt-2 space-y-2">
                {missed.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 rounded bg-surface-2 px-3 py-2">
                    <span>
                      <span className="font-serif text-lg font-semibold">{e.term}</span>{" "}
                      <span className="text-sm text-muted">
                        {"meaning" in e.details ? e.details.meaning : e.details.plain}
                      </span>
                    </span>
                    <SaveButton entry={toSave(e)} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={start}
              className="rounded-sm bg-accent px-5 py-2 text-sm font-medium text-bg hover:brightness-110"
            >
              New round
            </button>
            <Link href="/study" className="rounded-sm border border-line px-5 py-2 text-sm hover:border-accent">
              Other decks
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
