"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { CodexEntry, NewCodexEntry } from "@/lib/codex";
import { deckEntries, findDeck } from "@/lib/decks";
import { buildQuestion, type Question } from "@/lib/quiz";
import { Difficulty } from "./Difficulty";
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
    <main className="mx-auto w-full max-w-2xl px-4 pb-12 pt-8 sm:px-8 sm:pt-12">
      <Link href="/study" className="text-muted hover:text-accent">
        ← Contents
      </Link>
      <header className="mb-8 mt-4">
        <h1 className="font-serif text-5xl font-medium">{deck.title}</h1>
        <p className="mt-2 text-[17px] text-muted">{deck.description}</p>
        <p className="mt-2 flex items-baseline gap-2 text-sm text-faint">
          Difficulty: <Difficulty level={deck.difficulty} />
        </p>
        {/* One mark per card: gold once answered right, rose if missed, faint still to come. */}
        {cards && (
          <div className="mt-5 flex gap-1.5" aria-label={`Card ${Math.min(index + 1, cards.length)} of ${cards.length}`}>
            {cards.map((c, i) => {
              const done = i < index || (i === index && chosen !== null);
              const missedIt = done && missed.some((m) => m.id === c.entry.id);
              return (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-xs ${
                    !done ? (i === index ? "bg-line-strong" : "bg-line") : missedIt ? "bg-[#e39b7b]" : "bg-accent"
                  }`}
                />
              );
            })}
          </div>
        )}
      </header>

      {!cards ? (
        <p className="font-hand text-2xl text-accent">shuffling…</p>
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
          extra={<SaveButton entry={toSave(cards[index].entry)} label="Save to My Words" onPaper />}
        />
      ) : (
        <section>
          <div className="flex items-end gap-5 border-b border-line pb-5">
            <p className="font-serif text-7xl font-medium leading-none">
              {score}
              <span className="text-faint">/{cards.length}</span>
            </p>
            <p className="-rotate-2 pb-1 font-hand text-[30px] leading-none text-accent">
              {score === cards.length ? "Optime! A perfect round." : score >= cards.length / 2 ? "Bene! Nice work." : "Keep at it. Every round helps."}
            </p>
          </div>
          {missed.length > 0 && (
            <div className="mt-6">
              <h2 className="font-serif text-2xl italic text-muted">To practice</h2>
              <dl className="mt-3">
                {missed.map((e) => (
                  <div key={e.id} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                    <span>
                      <dt className="inline font-serif text-2xl font-semibold">{e.term}</dt>{" "}
                      <dd className="inline text-[17px] text-muted">
                        {"meaning" in e.details ? e.details.meaning : e.details.plain}
                      </dd>
                    </span>
                    <SaveButton entry={toSave(e)} quiet />
                  </div>
                ))}
              </dl>
            </div>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <button
              onClick={start}
              className="h-12 rounded-sm bg-accent px-7 text-lg font-semibold text-bg transition hover:bg-accent-soft"
            >
              Shuffle a new round
            </button>
            <Link href="/study" className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent">
              Choose another book
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
