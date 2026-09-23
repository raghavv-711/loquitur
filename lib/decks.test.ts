import assert from "node:assert/strict";
import { test } from "node:test";
import { DECKS, deckEntries } from "./decks";
import { ABBREVIATIONS, ROOTS } from "./dictionary";
import { buildQuestion } from "./quiz";

test("every deck entry exists in the dictionary", () => {
  for (const d of DECKS) {
    for (const r of d.roots) assert.ok(r in ROOTS, `${d.id}: root "${r}" is missing from ROOTS`);
    for (const a of d.abbreviations) assert.ok(a in ABBREVIATIONS, `${d.id}: abbreviation "${a}" is missing`);
  }
});

test("decks have unique ids and no duplicate entries", () => {
  assert.equal(new Set(DECKS.map((d) => d.id)).size, DECKS.length);
  for (const d of DECKS) {
    assert.equal(new Set(d.roots).size, d.roots.length, `${d.id} repeats a root`);
    assert.equal(new Set(d.abbreviations).size, d.abbreviations.length, `${d.id} repeats an abbreviation`);
  }
});

test("every deck entry makes a valid question", () => {
  for (const d of DECKS) {
    const entries = deckEntries(d);
    const known = new Set(d.roots);
    for (const e of entries) {
      const q = buildQuestion(e, known);
      assert.equal(q.options.length, 4, `${d.id}/${e.term}: expected 4 options`);
      assert.ok(q.options[q.answer], `${d.id}/${e.term}: answer missing`);
    }
  }
});
