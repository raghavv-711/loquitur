import assert from "node:assert/strict";
import { test } from "node:test";
import { CASES } from "./cases";

test("answer key: every expected abbreviation, term and drug appears in its document", () => {
  for (const c of CASES) {
    const text = c.text.toLowerCase();
    for (const a of Object.keys(c.abbreviations)) assert.ok(text.includes(a.toLowerCase()), `${c.id}: "${a}" not in text`);
    for (const t of Object.keys(c.terms)) assert.ok(text.includes(t.toLowerCase()), `${c.id}: "${t}" not in text`);
    for (const d of c.drugs) assert.ok(text.includes(d), `${c.id}: drug "${d}" not in text`);
  }
});

test("answer key: 30 documents with unique ids", () => {
  assert.equal(CASES.length, 30);
  assert.equal(new Set(CASES.map((c) => c.id)).size, 30);
});
