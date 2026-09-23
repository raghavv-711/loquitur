// Loquitur accuracy eval. Runs every test document through the real pipeline and scores
// Claude's raw answer and the verified answer against the expert answer key.
//
//   npm run eval              all 30 documents
//   npm run eval -- --limit 3 just the first 3 (a cheap smoke test)
//
// Costs real API money (roughly $0.05–0.10 per document) and writes eval/results/.
import { mkdirSync, writeFileSync } from "node:fs";
import { askClaude, checkDrugs, MODEL, verify } from "../lib/decode";
import { normalizeAbbrev, normalizeRoot } from "../lib/dictionary";
import { cleanDrugName } from "../lib/openfda";
import type { Term, VerifiedTerm } from "../lib/schema";
import { CASES, type Case } from "./cases";

// Claude Opus 5 list prices, $ per million tokens.
const PRICE = { input: 5, output: 25 };
const CONCURRENCY = 3;

type Check = { name: string; found: boolean; raw?: boolean; verified?: boolean; got?: string; want?: string };
type CaseResult = {
  id: string;
  seconds: number;
  cost: number;
  abbreviations: Check[];
  terms: Check[];
  drugs: Check[];
  totalTerms: number;
  verifiedTerms: number;
  extraTerms: string[];
  error?: string;
};

// Loose text match: lowercase, drop parentheticals and punctuation.
const clean = (s: string) =>
  s.toLowerCase().replace(/\(.*?\)/g, " ").replace(/[^a-z0-9]+/g, " ").trim();
const expansionOk = (got: string | null | undefined, accepted: string[]) =>
  !!got && accepted.some((a) => ` ${clean(got)} `.includes(` ${clean(a)} `));

// Roots compared without hyphens and connecting vowels: "nephro-" = "nephr".
const rootPart = (r: string) => normalizeRoot(r).replace(/o$/, "");
// For a single word the parts must match exactly. When Claude highlighted a longer phrase
// ("Otitis media"), the word's parts just need to all be among the phrase's parts.
function rootsMatch(got: { root: string }[], want: string[] | string[][], isPhrase: boolean) {
  const options = Array.isArray(want[0]) ? (want as string[][]) : [want as string[]];
  const gotParts = got.map((r) => rootPart(r.root));
  return options.some((option) => {
    const wantParts = option.map(rootPart);
    if (isPhrase) return wantParts.every((p) => gotParts.includes(p));
    return [...gotParts].sort().join("|") === [...wantParts].sort().join("|");
  });
}
const showRoots = (want: string[] | string[][]) =>
  (Array.isArray(want[0]) ? (want as string[][]) : [want as string[]]).map((o) => o.join(" + ")).join(" or ");

function findAbbrev(terms: Term[], abbrev: string): number {
  const key = normalizeAbbrev(abbrev);
  return terms.findIndex((t) => normalizeAbbrev(t.text) === key || t.text.split(/\s+/).some((w) => normalizeAbbrev(w) === key));
}
const findTerm = (terms: Term[], word: string) =>
  terms.findIndex((t) => t.text.toLowerCase() === word.toLowerCase() || t.text.toLowerCase().includes(word.toLowerCase()));
const findDrug = (terms: VerifiedTerm[], drug: string) =>
  terms.findIndex((t) => t.kind === "drug" && (cleanDrugName(t.text).includes(drug) || drug.includes(cleanDrugName(t.text))));

async function runCase(c: Case): Promise<CaseResult> {
  const started = Date.now();
  try {
    const raw = await askClaude({ kind: "text", text: c.text });
    const final = await checkDrugs(verify(raw.decoded));
    const rawTerms = raw.decoded.terms;
    const cost = (raw.usage.input_tokens * PRICE.input + raw.usage.output_tokens * PRICE.output) / 1e6;

    const abbreviations = Object.entries(c.abbreviations).map(([abbrev, accepted]): Check => {
      const i = findAbbrev(rawTerms, abbrev);
      if (i < 0) return { name: abbrev, found: false, want: accepted[0] };
      return {
        name: abbrev,
        found: true,
        raw: expansionOk(rawTerms[i].expansion, accepted),
        verified: expansionOk(final.terms[i].expansion, accepted),
        got: `${rawTerms[i].expansion ?? "∅"} → ${final.terms[i].expansion ?? "∅"}`,
        want: accepted[0],
      };
    });

    const terms = Object.entries(c.terms).map(([word, roots]): Check => {
      const i = findTerm(rawTerms, word);
      if (i < 0) return { name: word, found: false, want: showRoots(roots) };
      const isPhrase = rawTerms[i].text.trim().toLowerCase() !== word.toLowerCase();
      return {
        name: word,
        found: true,
        raw: rootsMatch(rawTerms[i].roots, roots, isPhrase),
        got: `${rawTerms[i].roots.map((r) => r.root).join(" + ")}${isPhrase ? ` (in "${rawTerms[i].text}")` : ""}`,
        want: showRoots(roots),
      };
    });

    const drugs = c.drugs.map((drug): Check => {
      const i = findDrug(final.terms, drug);
      if (i < 0) return { name: drug, found: false };
      return { name: drug, found: true, verified: !!final.terms[i].fda, got: final.terms[i].fda?.genericName };
    });

    const expected = new Set([
      ...Object.keys(c.abbreviations).map(normalizeAbbrev),
      ...Object.keys(c.terms).map((t) => t.toLowerCase()),
    ]);
    const extraTerms = rawTerms
      .filter((t) => t.kind !== "drug" && !expected.has(normalizeAbbrev(t.text)) && !expected.has(t.text.toLowerCase()))
      .map((t) => t.text);

    return {
      id: c.id,
      seconds: (Date.now() - started) / 1000,
      cost,
      abbreviations,
      terms,
      drugs,
      totalTerms: final.terms.length,
      verifiedTerms: final.terms.filter((t) => t.status === "verified").length,
      extraTerms,
    };
  } catch (err) {
    return {
      id: c.id,
      seconds: (Date.now() - started) / 1000,
      cost: 0,
      abbreviations: [],
      terms: [],
      drugs: [],
      totalTerms: 0,
      verifiedTerms: 0,
      extraTerms: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function pool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i]);
        process.stdout.write(".");
      }
    }),
  );
  return results;
}

const pct = (n: number, d: number) => (d === 0 ? "n/a" : `${Math.round((n / d) * 100)}%`);

async function main() {
  const limitArg = process.argv.indexOf("--limit");
  const cases = limitArg > 0 ? CASES.slice(0, Number(process.argv[limitArg + 1])) : CASES;
  console.log(`Running ${cases.length} documents on ${MODEL}…`);

  const results = await pool(cases, CONCURRENCY, runCase);
  console.log("\n");

  const all = <K extends "abbreviations" | "terms" | "drugs">(k: K) => results.flatMap((r) => r[k]);
  const abbrevs = all("abbreviations");
  const terms = all("terms");
  const drugs = all("drugs");
  const count = (xs: Check[], f: (c: Check) => boolean | undefined) => xs.filter((c) => f(c)).length;
  const ok = results.filter((r) => !r.error);
  const totalCost = results.reduce((s, r) => s + r.cost, 0);
  const avgSeconds = ok.reduce((s, r) => s + r.seconds, 0) / Math.max(1, ok.length);

  const rows: [string, string, string][] = [
    ["Jargon found (abbreviations + medical terms)", pct(count([...abbrevs, ...terms], (c) => c.found), abbrevs.length + terms.length), `${count([...abbrevs, ...terms], (c) => c.found)}/${abbrevs.length + terms.length}`],
    ["Abbreviation expansion correct: AI alone", pct(count(abbrevs, (c) => c.raw), abbrevs.length), `${count(abbrevs, (c) => c.raw)}/${abbrevs.length}`],
    ["Abbreviation expansion correct: AI + dictionary", pct(count(abbrevs, (c) => c.verified), abbrevs.length), `${count(abbrevs, (c) => c.verified)}/${abbrevs.length}`],
    ["Root breakdown matches expert key", pct(count(terms, (c) => c.raw), terms.length), `${count(terms, (c) => c.raw)}/${terms.length}`],
    ["Drug names confirmed by FDA", pct(count(drugs, (c) => c.verified), drugs.length), `${count(drugs, (c) => c.verified)}/${drugs.length}`],
    ["All highlighted terms marked ✓ Verified", pct(ok.reduce((s, r) => s + r.verifiedTerms, 0), ok.reduce((s, r) => s + r.totalTerms, 0)), ""],
  ];

  const table = [
    "| Metric | Score | Count |",
    "|---|---|---|",
    ...rows.map(([m, s, c]) => `| ${m} | **${s}** | ${c} |`),
  ].join("\n");

  const misses = results
    .flatMap((r) => [
      ...(r.error ? [`- **${r.id}**: error: ${r.error}`] : []),
      ...r.abbreviations.filter((c) => !c.found).map((c) => `- **${r.id}** missed abbreviation \`${c.name}\``),
      ...r.abbreviations
        .filter((c) => c.found && !c.verified)
        .map((c) => `- **${r.id}** \`${c.name}\`: got "${c.got}", expected "${c.want}"`),
      ...r.terms.filter((c) => !c.found).map((c) => `- **${r.id}** missed term \`${c.name}\``),
      ...r.terms.filter((c) => c.found && !c.raw).map((c) => `- **${r.id}** \`${c.name}\` roots: got ${c.got}, expected ${c.want}`),
      ...r.drugs.filter((c) => !c.found).map((c) => `- **${r.id}** drug \`${c.name}\` not flagged as a drug`),
      ...r.drugs.filter((c) => c.found && !c.verified).map((c) => `- **${r.id}** drug \`${c.name}\` not found in openFDA`),
    ])
    .join("\n");

  const date = new Date().toISOString().slice(0, 10);
  const report = `# Loquitur accuracy report

${date} · ${MODEL} · ${cases.length} made-up documents (${cases.filter((c) => c.kind === "rx").length} prescription labels, ${cases.filter((c) => c.kind === "avs").length} after-visit summaries) · answer key in \`eval/cases.ts\`

${table}

- Average time per document: ${avgSeconds.toFixed(1)} s
- Total cost: $${totalCost.toFixed(2)} ($${(totalCost / Math.max(1, ok.length)).toFixed(3)} per document)
- Extra terms flagged beyond the answer key: ${ok.reduce((s, r) => s + r.extraTerms.length, 0)} (not scored; often reasonable, like "mg" or "Refills")

## Misses

${misses || "None."}
`;

  mkdirSync("eval/results", { recursive: true });
  writeFileSync("eval/results/REPORT.md", report);
  writeFileSync(`eval/results/${date}.json`, JSON.stringify(results, null, 2));
  console.log(report);
  console.log(`Saved eval/results/REPORT.md and eval/results/${date}.json`);
}

main();
