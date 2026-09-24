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
    <div className="whitespace-pre-wrap border-l-2 border-accent bg-surface px-5 py-5 text-lg leading-[2.05] text-[#dfe4ef] sm:px-7 sm:py-6 sm:text-xl">
      {segments.map((segment, i) => {
        if (segment.termIndex === null) return <span key={i}>{segment.text}</span>;
        const term = terms[segment.termIndex];
        const isSelected = selected === segment.termIndex;
        return (
          <button
            key={i}
            onClick={() => onSelect(segment.termIndex!)}
            className={`rounded-xs px-0.5 underline decoration-[1.5px] underline-offset-[6px] transition ${
              isSelected ? "bg-accent text-bg no-underline" : `${KIND_STYLES[term.kind].mark} hover:bg-accent/15`
            }`}
          >
            {segment.text}
          </button>
        );
      })}
    </div>
  );
}
