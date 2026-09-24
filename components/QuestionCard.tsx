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

  // A flashcard on cream paper, with the choices lettered like an exam paper.
  return (
    <section className="rounded-sm bg-paper p-6 text-ink shadow-[0_18px_40px_rgba(0,0,0,0.35)] sm:p-8">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs uppercase tracking-[0.14em] text-[#6f6556]">
          {q.type === "decode" ? "Decode it yourself" : card.entry.kind === "root" ? "Word root" : "Abbreviation"}
        </span>
        <span className="font-hand text-[22px] text-[#8a5a17]">card {position}</span>
      </div>
      <p className="mt-5 text-lg">{q.prompt}</p>
      <h2 className="mt-1 font-serif text-5xl font-semibold leading-none sm:text-6xl">{q.subject}</h2>
      {q.hint && <p className="mt-2 font-serif text-xl italic text-[#5c5446]">{q.hint}</p>}

      <ol className="mt-7 border-t border-paper-line">
        {q.options.map((option, i) => {
          const style = !answered
            ? "hover:bg-[#ece4d2]"
            : i === q.answer
              ? "bg-[#dfe8d9] text-[#23452f]"
              : i === chosen
                ? "bg-[#f1d9cc] text-[#7a3317] line-through decoration-1"
                : "opacity-45";
          return (
            <li key={i} className="border-b border-paper-line">
              <button
                onClick={() => onAnswer(i)}
                disabled={answered}
                className={`flex w-full items-baseline gap-4 px-2 py-3 text-left text-lg transition ${style}`}
              >
                <span className="w-5 shrink-0 font-serif italic text-[#8a5a17]">{"abcdef"[i]})</span>
                <span>{option}</span>
                {answered && i === q.answer && <span className="ml-auto font-hand text-2xl">✓</span>}
              </button>
            </li>
          );
        })}
      </ol>

      {answered && (
        <div className="mt-6">
          <p className={`font-hand text-[28px] leading-none ${correct ? "text-[#3f6a4f]" : "text-[#7a3317]"}`}>
            {correct ? 'Recte! (that means "correctly")' : practice ? "Not quite." : "Not quite. It'll come back in a few minutes."}
          </p>
          <p className="mt-2 text-[17px] leading-relaxed text-[#3d3a33]">{q.explanation}</p>
          {error && <p className="mt-2 text-sm text-[#7a3317]">{error}</p>}
          <div className="mt-5 flex flex-wrap items-center gap-5">
            <button
              onClick={onNext}
              autoFocus
              className="rounded-sm bg-ink px-6 py-2.5 font-semibold text-paper transition hover:bg-[#2c3550]"
            >
              Next card →
            </button>
            {extra}
          </div>
        </div>
      )}
    </section>
  );
}
