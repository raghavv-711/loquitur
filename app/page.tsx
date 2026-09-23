"use client";

import { useState } from "react";
import { HighlightedText } from "@/components/HighlightedText";
import { KIND_STYLES, TermCard } from "@/components/TermCard";
import type { DecodeResponse } from "@/lib/schema";

// Made-up examples. Never use real patient documents for demos or testing.
const SAMPLES = [
  {
    name: "Prescription label",
    text: `Rx #4410293    Dr. A. Patel
AMOXICILLIN 500 MG CAP
Sig: 1 cap PO TID x 10 days pc
Disp: #30   Refills: 0`,
  },
  {
    name: "After-visit summary",
    text: `Diagnosis: Bilateral nephrolithiasis with mild hydronephrosis. History of hypertension.
Plan: Increase PO fluid intake. Ibuprofen 400 mg PO q6h PRN pain.
Tamsulosin 0.4 mg PO QHS.
NPO after midnight before follow-up cystoscopy.
Return STAT if fever or hematuria.`,
  },
];

export default function Home() {
  const [input, setInput] = useState("");
  const [decodedText, setDecodedText] = useState("");
  const [result, setResult] = useState<DecodeResponse | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decode() {
    setLoading(true);
    setError(null);
    setResult(null);
    setSelected(null);
    try {
      const res = await fetch("/api/decode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setDecodedText(input);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const selectedTerm = result && selected !== null ? result.terms[selected] : null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">Loquitur</h1>
        <p className="mt-1 font-serif text-lg italic text-stone-600">
          Your medical paperwork, in plain English.
        </p>
      </header>

      <section className="rounded-2xl border border-stone bg-white p-5 shadow-sm">
        <label htmlFor="doc" className="text-sm font-medium">
          Paste text from a prescription label or after-visit summary
        </label>
        <textarea
          id="doc"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          placeholder="e.g. Take 1 tab PO BID pc x 7 days"
          className="mt-2 w-full resize-y rounded-xl border border-stone bg-parchment p-3 font-mono text-[15px] outline-none focus:border-terracotta"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={decode}
            disabled={loading || !input.trim()}
            className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-white transition hover:bg-terracotta disabled:opacity-40"
          >
            {loading ? "Decoding…" : "Decode"}
          </button>
          <span className="text-sm text-stone-500">or try:</span>
          {SAMPLES.map((sample) => (
            <button
              key={sample.name}
              onClick={() => setInput(sample.text)}
              className="rounded-full border border-stone px-3 py-1.5 text-sm hover:border-terracotta"
            >
              {sample.name}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-stone-500">
          Your text is sent to the AI to be decoded and is never stored.
        </p>
      </section>

      {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}

      {result && (
        <section className="mt-8">
          <div className="rounded-2xl bg-ink p-5 text-parchment">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-300">What this says</h2>
            <p className="mt-2 text-lg">{result.summary}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-xs">
            {Object.values(KIND_STYLES).map((kind) => (
              <span key={kind.label} className={`rounded-full px-2 py-0.5 font-medium ${kind.chip}`}>
                {kind.label}
              </span>
            ))}
            <span className="text-stone-500">Tap a highlighted word to decode it.</span>
          </div>

          <div className="mt-3 grid gap-6 md:grid-cols-[1fr_minmax(0,380px)]">
            <HighlightedText
              text={decodedText}
              terms={result.terms}
              selected={selected}
              onSelect={setSelected}
            />
            <div className="md:sticky md:top-6 md:self-start">
              {selectedTerm ? (
                <TermCard term={selectedTerm} onClose={() => setSelected(null)} />
              ) : (
                <div className="rounded-2xl border border-dashed border-stone p-5 text-sm text-stone-500">
                  Found {result.terms.length} term{result.terms.length === 1 ? "" : "s"}. Tap one to see what it
                  means and where the word comes from.
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <footer className="mt-12 border-t border-stone pt-4 text-xs text-stone-500">
        Loquitur explains words. It is not medical advice. Ask your pharmacist or doctor about your care.
      </footer>
    </main>
  );
}
