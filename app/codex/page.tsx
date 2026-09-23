"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SignInDialog } from "@/components/AuthBar";
import { useCodex } from "@/components/CodexProvider";
import type { AbbreviationDetails, CodexEntry, RootDetails } from "@/lib/codex";
import { describeDue } from "@/lib/review";
import { createClient } from "@/lib/supabase/client";

export default function CodexPage() {
  const { enabled, user, loading, remove } = useCodex();
  const [entries, setEntries] = useState<CodexEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!enabled || !user) return;
    createClient()
      .from("codex_entries")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError("Couldn't load your Codex. Refresh to try again.");
        else setEntries(data as CodexEntry[]);
      });
  }, [enabled, user]);

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!entries || !q) return entries ?? [];
    return entries.filter((e) => JSON.stringify([e.term, e.details, e.source_word]).toLowerCase().includes(q));
  }, [entries, filter]);

  async function onRemove(entry: CodexEntry) {
    const problem = await remove(entry.kind, entry.key);
    if (problem) setError(problem);
    else setEntries((prev) => prev?.filter((e) => e.id !== entry.id) ?? null);
  }

  const roots = visible.filter((e) => e.kind === "root");
  const abbreviations = visible.filter((e) => e.kind === "abbreviation");

  return (
    <main className="mx-auto max-w-5xl px-4 pb-10 pt-4 sm:px-6">
      <header className="mb-8">
        <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">My Codex</h1>
        <p className="mt-1 font-serif text-lg italic text-stone-600">
          The roots and abbreviations you&apos;ve learned.
        </p>
      </header>

      {!enabled ? (
        <Notice>Accounts aren&apos;t set up on this copy of Loquitur yet.</Notice>
      ) : loading ? (
        <Notice>Loading…</Notice>
      ) : !user ? (
        <Notice>
          <button onClick={() => setSigningIn(true)} className="font-medium text-terracotta underline">
            Sign in
          </button>{" "}
          to see your Codex.
          {signingIn && <SignInDialog onClose={() => setSigningIn(false)} />}
        </Notice>
      ) : error ? (
        <Notice>{error}</Notice>
      ) : entries === null ? (
        <Notice>Loading your Codex…</Notice>
      ) : entries.length === 0 ? (
        <Notice>
          Nothing saved yet.{" "}
          <Link href="/" className="font-medium text-terracotta underline">
            Decode a document
          </Link>{" "}
          and tap <strong>+ Save</strong> on any root or abbreviation.
        </Notice>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search your Codex"
              className="w-full max-w-xs rounded-full border border-stone bg-white px-4 py-2 text-sm outline-none focus:border-terracotta"
            />
            <span className="text-sm text-stone-500">
              {roots.length} root{roots.length === 1 ? "" : "s"} · {abbreviations.length} abbreviation
              {abbreviations.length === 1 ? "" : "s"}
            </span>
          </div>
          <Section title="Word roots" entries={roots} onRemove={onRemove} />
          <Section title="Abbreviations" entries={abbreviations} onRemove={onRemove} />
        </>
      )}
    </main>
  );
}

function Section({
  title,
  entries,
  onRemove,
}: {
  title: string;
  entries: CodexEntry[];
  onRemove: (entry: CodexEntry) => void;
}) {
  if (entries.length === 0) return null;
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">{title}</h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <li key={entry.id} className="flex flex-col rounded-2xl border border-stone bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="font-serif text-2xl font-semibold">{entry.term}</span>
              <button
                onClick={() => onRemove(entry)}
                className="text-xs text-stone-400 hover:text-red-700"
                aria-label={`Remove ${entry.term}`}
              >
                Remove
              </button>
            </div>
            {entry.kind === "root" ? <RootBody details={entry.details as RootDetails} /> : null}
            {entry.kind === "abbreviation" ? <AbbrevBody details={entry.details as AbbreviationDetails} /> : null}
            <p className="mt-auto pt-3 text-xs text-stone-400">
              {entry.source_word && <>from “{entry.source_word}” · </>}
              review {describeDue(entry.due_at)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RootBody({ details }: { details: RootDetails }) {
  return (
    <>
      <p className="mt-1 text-sm text-stone-600">
        {details.origin} · <strong className="text-ink">{details.meaning}</strong>
      </p>
      {details.hook && <p className="mt-2 text-sm text-stone-600">💡 {details.hook}</p>}
    </>
  );
}

function AbbrevBody({ details }: { details: AbbreviationDetails }) {
  return (
    <>
      <p className="mt-1 font-serif italic text-terracotta">
        {details.expansion}
        {details.literal && <span className="not-italic text-stone-500"> — “{details.literal}”</span>}
      </p>
      <p className="mt-2 text-sm">{details.plain}</p>
    </>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-stone p-6 text-stone-600">{children}</div>;
}
