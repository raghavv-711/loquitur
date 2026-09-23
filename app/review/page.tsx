"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SignInDialog } from "@/components/AuthBar";
import { useCodex } from "@/components/CodexProvider";
import type { CodexEntry } from "@/lib/codex";
import { buildQuestion, type Question } from "@/lib/quiz";
import { describeDue, nextSchedule } from "@/lib/review";
import { createClient } from "@/lib/supabase/client";

const SESSION_SIZE = 10;

type Card = { entry: CodexEntry; question: Question };
type Mode = "due" | "practice"; // practice = extra review that doesn't change the schedule

export default function ReviewPage() {
  const { enabled, user, loading, refreshDue } = useCodex();
  const supabase = useMemo(() => (enabled ? createClient() : null), [enabled]);

  const [cards, setCards] = useState<Card[] | null>(null);
  const [mode, setMode] = useState<Mode>("due");
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [nextDue, setNextDue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const start = useCallback(
    async (m: Mode) => {
      if (!supabase) return;
      setError(null);
      setCards(null);
      setIndex(0);
      setChosen(null);
      setScore(0);
      setMode(m);

      const all = await supabase.from("codex_entries").select("*");
      if (all.error) return setError("Couldn't load your Codex. Refresh to try again.");
      const entries = all.data as CodexEntry[];
      const now = Date.now();
      const due = entries
        .filter((e) => new Date(e.due_at).getTime() <= now)
        .sort((a, b) => a.due_at.localeCompare(b.due_at));
      const pool = m === "due" ? due : [...entries].sort(() => Math.random() - 0.5);
      const known = new Set(entries.filter((e) => e.kind === "root").map((e) => e.key));

      setNextDue(entries.map((e) => e.due_at).sort()[0] ?? null);
      setCards(pool.slice(0, SESSION_SIZE).map((entry) => ({ entry, question: buildQuestion(entry, known) })));
    },
    [supabase],
  );

  useEffect(() => {
    if (user) start("due");
  }, [user, start]);

  async function answer(option: number) {
    if (!cards || chosen !== null) return;
    const { entry, question } = cards[index];
    const correct = option === question.answer;
    setChosen(option);
    if (correct) setScore((s) => s + 1);
    if (mode === "practice" || !supabase) return;

    const schedule = nextSchedule(entry, correct);
    const { error } = await supabase.from("codex_entries").update(schedule).eq("id", entry.id);
    if (error) setError("Couldn't save your progress for that card.");
  }

  function next() {
    setChosen(null);
    setIndex((i) => i + 1);
    if (cards && index + 1 >= cards.length) refreshDue();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-10 pt-4 sm:px-6">
      <header className="mb-8">
        <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">Review</h1>
        <p className="mt-1 font-serif text-lg italic text-stone-600">
          {mode === "practice" ? "Practice round: this won't change your schedule." : "A few minutes a day keeps the Latin fresh."}
        </p>
      </header>

      {!enabled ? (
        <Notice>Accounts aren&apos;t set up on this copy of Loquitur yet.</Notice>
      ) : loading ? (
        <Notice>Loading…</Notice>
      ) : !user ? (
        <Notice>
          <button onClick={() => setSigningIn(true)} className="font-medium text-terracotta underline">
            Sign in
          </button>{" "}
          to review your Codex.
          {signingIn && <SignInDialog onClose={() => setSigningIn(false)} />}
        </Notice>
      ) : error && !cards ? (
        <Notice>{error}</Notice>
      ) : cards === null ? (
        <Notice>Shuffling your cards…</Notice>
      ) : cards.length === 0 ? (
        <EmptyState nextDue={nextDue} hasWords={nextDue !== null} onPractice={() => start("practice")} />
      ) : index >= cards.length ? (
        <Summary score={score} total={cards.length} mode={mode} onPractice={() => start("practice")} />
      ) : (
        <QuestionCard
          card={cards[index]}
          position={`${index + 1} of ${cards.length}`}
          chosen={chosen}
          onAnswer={answer}
          onNext={next}
          error={error}
          practice={mode === "practice"}
        />
      )}
    </main>
  );
}

function QuestionCard({
  card,
  position,
  chosen,
  onAnswer,
  onNext,
  error,
  practice,
}: {
  card: Card;
  position: string;
  chosen: number | null;
  onAnswer: (i: number) => void;
  onNext: () => void;
  error: string | null;
  practice: boolean;
}) {
  const q = card.question;
  const answered = chosen !== null;
  const correct = chosen === q.answer;

  return (
    <section className="rounded-2xl border border-stone bg-white p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
        {position} · {q.type === "decode" ? "Decode it yourself" : card.entry.kind === "root" ? "Word root" : "Abbreviation"}
      </p>
      <p className="mt-4 text-stone-700">{q.prompt}</p>
      <h2 className="mt-1 font-serif text-4xl font-semibold">{q.subject}</h2>
      {q.hint && <p className="mt-1 font-serif text-lg italic text-terracotta">{q.hint}</p>}

      <div className="mt-6 grid gap-2">
        {q.options.map((option, i) => {
          const style = !answered
            ? "border-stone hover:border-terracotta"
            : i === q.answer
              ? "border-emerald-500 bg-emerald-50"
              : i === chosen
                ? "border-red-400 bg-red-50"
                : "border-stone opacity-50";
          return (
            <button
              key={i}
              onClick={() => onAnswer(i)}
              disabled={answered}
              className={`rounded-xl border px-4 py-3 text-left transition ${style}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-5">
          <p className={`font-medium ${correct ? "text-emerald-700" : "text-red-700"}`}>
            {correct ? "✓ Right!" : practice ? "Not quite." : "Not quite. It'll come back in a few minutes."}
          </p>
          <p className="mt-1 text-sm text-stone-600">{q.explanation}</p>
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
          <button
            onClick={onNext}
            autoFocus
            className="mt-4 rounded-full bg-ink px-5 py-2 text-sm font-medium text-white hover:bg-terracotta"
          >
            Next →
          </button>
        </div>
      )}
    </section>
  );
}

function Summary({
  score,
  total,
  mode,
  onPractice,
}: {
  score: number;
  total: number;
  mode: Mode;
  onPractice: () => void;
}) {
  return (
    <section className="rounded-2xl border border-stone bg-white p-6 text-center shadow-sm">
      <p className="font-serif text-5xl font-semibold">
        {score}/{total}
      </p>
      <p className="mt-2 text-stone-600">
        {score === total ? "Optime! A perfect round." : score >= total / 2 ? "Bene! Nice work." : "Keep going. Misses come back soon."}
      </p>
      {mode === "due" && <p className="mt-1 text-sm text-stone-500">Words you got right come back later, spaced further apart each time.</p>}
      <div className="mt-5 flex justify-center gap-3">
        <button onClick={onPractice} className="rounded-full border border-stone px-4 py-2 text-sm hover:border-terracotta">
          Practice more
        </button>
        <Link href="/" className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-terracotta">
          Decode a document
        </Link>
      </div>
    </section>
  );
}

function EmptyState({ nextDue, hasWords, onPractice }: { nextDue: string | null; hasWords: boolean; onPractice: () => void }) {
  if (!hasWords) {
    return (
      <Notice>
        Your Codex is empty.{" "}
        <Link href="/" className="font-medium text-terracotta underline">
          Decode a document
        </Link>{" "}
        and save some roots or abbreviations to start reviewing.
      </Notice>
    );
  }
  return (
    <Notice>
      <p>
        All caught up! Your next review is <strong>{nextDue ? describeDue(nextDue) : "soon"}</strong>.
      </p>
      <button onClick={onPractice} className="mt-3 rounded-full border border-stone px-4 py-2 text-sm hover:border-terracotta">
        Practice anyway
      </button>
    </Notice>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-stone p-6 text-stone-600">{children}</div>;
}
