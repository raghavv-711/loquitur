import Link from "next/link";
import { abbreviationEntry, rootEntry } from "@/lib/codex";
import type { VerifiedTerm } from "@/lib/schema";
import { ReportMistake } from "./ReportMistake";
import { SaveButton } from "./SaveButton";

// How each kind of word is marked in the document, like a reader's pen (hand-drawn strokes in globals.css):
// a gold line for medical words, blue dots for abbreviations, a rose wave for drugs.
export const KIND_STYLES = {
  abbreviation: { label: "Abbreviation", mark: "ink-dotted text-[#cfdcf7]" },
  medical_term: { label: "Medical term", mark: "ink-solid text-[#f3e3bd]" },
  drug: { label: "Drug", mark: "ink-wavy text-[#f5d2c2]" },
} as const;

// Status notes sit on the paper-colored card, so they use darker inks.
const STATUS = {
  verified: { label: "✓ Checked", className: "text-[#3f6a4f]", note: "Found in the Loquitur dictionary." },
  draft: {
    label: "◌ Draft entry",
    className: "text-[#3d5a8a]",
    note: "From Loquitur's dictionary, still awaiting expert review.",
  },
  partial: { label: "◐ Partly checked", className: "text-[#8a5a17]", note: "Some word parts are in Loquitur's dictionary." },
  unverified: {
    label: "? Unchecked",
    className: "text-[#6f6556]",
    note: "AI explanation only. Ask your pharmacist if you're unsure.",
  },
} as const;

// Drugs are checked against the FDA database rather than Loquitur's dictionary.
function drugStatus(term: VerifiedTerm) {
  if (term.kind !== "drug") return null;
  return term.fda
    ? { ...STATUS.verified, note: "Found in the FDA's drug label database (openFDA)." }
    : { ...STATUS.unverified, note: "Not found in the FDA database. Ask your pharmacist if you're unsure." };
}

export function TermCard({ term, onClose }: { term: VerifiedTerm; onClose: () => void }) {
  const kind = KIND_STYLES[term.kind];
  const status = drugStatus(term) ?? STATUS[term.status];

  return (
    // An index card, tilted slightly as if set down on the desk.
    <article className="rotate-[0.8deg] rounded-sm bg-paper p-6 text-ink shadow-[0_18px_40px_rgba(0,0,0,0.35)] sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs uppercase tracking-[0.14em] text-[#6f6556]">{kind.label}</span>
          <h3 className="mt-1 font-serif text-4xl font-semibold leading-none sm:text-5xl">{term.text}</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-sm px-2 text-2xl text-[#6f6556] hover:text-ink"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {term.expansion && (
        <p className="mt-4 border-b border-paper-line pb-3 text-lg">
          <em>{term.expansion}</em>
          {term.literal && <span> · “{term.literal}”</span>}
        </p>
      )}

      <p className="mt-3 text-lg leading-relaxed">{term.plain}</p>

      {term.warning && (
        <p className="mt-3 border-t border-paper-line pt-3 text-[15px] leading-relaxed text-[#7a3317]">{term.warning}</p>
      )}

      {term.fda && (
        <div className="mt-4 rounded-sm bg-[#ece4d2] p-3 text-sm">
          <h4 className="text-xs uppercase tracking-[0.14em] text-[#6f6556]">FDA drug label</h4>
          <p className="mt-1">
            <strong className="capitalize">{term.fda.genericName.toLowerCase()}</strong>
            {term.fda.brandName && <span className="text-[#5c5446]"> · brand: {term.fda.brandName}</span>}
          </p>
          {term.fda.usedFor && (
            <>
              <p className="mt-1 text-ink">“{term.fda.usedFor}”</p>
              <p className="mt-1 text-xs text-[#5c5446]">
                This is the officially approved use. Doctors sometimes prescribe a medicine for other reasons too.
              </p>
            </>
          )}
          {term.fda.labelUrl && (
            <a
              href={term.fda.labelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block font-semibold text-ink underline underline-offset-2 hover:text-[#8a5a17]"
            >
              Read the full label on DailyMed ↗
            </a>
          )}
        </div>
      )}

      {term.roots.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs uppercase tracking-[0.14em] text-[#6f6556]">Word parts</h4>
          <ul className="mt-2 space-y-2">
            {term.roots.map((root, i) => (
              <li key={i} className="border-t border-paper-line pt-2">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  {(() => {
                    const entry = rootEntry(root, term.text);
                    return entry ? (
                      <span className="order-last ml-auto">
                        <SaveButton entry={entry} onPaper />
                      </span>
                    ) : null;
                  })()}
                  <Link
                    href={`/dictionary?q=${encodeURIComponent(root.root.replace(/^-+|-+$/g, ""))}`}
                    className="font-serif text-xl font-semibold hover:text-[#8a5a17]"
                    title="See this root in the dictionary"
                  >
                    {root.root}
                  </Link>
                  <span className="text-sm text-[#5c5446]">
                    {root.origin} · <strong>{root.meaning}</strong>
                  </span>
                  {root.draft ? (
                    <span className="text-xs text-[#3d5a8a]">(draft)</span>
                  ) : (
                    !root.verified && <span className="text-xs text-[#8a8070]">(unverified)</span>
                  )}
                </div>
                {root.hook && <p className="mt-1 font-hand text-xl leading-tight text-[#8a5a17]">{root.hook}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(() => {
        const entry = abbreviationEntry(term);
        return entry ? (
          <div className="mt-4">
            <SaveButton entry={entry} label="Save to My Words" onPaper />
          </div>
        ) : null;
      })()}

      <p className={`mt-4 text-xs ${status.className}`}>
        {status.label} <span className="text-[#5c5446]">· {status.note}</span>
      </p>
      <p className="mt-1 text-xs text-[#5c5446]">
        <ReportMistake word={term.text} className="decoration-paper-line hover:text-ink" />
      </p>
    </article>
  );
}
