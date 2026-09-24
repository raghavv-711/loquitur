"use client";

import { useState } from "react";
import { translateSig } from "@/lib/sig";

type Row = { id: number; label: string; forWhat: string };

const EXAMPLE: Omit<Row, "id">[] = [
  { label: "Lisinopril 10 mg 1 tab PO QD", forWhat: "blood pressure" },
  { label: "Metformin 500 mg 1 tab PO BID c̄ meals", forWhat: "blood sugar" },
  { label: "Latanoprost 1 gtt OS QHS", forWhat: "glaucoma" },
];

let nextId = 1;
const blank = (): Row => ({ id: nextId++, label: "", forWhat: "" });

// The medicine's name is whatever comes before the first number ("Metformin" in "Metformin 500 mg …").
function splitName(plain: string): { name: string; rest: string } {
  const m = plain.match(/^(\D+?)\s+(?=\d)/);
  return m ? { name: m[1], rest: plain.slice(m[0].length) } : { name: "", rest: plain };
}

// Build a fridge card of someone's medicines. Everything stays in this browser tab: nothing is sent or saved.
export function MedicinesCard() {
  const [rows, setRows] = useState<Row[]>(() => [blank()]);
  const [whose, setWhose] = useState("");
  const [pharmacy, setPharmacy] = useState("");

  const update = (id: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const filled = rows.filter((r) => r.label.trim());

  return (
    <>
      <section className="print:hidden">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Whose medicines? (optional)" value={whose} onChange={setWhose} placeholder="e.g. Grandma" />
          <Field label="Pharmacy phone (optional)" value={pharmacy} onChange={setPharmacy} placeholder="e.g. 615-555-0100" />
        </div>

        <ol className="mt-8 flex flex-col gap-6">
          {rows.map((row, i) => {
            const t = row.label.trim() ? translateSig(row.label) : null;
            return (
              <li key={row.id} className="border-l-2 border-line pl-4 sm:pl-6">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-serif text-xl italic text-accent">Medicine {i + 1}</span>
                  {rows.length > 1 && (
                    <button onClick={() => setRows((rs) => rs.filter((r) => r.id !== row.id))} className="text-sm text-faint hover:text-accent">
                      remove
                    </button>
                  )}
                </div>
                <div className="mt-2 grid gap-4 sm:grid-cols-[2fr_1fr]">
                  <Field
                    label="What the label says"
                    value={row.label}
                    onChange={(v) => update(row.id, { label: v })}
                    placeholder="Amoxicillin 500 mg 1 cap PO TID x 10 days"
                  />
                  <Field
                    label="What it's for (optional)"
                    value={row.forWhat}
                    onChange={(v) => update(row.id, { forWhat: v })}
                    placeholder="e.g. infection"
                  />
                </div>
                {t && <p className="mt-2 text-[17px] text-muted">&rarr; {t.plain}</p>}
              </li>
            );
          })}
        </ol>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <button onClick={() => setRows((rs) => [...rs, blank()])} className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent">
            + add another medicine
          </button>
          <button
            onClick={() => setRows(EXAMPLE.map((e) => ({ ...e, id: nextId++ })))}
            className="text-muted underline decoration-line-strong underline-offset-4 hover:text-accent"
          >
            fill in an example
          </button>
        </div>
      </section>

      {filled.length > 0 && (
        <section className="mt-12 print:mt-0">
          <div className="mb-5 flex flex-wrap items-center gap-6 print:hidden">
            <button
              onClick={() => window.print()}
              className="h-12 rounded-sm bg-accent px-7 text-lg font-semibold text-bg transition hover:bg-accent-soft"
            >
              Print the card
            </button>
            <span className="-rotate-1 font-hand text-2xl text-accent">big print, made for the fridge</span>
          </div>

          {/* The card: cream on screen, black on white when printed, in large type for older eyes. */}
          <article className="rounded-sm bg-paper p-6 text-ink shadow-[0_18px_40px_rgba(0,0,0,0.35)] sm:p-9 print:rounded-none print:bg-white print:p-0 print:text-black print:shadow-none">
            <header className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-ink pb-2 print:border-black">
              <h2 className="font-serif text-4xl font-semibold print:text-[30pt]">
                {whose.trim() ? `${whose.trim()}'s medicines` : "My medicines"}
              </h2>
              {pharmacy.trim() && <span className="text-lg print:text-[14pt]">Pharmacy: {pharmacy.trim()}</span>}
            </header>

            <ol>
              {filled.map((row) => {
                const t = translateSig(row.label);
                const { name, rest } = splitName(t.plain);
                return (
                  <li key={row.id} className="break-inside-avoid border-b border-paper-line py-4 print:border-black/30">
                    <p className="text-2xl leading-snug print:text-[18pt]">
                      {name && <strong className="font-serif text-[28px] font-semibold print:text-[21pt]">{name} </strong>}
                      {rest}
                    </p>
                    {row.forWhat.trim() && <p className="mt-1 text-lg print:text-[14pt]">For: {row.forWhat.trim()}</p>}
                    <p className="mt-1 text-sm text-[#6f6556] print:text-[10pt] print:text-black/60">Label says: {row.label.trim()}</p>
                    {t.warnings.map((w) => (
                      <p key={w} className="mt-1 text-[15px] font-semibold text-[#7a3317] print:text-[11pt] print:text-black">
                        Check: {w}
                      </p>
                    ))}
                    {t.askAbout.length > 0 && (
                      <p className="mt-1 text-[15px] font-semibold text-[#7a3317] print:text-[11pt] print:text-black">
                        Ask your pharmacist what {t.askAbout.join(", ")} means.
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>

            <footer className="mt-4 text-sm text-[#6f6556] print:text-[10pt] print:text-black/70">
              Made with Loquitur (loquitur.vercel.app) from the labels above. Not medical advice: always follow your
              pharmacist&apos;s and doctor&apos;s directions, and ask them if anything here doesn&apos;t match.
            </footer>
          </article>
        </section>
      )}
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[15px] text-muted">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-b border-line-strong bg-transparent pb-1.5 text-lg outline-none placeholder:italic placeholder:text-faint focus:border-accent"
      />
    </label>
  );
}
