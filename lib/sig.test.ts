import assert from "node:assert/strict";
import { test } from "node:test";
import { translateSig } from "./sig";

const plain = (line: string) => translateSig(line).plain;

test("translates common label directions", () => {
  assert.equal(plain("Amoxicillin 500 mg cap, 1 cap PO TID x 10 days"), "Amoxicillin 500 mg capsule, 1 capsule by mouth three times a day for 10 days");
  assert.equal(plain("Lisinopril 10 mg 1 tab PO QD"), "Lisinopril 10 mg 1 tablet by mouth once a day");
  assert.equal(plain("Timolol 1 gtt OU BID"), "Timolol 1 drop in both eyes two times a day");
  assert.equal(plain("Tamsulosin 0.4 mg PO QHS"), "Tamsulosin 0.4 mg by mouth every night at bedtime");
});

test("handles counts, x10 and every-N-hours", () => {
  assert.equal(plain("2 tabs po q6h x10 days"), "2 tablets by mouth every 6 hours for 10 days");
  assert.equal(plain("Ibuprofen 400 mg PO q6h PRN pain"), "Ibuprofen 400 mg by mouth every 6 hours only when needed for pain");
});

test("drops Sig and reads barred letters", () => {
  assert.equal(plain("Sig: 1 tab PO c̄ food"), "1 tablet by mouth with food");
});

test("never turns ordinary words into abbreviations", () => {
  assert.equal(plain("TAKE 1 TABLET BY MOUTH AS NEEDED"), "TAKE 1 TABLET BY MOUTH AS NEEDED");
  assert.equal(plain("Vitamin C 500 mg daily"), "Vitamin C 500 mg daily");
  assert.equal(plain("Take as directed at 8 AM"), "Take as directed at 8 AM");
});

test("flags error-prone abbreviations and unknown shorthand", () => {
  const qd = translateSig("1 tab PO QD");
  assert.equal(qd.warnings.length, 1);
  assert.match(qd.warnings[0], /QD is easy to misread/);
  assert.deepEqual(translateSig("1 tab PO ZQX daily").askAbout, ["ZQX"]);
  assert.deepEqual(translateSig("2 gtt AS BID").askAbout, ["AS"]);
});

test("translates conditions after 'for' but leaves other clinical shorthand alone", () => {
  assert.equal(plain("Lisinopril 10 mg daily for HTN"), "Lisinopril 10 mg daily for high blood pressure");
  assert.equal(plain("NKDA. Amoxicillin 1 cap PO TID"), "NKDA. Amoxicillin 1 capsule by mouth three times a day");
  assert.equal(plain("take caps with food"), "take capsules with food");
});

test("reads hour ranges and PRN before a condition", () => {
  assert.equal(plain("Albuterol MDI 2 puffs q4-6h PRN SOB"), "Albuterol MDI 2 puffs every 4 to 6 hours only when needed for trouble breathing");
});
