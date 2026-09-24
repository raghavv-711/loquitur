"use client";

import Image from "next/image";
import { useState } from "react";
import { HighlightedText } from "@/components/HighlightedText";
import { InstallPrompt } from "@/components/InstallPrompt";
import { ReadAloud } from "@/components/ReadAloud";
import { KIND_STYLES, TermCard } from "@/components/TermCard";
import { WordOfTheDay } from "@/components/WordOfTheDay";
import { prepareImage, type PreparedImage } from "@/lib/image";
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

const SAMPLE_PHOTO = "/samples/rx-label.svg";

export default function Home() {
  const [input, setInput] = useState("");
  const [photo, setPhoto] = useState<PreparedImage | null>(null);
  const [decodedText, setDecodedText] = useState("");
  const [result, setResult] = useState<DecodeResponse | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePhoto(source: Blob) {
    setError(null);
    try {
      setPhoto(await prepareImage(source));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't open that photo.");
    }
  }

  async function loadSamplePhoto() {
    const res = await fetch(SAMPLE_PHOTO);
    await handlePhoto(await res.blob());
  }

  async function decode() {
    setLoading(true);
    setError(null);
    setResult(null);
    setSelected(null);
    try {
      const body = photo
        ? { image: { data: photo.data, mediaType: photo.mediaType } }
        : { text: input };
      const res = await fetch("/api/decode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data: DecodeResponse & { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setDecodedText(photo ? (data.transcript ?? "") : input);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const selectedTerm = result && selected !== null ? result.terms[selected] : null;
  const canDecode = !loading && (photo !== null || input.trim().length > 0);

  return (
    <main className="mx-auto max-w-5xl px-4 pb-10 pt-4 sm:px-6">
      <header className="mb-8 text-center">
        <h1 className="sr-only">Loquitur</h1>
        <Image
          src="/brand/logo.png"
          alt="Loquitur"
          width={720}
          height={587}
          priority
          className="mx-auto w-56 sm:w-72"
        />
        <p className="mt-2 font-serif text-lg italic text-muted">Your medical paperwork, in plain English.</p>
      </header>

      <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
        {photo ? (
          <div>
            <p className="text-sm font-medium">Your photo</p>
            {/* eslint-disable-next-line @next/next/no-img-element -- local data URL preview */}
            <img
              src={photo.previewUrl}
              alt="Uploaded document"
              className="mt-2 max-h-72 w-auto rounded-xl border border-line"
            />
            <button
              onClick={() => setPhoto(null)}
              className="mt-2 text-sm text-muted underline underline-offset-2 hover:text-fg"
            >
              Remove photo and paste text instead
            </button>
          </div>
        ) : (
          <>
            <label htmlFor="doc" className="text-sm font-medium">
              Paste text from a prescription label or after-visit summary, or upload a photo
            </label>
            <textarea
              id="doc"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={6}
              placeholder="e.g. Take 1 tab PO BID pc x 7 days"
              className="mt-2 w-full resize-y rounded-xl border border-line bg-surface-2 p-3 font-mono text-[15px] outline-none focus:border-accent"
            />
          </>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={decode}
            disabled={!canDecode}
            className="rounded-full bg-linear-to-r from-accent to-accent-2 px-5 py-2 text-sm font-medium text-bg transition hover:brightness-110 disabled:opacity-40"
          >
            {loading ? (photo ? "Reading photo…" : "Decoding…") : "Decode"}
          </button>
          {/* On phones this offers the camera or photo library. */}
          <label className="cursor-pointer rounded-full border border-accent px-4 py-1.5 text-sm font-medium hover:border-accent hover:text-accent">
            📷 {photo ? "Choose another photo" : "Upload a photo"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhoto(file);
                e.target.value = ""; // allow picking the same file again
              }}
            />
          </label>
          <span className="text-sm text-muted">or try:</span>
          {SAMPLES.map((sample) => (
            <button
              key={sample.name}
              onClick={() => {
                setPhoto(null);
                setInput(sample.text);
              }}
              className="rounded-full border border-line px-3 py-1.5 text-sm hover:border-accent"
            >
              {sample.name}
            </button>
          ))}
          <button
            onClick={loadSamplePhoto}
            className="rounded-full border border-line px-3 py-1.5 text-sm hover:border-accent"
          >
            Sample photo
          </button>
        </div>
        <p className="mt-3 text-xs text-muted">
          Your text or photo is sent to the AI to be decoded and is never stored.
        </p>
      </section>

      {error && <p className="mt-6 rounded-xl bg-red-400/10 p-4 text-sm text-red-200">{error}</p>}

      {/* Before anything is decoded, teach one root a day. */}
      {!result && !loading && (
        <div className="mt-8">
          <WordOfTheDay />
        </div>
      )}

      {result && (
        <section className="mt-8">
          <div className="rounded-2xl border border-line bg-surface-2 p-5 text-fg">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-accent">What this says</h2>
              <ReadAloud text={result.summary} />
            </div>
            <p className="mt-2 text-lg">{result.summary}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-xs">
            {Object.values(KIND_STYLES).map((kind) => (
              <span key={kind.label} className={`rounded-full px-2 py-0.5 font-medium ${kind.chip}`}>
                {kind.label}
              </span>
            ))}
            <span className="text-muted">Tap a highlighted word to decode it.</span>
          </div>

          <div className="mt-3 grid gap-6 md:grid-cols-[1fr_minmax(0,380px)]">
            <div>
              {result.transcript !== undefined && (
                <p className="mb-2 text-xs text-muted">
                  What Loquitur read from your photo. Check it against the label: photos can be misread.
                </p>
              )}
              {decodedText ? (
                <HighlightedText
                  text={decodedText}
                  terms={result.terms}
                  selected={selected}
                  onSelect={setSelected}
                />
              ) : (
                <p className="rounded-2xl border border-line bg-surface p-5 text-sm text-muted">
                  No readable text found. Try a sharper, well-lit photo taken straight on.
                </p>
              )}
            </div>
            <div className="md:sticky md:top-6 md:self-start">
              {selectedTerm ? (
                <TermCard term={selectedTerm} onClose={() => setSelected(null)} />
              ) : (
                <div className="rounded-2xl border border-dashed border-line p-5 text-sm text-muted">
                  Found {result.terms.length} term{result.terms.length === 1 ? "" : "s"}. Tap one to see what it
                  means and where the word comes from.
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="mt-8">
        <InstallPrompt />
      </div>

      <p className="mt-12 text-xs text-muted">
        Loquitur explains words. It is not medical advice. Ask your pharmacist or doctor about your care.
      </p>
    </main>
  );
}
