import assert from "node:assert/strict";
import { test } from "node:test";
import { ABBREVIATIONS, ROOTS } from "./dictionary";
import { ABBREV_FREQUENCY, ROOT_FREQUENCY } from "./prevalence";

test("every dictionary entry has a frequency (re-run scripts/prevalence.py after adding entries)", () => {
  for (const k of Object.keys(ROOTS)) assert.ok(k in ROOT_FREQUENCY, `root "${k}" missing from lib/prevalence.ts`);
  for (const k of Object.keys(ABBREVIATIONS)) assert.ok(k in ABBREV_FREQUENCY, `abbreviation "${k}" missing`);
});

test("common building blocks outrank rare ones", () => {
  const more = (a: string, b: string) => assert.ok(ROOT_FREQUENCY[a] > ROOT_FREQUENCY[b], `${a} should be more common than ${b}`);
  more("ad", "algesi");
  more("itis", "dynia");
  more("cardi", "dactyl");
  more("hyper", "hypn");
  assert.ok(ABBREV_FREQUENCY.PO > ABBREV_FREQUENCY.QOD, "PO should be more common than QOD");
});
