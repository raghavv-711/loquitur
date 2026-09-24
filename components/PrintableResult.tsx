import { segmentText } from "@/lib/highlight";
import type { DecodeResponse } from "@/lib/schema";

const KIND_LABEL = { abbreviation: "abbreviation", medical_term: "medical term", drug: "drug" } as const;

// A decoded document laid out for paper: the summary, the original with each explained word footnoted,
// then the footnotes. Hidden on screen; it's what prints when someone taps "Print this".
export function PrintableResult({ result, text }: { result: DecodeResponse; text: string }) {
  const segments = text ? segmentText(text, result.terms) : [];

  // Footnote numbers follow the order words first appear in the document; any word not found in the text goes last.
  const order: number[] = [];
  for (const s of segments) if (s.termIndex !== null && !order.includes(s.termIndex)) order.push(s.termIndex);
  result.terms.forEach((_, i) => !order.includes(i) && order.push(i));
  const number = new Map(order.map((termIndex, n) => [termIndex, n + 1]));

  const printed = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <article className="hidden text-black print:block">
      <header className="flex items-baseline justify-between border-b border-black pb-2">
        <span className="font-serif text-2xl font-semibold">Loquitur</span>
        <span className="text-xs text-black/60">Printed {printed}</span>
      </header>

      <h1 className="mt-5 text-[11px] uppercase tracking-[0.14em] text-black/60">In plain English</h1>
      <p className="mt-1 font-serif text-[15pt] leading-snug">{result.summary}</p>

      {text && (
        <>
          <h2 className="mt-6 text-[11px] uppercase tracking-[0.14em] text-black/60">
            {result.transcript !== undefined ? "What Loquitur read from the photo (check it against the label)" : "The original"}
          </h2>
          <p className="mt-1 whitespace-pre-wrap border-l-2 border-black/40 pl-4 text-[11.5pt] leading-relaxed">
            {segments.map((s, i) =>
              s.termIndex === null ? (
                <span key={i}>{s.text}</span>
              ) : (
                <span key={i}>
                  <strong className="font-semibold">{s.text}</strong>
                  <sup className="ml-px text-[8pt]">{number.get(s.termIndex)}</sup>
                </span>
              ),
            )}
          </p>
        </>
      )}

      <h2 className="mt-6 text-[11px] uppercase tracking-[0.14em] text-black/60">Words explained</h2>
      <ol className="mt-1 columns-2 gap-8 text-[10pt] leading-snug">
        {order.map((termIndex) => {
          const t = result.terms[termIndex];
          return (
            <li key={termIndex} className="mb-2.5 break-inside-avoid">
              <span className="mr-1 text-black/60">{number.get(termIndex)}.</span>
              <strong className="font-serif text-[12pt]">{t.text}</strong>{" "}
              <span className="text-black/60">({KIND_LABEL[t.kind]})</span>
              {t.expansion && (
                <span>
                  {" "}
                  <em>{t.expansion}</em>
                  {t.literal && <>, &ldquo;{t.literal}&rdquo;</>}
                </span>
              )}
              <span className="block">{t.plain}</span>
              {t.roots.length > 0 && (
                <span className="block text-black/70">
                  {t.roots.map((r) => `${r.root} (${r.origin}, ${r.meaning})`).join(" + ")}
                </span>
              )}
              {t.fda?.usedFor && <span className="block text-black/70">FDA label: {t.fda.usedFor}</span>}
              {t.warning && <span className="block font-semibold">{t.warning}</span>}
            </li>
          );
        })}
      </ol>

      <footer className="mt-6 border-t border-black/40 pt-2 text-[9pt] text-black/70">
        Loquitur explains words. It is not medical advice. If anything here doesn&apos;t match what you were told, ask
        your pharmacist or doctor. Decoded at loquitur.vercel.app.
      </footer>
    </article>
  );
}
