import assert from "node:assert/strict";
import { test } from "node:test";
import type { CodexEntry } from "./codex";
import { ABBREVIATIONS, ROOTS } from "./dictionary";
import { buildQuestion } from "./quiz";
import { WORDS } from "./words";

// Small deterministic random generator so tests are repeatable.
function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

const base = { id: "x", source_word: null, created_at: "", due_at: "", interval_days: 0, ease: 2.5, reps: 0 };
const root = (key: string): CodexEntry => ({
  ...base,
  kind: "root",
  key,
  term: `${key}-`,
  details: { origin: ROOTS[key].origin, meaning: ROOTS[key].meaning, hook: ROOTS[key].hook },
});
const abbrev = (key: string): CodexEntry => ({
  ...base,
  kind: "abbreviation",
  key,
  term: key,
  details: { expansion: ABBREVIATIONS[key].expansion, literal: ABBREVIATIONS[key].literal, plain: ABBREVIATIONS[key].plain },
});

test("every word in the word list uses roots that exist in the dictionary", () => {
  for (const w of WORDS) for (const r of w.roots) assert.ok(r in ROOTS, `${w.word}: root "${r}" is missing from ROOTS`);
});

test("word list has no duplicate words", () => {
  assert.equal(new Set(WORDS.map((w) => w.word)).size, WORDS.length);
});

test("every question has 4 distinct options and the answer points at the right one", () => {
  const entries = [...Object.keys(ROOTS).map(root), ...Object.keys(ABBREVIATIONS).map(abbrev)];
  for (let seed = 1; seed <= 3; seed++) {
    const rng = seeded(seed);
    for (const entry of entries) {
      const q = buildQuestion(entry, new Set([entry.key]), rng);
      assert.equal(q.options.length, 4, `${entry.term}: expected 4 options`);
      assert.equal(new Set(q.options.map((o) => o.toLowerCase())).size, 4, `${entry.term}: duplicate options`);
      assert.ok(q.answer >= 0 && q.answer < 4, `${entry.term}: answer index out of range`);
    }
  }
});

test("root questions have the root's meaning as the correct answer", () => {
  const q = buildQuestion(root("oste"), new Set(), () => 0.9); // 0.9 → meaning question, not decode
  assert.equal(q.type, "root-meaning");
  assert.equal(q.options[q.answer], "bone");
});

test("near-duplicate meanings are never offered as wrong answers", () => {
  for (let seed = 1; seed <= 50; seed++) {
    const q = buildQuestion(root("nephr"), new Set(), (() => { const r = seeded(seed); r(); return () => 0.9; })());
    assert.ok(!q.options.includes("kidneys"), `"kidneys" offered as a wrong answer for nephr- (kidney)`);
  }
});

test("decode questions ask about a real word containing the saved root", () => {
  const q = buildQuestion(root("nephr"), new Set(["nephr"]), () => 0.1); // 0.1 → decode question
  assert.equal(q.type, "decode");
  const word = WORDS.find((w) => w.word === q.subject);
  assert.ok(word?.roots.includes("nephr"));
  assert.equal(q.options[q.answer], word!.meaning);
  assert.match(q.prompt, /nephr-/);
});

test("abbreviation questions test either the Latin or the plain meaning", () => {
  const latin = buildQuestion(abbrev("PRN"), new Set(), () => 0.1);
  assert.equal(latin.options[latin.answer], "pro re nata");
  const plain = buildQuestion(abbrev("PRN"), new Set(), () => 0.9);
  assert.equal(plain.options[plain.answer], "only when needed");
});

test("Latin abbreviations only get Latin wrong answers", () => {
  const latinExpansions = new Set(
    Object.values(ABBREVIATIONS)
      .filter((a) => a.expansion !== a.literal && !a.expansion.includes("(") && !a.expansion.includes("/"))
      .map((a) => a.expansion),
  );
  for (let seed = 1; seed <= 20; seed++) {
    const q = buildQuestion(abbrev("PRN"), new Set(), (() => { const r = seeded(seed); let first = true; return () => (first ? ((first = false), 0.1) : r()); })());
    assert.equal(q.type, "abbrev-latin");
    for (const o of q.options) assert.ok(latinExpansions.has(o), `"${o}" is not a Latin expansion`);
  }
});

test("decode questions avoid the word the root was saved from when possible", () => {
  const entry = { ...root("nephr"), source_word: "nephrolithiasis" };
  for (let seed = 1; seed <= 20; seed++) {
    const q = buildQuestion(entry, new Set(), (() => { const r = seeded(seed); let first = true; return () => (first ? ((first = false), 0.1) : r()); })());
    assert.notEqual(q.subject, "nephrolithiasis");
  }
});
