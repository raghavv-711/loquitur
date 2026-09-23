"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { NewCodexEntry } from "@/lib/codex";
import { ABBREVIATIONS, ROOTS } from "@/lib/dictionary";
import { abbrevDisplay, exampleWords, rootDisplay } from "@/lib/display";
import { ABBREV_FREQUENCY, ROOT_FREQUENCY } from "@/lib/prevalence";
import { SaveButton } from "./SaveButton";

type Tab = "roots" | "abbreviations";
type RootFilter = "all" | "latin" | "greek";
type AbbrevFilter = "all" | "latin" | "warnings";
type Sort = "az" | "common";

// Frequency labels by rank among entries (top 15% very common, next 30% common, next 35% less common).
function tiersFor(freq: Record<string, number>, keys: string[]): Record<string, string> {
  const ranked = [...keys].sort((a, b) => (freq[b] ?? 0) - (freq[a] ?? 0));
  const out: Record<string, string> = {};
  ranked.forEach((k, i) => {
    const share = i / Math.max(1, ranked.length - 1);
    out[k] = !freq[k]
      ? "Rare in reports"
      : share < 0.15
        ? "Very common"
        : share < 0.45
          ? "Common"
          : share < 0.8
            ? "Less common"
            : "Rare";
  });
  return out;
}

// Latin phrases like "pro re nata" are translated in `literal`; plain English expansions aren't.
const isLatinAbbrev = (a: { expansion: string; literal: string }) =>
  a.expansion !== a.literal && !a.expansion.includes("(") && !a.expansion.includes("/");

const ROOT_LIST = Object.entries(ROOTS)
  .map(([key, r]) => ({ key, display: rootDisplay(key), ...r }))
  .sort((a, b) => a.key.localeCompare(b.key));

const ABBREV_LIST = Object.entries(ABBREVIATIONS)
  .map(([key, a]) => ({ key, display: abbrevDisplay(key), ...a }))
  .sort((a, b) => a.display.localeCompare(b.display, undefined, { sensitivity: "base" }));

const ROOT_TIER = tiersFor(ROOT_FREQUENCY, Object.keys(ROOTS));
const ABBREV_TIER = tiersFor(ABBREV_FREQUENCY, Object.keys(ABBREVIATIONS));

// Most common first; ties keep A–Z order (Array.sort is stable).
const byFrequency = <T extends { key: string }>(items: T[], freq: Record<string, number>) =>
  [...items].sort((a, b) => (freq[b.key] ?? 0) - (freq[a.key] ?? 0));

// Rank a search hit: the entry itself first, then its meaning, then anything else (like a memory hook).
// Returns -1 for no match.
function rank(q: string, name: string, meaning: string[], other: (string | undefined)[]): number {
  const n = name.toLowerCase().replace(/[-.\s/]/g, "");
  const qq = q.replace(/[-.\s/]/g, "");
  if (n === qq) return 0;
  if (n.startsWith(qq)) return 1;
  if (meaning.some((f) => hasAllWords(f, q))) return 2;
  if (other.some((f) => f && hasAllWords(f, q))) return 3;
  return -1;
}

// "twice a day" matches "twice in a day": every word of the query appears somewhere in the text.
function hasAllWords(text: string, q: string): boolean {
  const t = text.toLowerCase();
  return q.split(/\s+/).every((word) => t.includes(word));
}

// The best (lowest) rank among several, or -1 if none matched.
function best(...ranks: number[]): number {
  const hits = ranks.filter((r) => r >= 0);
  return hits.length ? Math.min(...hits) : -1;
}

function search<T>(items: T[], q: string, score: (item: T) => number): T[] {
  if (!q) return items;
  return items
    .map((item) => [item, score(item)] as const)
    .filter(([, r]) => r >= 0)
    .sort((a, b) => a[1] - b[1]) // stable sort keeps alphabetical order within each rank
    .map(([item]) => item);
}

export function DictionaryBrowser() {
  const params = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(params.get("tab") === "abbreviations" ? "abbreviations" : "roots");
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [rootFilter, setRootFilter] = useState<RootFilter>("all");
  const [abbrevFilter, setAbbrevFilter] = useState<AbbrevFilter>("all");
  const [sort, setSort] = useState<Sort>(params.get("sort") === "common" ? "common" : "az");

  const q = query.trim().toLowerCase().replace(/^-+|-+$/g, "");

  const roots = useMemo(
    () =>
      search(
        (sort === "common" ? byFrequency(ROOT_LIST, ROOT_FREQUENCY) : ROOT_LIST).filter(
          (r) => rootFilter === "all" || r.origin.toLowerCase().startsWith(rootFilter),
        ),
        q,
        (r) => rank(q, r.key, [r.meaning], [r.origin, r.hook]),
      ),
    [q, rootFilter, sort],
  );

  const abbreviations = useMemo(
    () =>
      search(
        (sort === "common" ? byFrequency(ABBREV_LIST, ABBREV_FREQUENCY) : ABBREV_LIST).filter(
          (a) =>
            abbrevFilter === "all" ||
            (abbrevFilter === "latin" && isLatinAbbrev(a)) ||
            (abbrevFilter === "warnings" && a.warning),
        ),
        q,
        // Match either the stored key ("ADLIB") or how it's written ("ad lib").
        (a) => best(rank(q, a.key, [a.plain, a.expansion], [a.literal]), rank(q, a.display, [], [])),
      ),
    [q, abbrevFilter, sort],
  );

  function updateUrl(next: { tab?: Tab; sort?: Sort }) {
    const t = next.tab ?? tab;
    const so = next.sort ?? sort;
    const qs = new URLSearchParams({ tab: t });
    if (so === "common") qs.set("sort", "common");
    if (query) qs.set("q", query);
    router.replace(`/dictionary?${qs}`, { scroll: false });
  }

  function switchTab(next: Tab) {
    setTab(next);
    updateUrl({ tab: next });
  }

  function switchSort(next: Sort) {
    setSort(next);
    updateUrl({ sort: next });
  }

  const count = tab === "roots" ? roots.length : abbreviations.length;

  return (
    <>
      <div className="mb-4 flex gap-2" role="tablist">
        {(["roots", "abbreviations"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => switchTab(t)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${
              tab === t ? "bg-linear-to-r from-accent to-accent-2 text-bg" : "border border-line text-muted hover:text-fg"
            }`}
          >
            {t === "roots" ? "Roots" : "Abbreviations"}{" "}
            <span className="opacity-70">{t === "roots" ? ROOT_LIST.length : ABBREV_LIST.length}</span>
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tab === "roots" ? 'Search roots, e.g. "kidney" or "cardi"' : 'Search, e.g. "PRN" or "bedtime"'}
          className="w-full max-w-sm rounded-full border border-line bg-surface px-4 py-2 text-sm outline-none focus:border-accent"
          aria-label="Search the dictionary"
        />
        <div className="flex flex-wrap gap-2 text-xs">
          {tab === "roots"
            ? (["all", "latin", "greek"] as const).map((f) => (
                <Chip key={f} active={rootFilter === f} onClick={() => setRootFilter(f)}>
                  {f === "all" ? "All" : f === "latin" ? "Latin" : "Greek"}
                </Chip>
              ))
            : (["all", "latin", "warnings"] as const).map((f) => (
                <Chip key={f} active={abbrevFilter === f} onClick={() => setAbbrevFilter(f)}>
                  {f === "all" ? "All" : f === "latin" ? "Latin phrases" : "⚠️ Error-prone"}
                </Chip>
              ))}
        </div>
        <span className="text-sm text-faint">
          {count} {count === 1 ? "entry" : "entries"}
        </span>
        <label className="ml-auto flex items-center gap-2 text-sm text-muted">
          Sort
          <select
            value={sort}
            onChange={(e) => switchSort(e.target.value as Sort)}
            className="rounded-full border border-line bg-surface px-3 py-1.5 text-fg outline-none focus:border-accent"
          >
            <option value="az">A–Z</option>
            <option value="common">Most common</option>
          </select>
        </label>
      </div>

      {sort === "common" && (
        <p className="-mt-3 mb-5 text-xs text-faint">
          Ranked by how often each {tab === "roots" ? "root appears in medical words" : "abbreviation appears"} in
          nearly 5,000 sample medical reports (MTSamples).
          {tab === "abbreviations" && " Pharmacy-label shorthand like Sig and c̄ is rarer in doctors' reports than on pill bottles."}
        </p>
      )}

      {count === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-6 text-muted">
          Nothing matches &ldquo;{query}&rdquo;. Try a meaning in plain English, like &ldquo;heart&rdquo; or
          &ldquo;twice a day&rdquo;.
        </p>
      ) : tab === "roots" ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {roots.map((r) => {
            const entry: NewCodexEntry = {
              kind: "root",
              key: r.key,
              term: r.display,
              details: { origin: r.origin, meaning: r.meaning, hook: r.hook },
              source_word: null,
            };
            const examples = exampleWords(r.key);
            return (
              <li key={r.key} className="flex flex-col rounded-2xl border border-line bg-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-serif text-2xl font-semibold">{r.display}</span>
                  <SaveButton entry={entry} />
                </div>
                {sort === "common" && <TierBadge tier={ROOT_TIER[r.key]} />}
                <p className="mt-1 text-sm text-muted">
                  {r.origin} · <strong className="text-fg">{r.meaning}</strong>
                </p>
                <p className="mt-2 text-sm text-muted">💡 {r.hook}</p>
                {examples.length > 0 && (
                  <p className="mt-auto pt-3 text-xs text-faint">
                    Found in:{" "}
                    {examples.map((w, i) => (
                      <span key={w.word}>
                        {i > 0 && ", "}
                        <span className="text-accent" title={w.meaning}>
                          {w.word}
                        </span>
                      </span>
                    ))}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {abbreviations.map((a) => {
            const entry: NewCodexEntry = {
              kind: "abbreviation",
              key: a.key,
              term: a.display,
              details: { expansion: a.expansion, literal: a.literal, plain: a.plain },
              source_word: null,
            };
            return (
              <li key={a.key} className="flex flex-col rounded-2xl border border-line bg-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-serif text-2xl font-semibold">{a.display}</span>
                  <SaveButton entry={entry} />
                </div>
                {sort === "common" && <TierBadge tier={ABBREV_TIER[a.key]} />}
                <p className="mt-1 font-serif italic text-accent">
                  {a.expansion}
                  {a.literal !== a.expansion && <span className="not-italic text-muted"> — &ldquo;{a.literal}&rdquo;</span>}
                </p>
                <p className="mt-2 text-sm">{a.plain}</p>
                {a.warning && (
                  <p className="mt-3 rounded-lg bg-amber-400/10 p-2 text-xs text-amber-200">⚠️ {a.warning}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const style =
    tier === "Very common"
      ? "bg-accent/15 text-accent"
      : tier === "Common"
        ? "bg-accent-2/15 text-accent-2"
        : "bg-surface-2 text-faint";
  return <span className={`mt-1 inline-block w-fit rounded-full px-2 py-0.5 text-[11px] font-medium ${style}`}>{tier}</span>;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 transition ${
        active ? "border-accent text-accent" : "border-line text-muted hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}
