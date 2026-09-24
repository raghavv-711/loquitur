import type { Metadata } from "next";
import { PrintButton } from "@/components/PrintButton";
import { ABBREVIATIONS } from "@/lib/dictionary";
import { abbrevDisplay } from "@/lib/display";

export const metadata: Metadata = {
  title: "Pocket card",
  description: "A printable card of 20 prescription abbreviations and what they mean, to keep in a wallet or give to someone.",
};

// The 20 on the card, in the order you'd meet them on a label: how, how often, when, then eyes.
// `plain` overrides the dictionary's wording where it's too long for a card.
const CARD: { key: string; plain?: string }[] = [
  { key: "PO" },
  { key: "SL", plain: "under the tongue" },
  { key: "BID" },
  { key: "TID" },
  { key: "QID" },
  { key: "QD" },
  { key: "QOD" },
  { key: "QHS" },
  { key: "PRN" },
  { key: "STAT" },
  { key: "AC" },
  { key: "PC" },
  { key: "C", plain: "with" },
  { key: "S", plain: "without" },
  { key: "NPO" },
  { key: "GTT" },
  { key: "OD" },
  { key: "OS" },
  { key: "OU" },
  { key: "SIG", plain: "directions" },
];

const ROWS = CARD.map(({ key, plain }) => {
  const entry = ABBREVIATIONS[key];
  return { key, display: abbrevDisplay(key), plain: plain ?? entry.plain, latin: entry.expansion, warn: !!entry.warning };
});

export default function PocketCardPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-12 pt-8 sm:px-8 sm:pt-12 print:p-0">
      <header className="mb-8 print:hidden">
        <h1 className="font-serif text-5xl font-medium sm:text-6xl">Pocket card</h1>
        <p className="mt-2 max-w-2xl text-[17px] leading-relaxed text-muted">
          Twenty abbreviations you&apos;ll often see on prescription labels, on one index card. Print it, cut along the
          dashed line, and keep it in your wallet, or give one to someone who could use it.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-6">
          <PrintButton />
          <span className="-rotate-1 font-hand text-2xl text-accent">prints at 4 × 6 inches, an index card</span>
        </div>
      </header>

      {/* The card itself: cream paper on screen, plain black on white when printed. */}
      <article className="mx-auto w-full max-w-[6in] rotate-[0.6deg] rounded-sm bg-paper p-5 text-ink shadow-[0_18px_40px_rgba(0,0,0,0.35)] sm:p-6 print:h-[4in] print:w-[6in] print:max-w-none print:rotate-0 print:rounded-none print:border print:border-dashed print:border-black print:bg-white print:p-[0.22in] print:text-black print:shadow-none">
        <div className="flex items-baseline justify-between border-b border-paper-line pb-1.5 print:border-black/30">
          <h2 className="font-serif text-[22px] font-semibold leading-none">Prescription shorthand</h2>
          <span className="text-[9px] uppercase tracking-[0.14em] text-[#6f6556] print:text-black/60">Loquitur pocket card</span>
        </div>

        <dl className="mt-2 grid grid-flow-col grid-cols-2 grid-rows-10 gap-x-5">
          {ROWS.map((r) => (
            <div key={r.key} className="flex items-baseline gap-2 border-b border-paper-line/70 py-[2px] print:border-black/15">
              <dt className="w-10 shrink-0 font-serif text-[15px] font-semibold leading-tight">
                {r.display}
                {r.warn && <sup className="text-[#7a3317] print:text-black">†</sup>}
              </dt>
              <dd className="min-w-0 text-[11px] leading-tight">
                {r.plain}
                <em className="ml-1 text-[9.5px] text-[#6f6556] print:text-black/60">{r.latin}</em>
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-2 text-[9.5px] leading-snug">
          <span className="text-[#7a3317] print:text-black">†</span> Easy to misread. If your label uses one, ask your
          pharmacist to confirm. Ears use AD, AS, AU (right, left, both), easily mixed up with the eyes.
        </p>
        <div className="mt-1 flex items-baseline justify-between text-[9px] text-[#6f6556] print:text-black/60">
          <span>Not medical advice. Always follow your pharmacist&apos;s directions.</span>
          <span>loquitur.vercel.app</span>
        </div>
      </article>
    </main>
  );
}
