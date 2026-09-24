"use client";

import type { CodexEntry } from "@/lib/codex";
import type { Question } from "@/lib/quiz";

// One multiple-choice question, shared by the Review page and the study decks.
export function QuestionCard({
  card,
  position,
  chosen,
  onAnswer,
  onNext,
  error,
  practice,
  extra,
}: {
  card: { entry: CodexEntry; question: Question };
  position: string;
  chosen: number | null;
  onAnswer: (i: number) => void;
  onNext: () => void;
  error: string | null;
  practice: boolean;
  extra?: React.ReactNode; // shown after answering, e.g. a Save button
}) {
  const q = card.question;
  const answered = chosen !== null;
  const correct = chosen === q.answer;

  return (
    <section className="rounded-md border border-line bg-surface p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {position} · {q.type === "decode" ? "Decode it yourself" : card.entry.kind === "root" ? "Word root" : "Abbreviation"}
      </p>
      <p className="mt-4 text-fg/85">{q.prompt}</p>
      <h2 className="mt-1 font-serif text-4xl font-semibold">{q.subject}</h2>
      {q.hint && <p className="mt-1 font-serif text-lg italic text-accent">{q.hint}</p>}

      <div className="mt-6 grid gap-2">
        {q.options.map((option, i) => {
          const style = !answered
            ? "border-line hover:border-accent"
            : i === q.answer
              ? "border-emerald-400 bg-emerald-400/10"
              : i === chosen
                ? "border-red-400 bg-red-400/10"
                : "border-line opacity-50";
          return (
            <button
              key={i}
              onClick={() => onAnswer(i)}
              disabled={answered}
              className={`rounded border px-4 py-3 text-left transition ${style}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-5">
          <p className={`font-medium ${correct ? "text-emerald-300" : "text-red-300"}`}>
            {correct ? "✓ Right!" : practice ? "Not quite." : "Not quite. It'll come back in a few minutes."}
          </p>
          <p className="mt-1 text-sm text-muted">{q.explanation}</p>
          {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
          {extra && <div className="mt-3">{extra}</div>}
          <button
            onClick={onNext}
            autoFocus
            className="mt-4 rounded-sm bg-accent px-5 py-2 text-sm font-medium text-bg hover:brightness-110"
          >
            Next →
          </button>
        </div>
      )}
    </section>
  );
}
