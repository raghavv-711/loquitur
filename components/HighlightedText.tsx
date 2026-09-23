import { segmentText } from "@/lib/highlight";
import type { VerifiedTerm } from "@/lib/schema";
import { KIND_STYLES } from "./TermCard";

type Props = {
  text: string;
  terms: VerifiedTerm[];
  selected: number | null;
  onSelect: (index: number) => void;
};

export function HighlightedText({ text, terms, selected, onSelect }: Props) {
  const segments = segmentText(text, terms);

  return (
    <div className="whitespace-pre-wrap rounded-2xl border border-line bg-surface p-5 font-mono text-[15px] leading-8">
      {segments.map((segment, i) => {
        if (segment.termIndex === null) return <span key={i}>{segment.text}</span>;
        const term = terms[segment.termIndex];
        const isSelected = selected === segment.termIndex;
        return (
          <button
            key={i}
            onClick={() => onSelect(segment.termIndex!)}
            className={`rounded px-0.5 underline decoration-2 underline-offset-4 transition ${KIND_STYLES[term.kind].mark} ${
              isSelected ? "ring-2 ring-accent" : "hover:brightness-125"
            }`}
          >
            {segment.text}
          </button>
        );
      })}
    </div>
  );
}
