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
  // Letter sections only make sense when browsing A–Z; a search or "Most common" is one running list.
  const byLetter = sort === "az" && !q;
  const groups =
    tab === "roots"
      ? group(roots, (r) => r.key, byLetter).map(([letter, items]) => ({
          letter,
          entries: items.map((r) => <RootEntry key={r.key} r={r} tier={sort === "common" ? ROOT_TIER[r.key] : null} />),
        }))
      : group(abbreviations, (a) => a.display, byLetter).map(([letter, items]) => ({
          letter,
          entries: items.map((a) => (
            <AbbrevEntry key={a.key} a={a} tier={sort === "common" ? ABBREV_TIER[a.key] : null} />
          )),
        }));

  return (
    <>
      {/* Two volumes of one dictionary: roots and abbreviations. */}
      <div className="mb-8 flex items-baseline gap-8 border-b border-line" role="tablist">
        {(["roots", "abbreviations"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => switchTab(t)}
            className={`-mb-px border-b pb-2 font-serif text-2xl transition sm:text-3xl ${
              tab === t ? "border-accent text-fg" : "border-transparent text-faint hover:text-muted"
            }`}
          >
            {t === "roots" ? "Roots" : "Abbreviations"}{" "}
            <span className="font-sans text-sm text-faint">{t === "roots" ? ROOT_LIST.length : ABBREV_LIST.length}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tab === "roots" ? "Look up a root, or just type what you mean, like “kidney”" : "Look up PRN, or a meaning like “bedtime”"}
          className="w-full max-w-md border-b border-line-strong bg-transparent pb-2 text-lg outline-none placeholder:italic placeholder:text-faint focus:border-accent"
          aria-label="Search the dictionary"
        />
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 text-[15px]">
          {tab === "roots"
            ? (["all", "latin", "greek"] as const).map((f) => (
                <Filter key={f} active={rootFilter === f} onClick={() => setRootFilter(f)}>
                  {f === "all" ? "All" : f === "latin" ? "Latin" : "Greek"}
                </Filter>
              ))
            : (["all", "latin", "warnings"] as const).map((f) => (
                <Filter key={f} active={abbrevFilter === f} onClick={() => setAbbrevFilter(f)}>
                  {f === "all" ? "All" : f === "latin" ? "Latin phrases" : "Easy to misread"}
                </Filter>
              ))}
        </div>
        <div className="flex items-baseline gap-5 text-[15px] sm:ml-auto">
          <span className="text-faint">Order:</span>
          <Filter active={sort === "az"} onClick={() => switchSort("az")}>
            A–Z
          </Filter>
          <Filter active={sort === "common"} onClick={() => switchSort("common")}>
            Most common
          </Filter>
        </div>
      </div>

      <p className="mt-4 text-sm text-faint">
        {count} {count === 1 ? "entry" : "entries"}
        {sort === "common" &&
          ` · ranked by how often each ${tab === "roots" ? "root appears in medical words" : "abbreviation appears"} in nearly 5,000 sample medical reports (MTSamples).`}
        {sort === "common" &&
          tab === "abbreviations" &&
          " Pharmacy-label shorthand like Sig and c̄ is rarer in doctors' reports than on pill bottles."}
      </p>

      {/* Thumb index, like the notched letter tabs on the edge of a printed dictionary. */}
      {byLetter && (
        <nav aria-label="Jump to letter" className="mt-6 flex flex-wrap gap-x-3 gap-y-1 font-serif text-xl">
          {groups.map(({ letter }) => (
            <a key={letter} href={`#letter-${letter}`} className="text-faint hover:text-accent">
              {letter}
            </a>
          ))}
        </nav>
      )}

      {count === 0 ? (
        <p className="mt-10 -rotate-1 font-hand text-[26px] text-accent">
          I don&apos;t have &ldquo;{query}&rdquo; yet. Try what it means instead, like &ldquo;heart&rdquo; or &ldquo;twice
          a day&rdquo;.
        </p>
      ) : (
        <div className="mt-6">
          {groups.map(({ letter, entries }) => (
            <section key={letter || "all"} id={letter ? `letter-${letter}` : undefined} className="scroll-mt-6 pt-6">
              {letter && (
                <h2 className="mb-4 flex items-baseline gap-4 border-b border-line pb-1 font-serif text-5xl text-accent">
                  {letter}
                  <span className="font-sans text-sm text-faint">{entries.length}</span>
                </h2>
              )}
              <dl className="gap-x-14 [column-rule:1px_solid_var(--color-line)] md:columns-2">{entries}</dl>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

// Split a list into letter sections (A, B, …), keeping its order. With `byLetter` off it stays one section.
function group<T>(items: T[], name: (item: T) => string, byLetter: boolean): [string, T[]][] {
  if (!byLetter) return [["", items]];
  const out = new Map<string, T[]>();
  for (const item of items) {
    const letter = (name(item).normalize("NFD").match(/[a-z0-9]/i)?.[0] ?? "#").toUpperCase();
    out.set(letter, [...(out.get(letter) ?? []), item]);
  }
  return [...out];
}

// One entry set like a printed dictionary: headword, origin in brackets, then the meaning.
function RootEntry({ r, tier }: { r: (typeof ROOT_LIST)[number]; tier: string | null }) {
  const entry: NewCodexEntry = {
    kind: "root",
    key: r.key,
    term: r.display,
    details: { origin: r.origin, meaning: r.meaning, hook: r.hook },
    source_word: null,
  };
  const examples = exampleWords(r.key);
  return (
    <div className="mb-6 break-inside-avoid">
      <dt className="flex items-baseline justify-between gap-3">
        <span className="font-serif text-[26px] font-semibold leading-tight">{r.display}</span>
        <SaveButton entry={entry} quiet />
      </dt>
      <dd className="mt-1 text-[17px] leading-relaxed">
        <span className="text-faint">[{r.origin}]</span> <strong className="font-semibold">{r.meaning}</strong>.
        {tier && <em className="ml-2 text-sm text-accent">{tier.toLowerCase()}</em>}
        {r.hook && <span className="block text-[15px] text-muted">{r.hook}</span>}
        {examples.length > 0 && (
          <span className="mt-1 block text-[15px] italic text-muted">
            {examples.map((w, i) => (
              <span key={w.word}>
                {i > 0 && ", "}
                <span title={w.meaning}>{w.word}</span>
              </span>
            ))}
          </span>
        )}
      </dd>
    </div>
  );
}

function AbbrevEntry({ a, tier }: { a: (typeof ABBREV_LIST)[number]; tier: string | null }) {
  const entry: NewCodexEntry = {
    kind: "abbreviation",
    key: a.key,
    term: a.display,
    details: { expansion: a.expansion, literal: a.literal, plain: a.plain },
    source_word: null,
  };
  return (
    <div className="mb-6 break-inside-avoid">
      <dt className="flex items-baseline justify-between gap-3">
        <span className="font-serif text-[26px] font-semibold leading-tight">{a.display}</span>
        <SaveButton entry={entry} quiet />
      </dt>
      <dd className="mt-1 text-[17px] leading-relaxed">
        <em className="text-accent">{a.expansion}</em>
        {a.literal !== a.expansion && <span className="text-faint"> [&ldquo;{a.literal}&rdquo;]</span>}{" "}
        {a.plain}
        {tier && <em className="ml-2 text-sm text-accent">{tier.toLowerCase()}</em>}
        {a.warning && <span className="mt-1 block text-[15px] text-[#e39b7b]">{a.warning}</span>}
      </dd>
    </div>
  );
}

// A filter written as a word you can click; the chosen one is underlined in gold.
function Filter({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`border-b pb-0.5 transition ${
        active ? "border-accent text-accent" : "border-transparent text-muted hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}
