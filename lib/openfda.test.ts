import assert from "node:assert/strict";
import { test } from "node:test";
import { cleanDrugName, firstSentence, pickGeneric } from "./openfda";

const counts = (...terms: string[]) => terms.map((term, i) => ({ term, count: 100 - i }));

test("picks the salt form of a generic name", () => {
  assert.equal(pickGeneric("METFORMIN", counts("METFORMIN HYDROCHLORIDE", "SITAGLIPTIN AND METFORMIN HYDROCHLORIDE")), "METFORMIN HYDROCHLORIDE");
  assert.equal(pickGeneric("FLUTICASONE", counts("FLUTICASONE PROPIONATE", "FLUTICASONE FUROATE")), "FLUTICASONE PROPIONATE");
});

test("maps a brand to its ingredient, not a brand variant", () => {
  assert.equal(pickGeneric("ADVIL", counts("IBUPROFEN", "IBUPROFEN, ACETAMINOPHEN", "ADVIL PM")), "IBUPROFEN");
});

test("skips combination products", () => {
  assert.equal(pickGeneric("TAMSULOSIN", counts("DUTASTERIDE AND TAMSULOSIN HYDROCHLORIDE", "TAMSULOSIN HYDROCHLORIDE")), "TAMSULOSIN HYDROCHLORIDE");
});

test("cleans label text down to the drug name", () => {
  assert.equal(cleanDrugName("METFORMIN HCL 500 MG TAB"), "metformin");
  assert.equal(cleanDrugName("Dextromethorphan (antitussive)"), "dextromethorphan");
});

test("tidies label sentences", () => {
  assert.equal(firstSentence("Purposes Purposes Pain reliever Pain reliever"), "Pain reliever");
  assert.equal(
    firstSentence("1 INDICATIONS AND USAGE Tamsulosin is indicated for BPH [see Clinical Studies (14)] . More text."),
    "Tamsulosin is indicated for BPH.",
  );
});
