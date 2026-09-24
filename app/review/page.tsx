"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SignInDialog } from "@/components/AuthBar";
import { QuestionCard } from "@/components/QuestionCard";
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
      if (all.error) return setError("Your words didn't load. Refresh the page to try again.");
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
        <h1 className="font-serif text-5xl font-medium sm:text-6xl">Review</h1>
        <p className="mt-1 font-serif text-lg italic text-muted">
          {mode === "practice" ? "Practice round: this won't change your schedule." : "Five minutes a day keeps the Latin fresh."}
        </p>
      </header>

      {!enabled ? (
        <Notice>Accounts aren&apos;t set up on this copy of Loquitur yet.</Notice>
      ) : loading ? (
        <Notice>Loading…</Notice>
      ) : !user ? (
        <Notice>
          <button onClick={() => setSigningIn(true)} className="font-medium text-accent underline">
            Sign in
          </button>{" "}
          to review your saved words.
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
    <section className="rounded-md border border-line bg-surface p-6 text-center">
      <p className="font-serif text-5xl font-semibold">
        {score}/{total}
      </p>
      <p className="mt-2 text-muted">
        {score === total ? "Optime! A perfect round." : score >= total / 2 ? "Bene! Nice work." : "Keep going. Misses come back soon."}
      </p>
      {mode === "due" && <p className="mt-1 text-sm text-muted">Words you got right come back later, spaced further apart each time.</p>}
      <div className="mt-5 flex justify-center gap-3">
        <button onClick={onPractice} className="rounded-sm border border-line px-4 py-2 text-sm hover:border-accent">
          Practice more
        </button>
        <Link href="/" className="rounded-sm bg-accent px-4 py-2 text-sm font-medium text-bg hover:brightness-110">
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
        You haven&apos;t saved any words yet.{" "}
        <Link href="/" className="font-medium text-accent underline">
          Decode a document
        </Link>{" "}
        and save some roots or abbreviations to start reviewing.
      </Notice>
    );
  }
  return (
    <Notice>
      <p>
        That&apos;s everything for now. Come back <strong>{nextDue ? describeDue(nextDue) : "soon"}</strong> and a few will be ready.
      </p>
      <button onClick={onPractice} className="mt-3 rounded-sm border border-line px-4 py-2 text-sm hover:border-accent">
        Practice anyway
      </button>
    </Notice>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <div className="rounded-md border border-dashed border-line p-6 text-muted">{children}</div>;
}
