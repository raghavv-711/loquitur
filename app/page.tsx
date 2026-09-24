"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { HighlightedText } from "@/components/HighlightedText";
import { InstallPrompt } from "@/components/InstallPrompt";
import { ReadAloud } from "@/components/ReadAloud";
import { PrintableResult } from "@/components/PrintableResult";
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
    <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-8 sm:pt-12 print:p-0">
      {/* Everything on screen; printing shows only the PrintableResult below. */}
      <div className="print:hidden">
        <header className="grid items-center gap-8 md:grid-cols-12 md:gap-10">
          <div className="flex flex-col gap-5 md:col-span-7">
            <h1 className="font-serif text-5xl font-medium leading-[0.98] sm:text-6xl lg:text-[80px]">
              Let your paperwork <em className="text-accent">speak</em> plainly.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-[#c3cadb] sm:text-xl">
              <em>Loquitur</em> is Latin for &ldquo;it speaks.&rdquo; Hand it a prescription label or a doctor&apos;s note,
              and it explains every word through the Latin and Greek underneath.
            </p>
            <Link href="/about" className="w-fit -rotate-1 font-hand text-[26px] text-accent transition hover:text-accent-soft">
              curious why I started this? &rarr;
            </Link>
          </div>
          <div className="hidden justify-center md:col-span-5 md:flex">
            <Image src="/brand/logo.png" alt="" width={720} height={587} priority className="w-72 lg:w-[340px]" />
          </div>
        </header>

        <section id="decode" className="mt-12 flex flex-col gap-4 sm:mt-16">
          {photo ? (
            <div>
              <p className="text-lg font-medium">Your photo</p>
              {/* eslint-disable-next-line @next/next/no-img-element -- local data URL preview */}
              <img
                src={photo.previewUrl}
                alt="Uploaded document"
                className="mt-3 max-h-72 w-auto rounded-sm border border-line"
              />
              <button
                onClick={() => setPhoto(null)}
                className="mt-3 text-muted underline underline-offset-4 hover:text-accent"
              >
                Remove photo and type text instead
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <label htmlFor="doc" className="text-lg font-medium">
                  What did the pharmacy or doctor give you?
                </label>
                <span className="-rotate-2 font-hand text-2xl text-accent">nothing handy? borrow one of my samples below</span>
              </div>
              <textarea
                id="doc"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={4}
                placeholder="Take 1 tab PO BID pc x 7 days"
                className="w-full resize-y rounded border border-[#2a3659] bg-surface-2 px-5 py-4 text-lg leading-relaxed outline-none placeholder:text-faint focus:border-accent sm:px-6 sm:text-xl"
              />
            </>
          )}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <button
              onClick={decode}
              disabled={!canDecode}
              className="h-12 rounded-sm bg-accent px-7 text-lg font-semibold text-bg transition hover:bg-accent-soft disabled:opacity-40"
            >
              {loading ? (photo ? "Reading photo…" : "Decoding…") : "Decode it"}
            </button>
            {/* On phones this offers the camera or photo library. */}
            <label className="flex h-12 cursor-pointer items-center gap-2.5 rounded-sm border border-line-strong px-5 text-[17px] transition hover:border-accent hover:text-accent">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                <circle cx="12" cy="13" r="3.5" />
              </svg>
              {photo ? "Choose another photo" : "Photo of a label"}
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
            <span className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
              <span className="text-faint">Or try one of mine:</span>
              {SAMPLES.map((sample) => (
                <button
                  key={sample.name}
                  onClick={() => {
                    setPhoto(null);
                    setInput(sample.text);
                  }}
                  className="text-accent hover:text-accent-soft"
                >
                  {sample.name.toLowerCase()}
                </button>
              ))}
              <button onClick={loadSamplePhoto} className="text-accent hover:text-accent-soft">
                photo of a bottle
              </button>
            </span>
          </div>
          <p className="text-sm text-faint">
            Your label goes to the AI to be read, then it&apos;s forgotten. Loquitur never saves it.{" "}
            <Link href="/privacy" className="text-muted underline decoration-line-strong underline-offset-4 hover:text-accent">
              How I handle your info
            </Link>
          </p>
        </section>

        {error && <p className="mt-8 border-l-2 border-red-300 bg-red-400/10 p-4 text-red-200">{error}</p>}

        {/* Before anything is decoded, teach one root a day. */}
        {!result && !loading && (
          <div className="mt-14">
            <WordOfTheDay />
          </div>
        )}

        {/* Things to print and keep, for people who'd rather have paper. */}
        {!result && !loading && (
          <section className="mt-12 grid gap-8 border-t border-line pt-8 sm:grid-cols-2">
            <Link href="/my-medicines" className="group">
              <span className="font-serif text-2xl font-semibold group-hover:text-accent">My medicines card &rarr;</span>
              <span className="mt-1 block text-muted">
                Type in your labels and print a big, plain-English list for the fridge.
              </span>
            </Link>
            <Link href="/pocket-card" className="group">
              <span className="font-serif text-2xl font-semibold group-hover:text-accent">Pocket card &rarr;</span>
              <span className="mt-1 block text-muted">Twenty label abbreviations on one index card for your wallet.</span>
            </Link>
          </section>
        )}

        {result && (
          <section className="mt-12 grid items-start gap-10 border-t border-line pt-9 md:grid-cols-12">
            <div className="flex flex-col gap-6 md:col-span-7">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xs uppercase tracking-[0.14em] text-accent">In plain English</h2>
                  <span className="flex items-center gap-2">
                    <ReadAloud text={result.summary} />
                    <button
                      onClick={() => window.print()}
                      className="flex shrink-0 items-center gap-1.5 rounded-sm border border-line px-3 py-1 text-xs font-medium text-accent hover:border-accent"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z" />
                      </svg>
                      Print this
                    </button>
                  </span>
                </div>
                <p className="mt-3 font-serif text-[28px] leading-snug sm:text-[34px]">{result.summary}</p>
              </div>

              <div>
                {result.transcript !== undefined && (
                  <p className="mb-2 text-sm text-faint">
                    Here&apos;s what I read from your photo. Double-check it against the label, since photos can fool me.
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
                  <p className="border-l-2 border-line bg-surface p-5 text-muted">
                    I couldn&apos;t read that one. Try again in good light, holding the phone straight over the label.
                  </p>
                )}
              </div>

              <p className="flex flex-wrap gap-x-2 text-[15px] text-faint">
                {Object.values(KIND_STYLES).map((kind) => (
                  <span key={kind.label}>
                    <span className={kind.mark}>{kind.label}</span>
                    {" ·"}
                  </span>
                ))}
                <span>tap an underlined word to see where it comes from</span>
              </p>
            </div>

            <div className="md:sticky md:top-6 md:col-span-5">
              {selectedTerm ? (
                <TermCard term={selectedTerm} onClose={() => setSelected(null)} />
              ) : (
                <p className="-rotate-1 font-hand text-[26px] leading-snug text-accent">
                  {result.terms.length} word{result.terms.length === 1 ? "" : "s"} worth knowing here. start with the
                  underlined ones
                </p>
              )}
            </div>
          </section>
        )}

        <div className="mt-12">
          <InstallPrompt />
        </div>
      </div>
      {result && <PrintableResult result={result} text={decodedText} />}
    </main>
  );
}
