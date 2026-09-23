import { abbreviationEntry, rootEntry } from "@/lib/codex";
import type { VerifiedTerm } from "@/lib/schema";
import { SaveButton } from "./SaveButton";

export const KIND_STYLES = {
  abbreviation: { label: "Abbreviation", mark: "bg-sky-400/15 decoration-sky-400", chip: "bg-sky-400/15 text-sky-200" },
  medical_term: { label: "Medical term", mark: "bg-emerald-400/15 decoration-emerald-400", chip: "bg-emerald-400/15 text-emerald-200" },
  drug: { label: "Drug", mark: "bg-rose-400/15 decoration-rose-400", chip: "bg-rose-400/15 text-rose-200" },
} as const;

const STATUS = {
  verified: { label: "✓ Verified", className: "text-emerald-300", note: "Checked against Loquitur's dictionary." },
  draft: {
    label: "◌ Draft entry",
    className: "text-sky-300",
    note: "From Loquitur's dictionary, still awaiting expert review.",
  },
  partial: { label: "◐ Partly verified", className: "text-amber-300", note: "Some word parts are in Loquitur's dictionary." },
  unverified: {
    label: "? Unverified",
    className: "text-muted",
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
    <article className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${kind.chip}`}>{kind.label}</span>
          <h3 className="mt-2 font-serif text-2xl font-semibold">{term.text}</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-full px-2 text-xl text-faint hover:text-fg"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {term.expansion && (
        <p className="mt-2 font-serif text-lg italic text-accent">
          {term.expansion}
          {term.literal && <span className="not-italic text-muted"> — “{term.literal}”</span>}
        </p>
      )}

      <p className="mt-3 text-base">{term.plain}</p>

      {term.warning && (
        <p className="mt-3 rounded-lg bg-amber-400/10 p-3 text-sm text-amber-200">⚠️ {term.warning}</p>
      )}

      {term.fda && (
        <div className="mt-4 rounded-lg bg-surface-2 p-3 text-sm">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">FDA drug label</h4>
          <p className="mt-1">
            <strong className="capitalize">{term.fda.genericName.toLowerCase()}</strong>
            {term.fda.brandName && <span className="text-muted"> · brand: {term.fda.brandName}</span>}
          </p>
          {term.fda.usedFor && (
            <>
              <p className="mt-1 text-fg/85">“{term.fda.usedFor}”</p>
              <p className="mt-1 text-xs text-muted">
                This is the officially approved use. Doctors sometimes prescribe a medicine for other reasons too.
              </p>
            </>
          )}
          {term.fda.labelUrl && (
            <a
              href={term.fda.labelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-accent underline underline-offset-2"
            >
              Read the full label on DailyMed ↗
            </a>
          )}
        </div>
      )}

      {term.roots.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">Word parts</h4>
          <ul className="mt-2 space-y-2">
            {term.roots.map((root, i) => (
              <li key={i} className="rounded-lg bg-surface-2 p-3">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  {(() => {
                    const entry = rootEntry(root, term.text);
                    return entry ? (
                      <span className="order-last ml-auto">
                        <SaveButton entry={entry} />
                      </span>
                    ) : null;
                  })()}
                  <span className="font-serif text-lg font-semibold">{root.root}</span>
                  <span className="text-sm text-muted">
                    {root.origin} · <strong>{root.meaning}</strong>
                  </span>
                  {root.draft ? (
                    <span className="text-xs text-sky-300">(draft)</span>
                  ) : (
                    !root.verified && <span className="text-xs text-faint">(unverified)</span>
                  )}
                </div>
                {root.hook && <p className="mt-1 text-sm text-muted">💡 {root.hook}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {(() => {
        const entry = abbreviationEntry(term);
        return entry ? (
          <div className="mt-4">
            <SaveButton entry={entry} label="Save to Codex" />
          </div>
        ) : null;
      })()}

      <p className={`mt-4 text-xs ${status.className}`}>
        {status.label} <span className="text-muted">· {status.note}</span>
      </p>
    </article>
  );
}
