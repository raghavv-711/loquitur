import assert from "node:assert/strict";
import { test } from "node:test";
import { ABBREVIATIONS, lookupAbbreviation, normalizeAbbrev, ROOTS } from "./dictionary";
import { abbrevDisplay, rootDisplay } from "./display";

test("every abbreviation's display spelling maps back to its dictionary entry", () => {
  for (const key of Object.keys(ABBREVIATIONS)) {
    assert.equal(normalizeAbbrev(abbrevDisplay(key)), key, `"${abbrevDisplay(key)}" should normalize to ${key}`);
  }
});

test("barred letters on labels are recognized", () => {
  assert.equal(lookupAbbreviation("c̄")?.expansion, "cum");
  assert.equal(lookupAbbreviation("s̄")?.expansion, "sine");
  assert.equal(lookupAbbreviation("āā")?.expansion, "ana (Greek)");
});

test("every root is shown with a hyphen marking where it attaches", () => {
  for (const key of Object.keys(ROOTS)) {
    const d = rootDisplay(key);
    assert.ok(d.startsWith("-") || d.endsWith("-"), `${key} displays as "${d}"`);
    assert.equal(d.replace(/-/g, ""), key);
  }
  assert.equal(rootDisplay("nephr"), "nephr-");
  assert.equal(rootDisplay("itis"), "-itis");
});
