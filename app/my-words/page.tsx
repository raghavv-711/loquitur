"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SignInDialog } from "@/components/AuthBar";
import { useCodex } from "@/components/CodexProvider";
import type { AbbreviationDetails, CodexEntry, RootDetails } from "@/lib/codex";
import { describeDue } from "@/lib/review";
import { createClient } from "@/lib/supabase/client";

export default function MyWordsPage() {
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
        if (error) setError("Your words didn't load. Refresh the page to try again.");
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
    <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-8 sm:pt-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-5xl font-medium sm:text-6xl">My Words</h1>
          <p className="mt-1 font-serif text-lg italic text-muted">Every word you&apos;ve saved, in one place.</p>
        </div>
        {user && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-faint">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button className="rounded-sm border border-line px-3 py-1 text-muted hover:border-accent hover:text-fg">
                Sign out
              </button>
            </form>
          </div>
        )}
      </header>

      {!enabled ? (
        <Notice>Accounts aren&apos;t set up on this copy of Loquitur yet.</Notice>
      ) : loading ? (
        <Notice>Loading…</Notice>
      ) : !user ? (
        <Notice>
          <button onClick={() => setSigningIn(true)} className="font-medium text-accent underline">
            Sign in
          </button>{" "}
          to see your saved words.
          {signingIn && <SignInDialog onClose={() => setSigningIn(false)} />}
        </Notice>
      ) : error ? (
        <Notice>{error}</Notice>
      ) : entries === null ? (
        <Notice>Loading your words…</Notice>
      ) : entries.length === 0 ? (
        <Notice>
          Nothing saved yet.{" "}
          <Link href="/" className="font-medium text-accent underline">
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
              placeholder="Search your words"
              className="w-full max-w-xs rounded-sm border border-line bg-surface px-4 py-2 text-sm outline-none focus:border-accent"
            />
            <span className="text-sm text-muted">
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
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">{title}</h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <li key={entry.id} className="flex flex-col rounded-md border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="font-serif text-2xl font-semibold">{entry.term}</span>
              <button
                onClick={() => onRemove(entry)}
                className="text-xs text-faint hover:text-red-300"
                aria-label={`Remove ${entry.term}`}
              >
                Remove
              </button>
            </div>
            {entry.kind === "root" ? <RootBody details={entry.details as RootDetails} /> : null}
            {entry.kind === "abbreviation" ? <AbbrevBody details={entry.details as AbbreviationDetails} /> : null}
            <p className="mt-auto pt-3 text-xs text-faint">
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
      <p className="mt-1 text-sm text-muted">
        {details.origin} · <strong className="text-fg">{details.meaning}</strong>
      </p>
      {details.hook && <p className="mt-2 text-sm text-muted">{details.hook}</p>}
    </>
  );
}

function AbbrevBody({ details }: { details: AbbreviationDetails }) {
  return (
    <>
      <p className="mt-1 font-serif italic text-accent">
        {details.expansion}
        {details.literal && <span className="not-italic text-muted"> — “{details.literal}”</span>}
      </p>
      <p className="mt-2 text-sm">{details.plain}</p>
    </>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return <div className="rounded-md border border-dashed border-line p-6 text-muted">{children}</div>;
}
