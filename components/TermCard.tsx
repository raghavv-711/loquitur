import type { VerifiedTerm } from "@/lib/schema";

export const KIND_STYLES = {
  abbreviation: { label: "Abbreviation", mark: "bg-sky-100 decoration-sky-500", chip: "bg-sky-100 text-sky-800" },
  medical_term: { label: "Medical term", mark: "bg-emerald-100 decoration-emerald-500", chip: "bg-emerald-100 text-emerald-800" },
  drug: { label: "Drug", mark: "bg-rose-100 decoration-rose-500", chip: "bg-rose-100 text-rose-800" },
} as const;

const STATUS = {
  verified: { label: "✓ Verified", className: "text-emerald-700", note: "Checked against Loquitur's dictionary." },
  partial: { label: "◐ Partly verified", className: "text-amber-700", note: "Some word parts are in Loquitur's dictionary." },
  unverified: {
    label: "? Unverified",
    className: "text-stone-500",
    note: "AI explanation only. Ask your pharmacist if you're unsure.",
  },
} as const;

export function TermCard({ term, onClose }: { term: VerifiedTerm; onClose: () => void }) {
  const kind = KIND_STYLES[term.kind];
  const status = STATUS[term.status];

  return (
    <article className="rounded-2xl border border-stone bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${kind.chip}`}>{kind.label}</span>
          <h3 className="mt-2 font-serif text-2xl font-semibold">{term.text}</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-full px-2 text-xl text-stone-400 hover:text-ink"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {term.expansion && (
        <p className="mt-2 font-serif text-lg italic text-terracotta">
          {term.expansion}
          {term.literal && <span className="not-italic text-stone-500"> — “{term.literal}”</span>}
        </p>
      )}

      <p className="mt-3 text-base">{term.plain}</p>

      {term.warning && (
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">⚠️ {term.warning}</p>
      )}

      {term.roots.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Word parts</h4>
          <ul className="mt-2 space-y-2">
            {term.roots.map((root, i) => (
              <li key={i} className="rounded-lg bg-parchment p-3">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-serif text-lg font-semibold">{root.root}</span>
                  <span className="text-sm text-stone-600">
                    {root.origin} · <strong>{root.meaning}</strong>
                  </span>
                  {!root.verified && <span className="text-xs text-stone-400">(unverified)</span>}
                </div>
                {root.hook && <p className="mt-1 text-sm text-stone-600">💡 {root.hook}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className={`mt-4 text-xs ${status.className}`}>
        {status.label} <span className="text-stone-500">· {status.note}</span>
      </p>
    </article>
  );
}
