// Lists dictionary entries still awaiting expert review. Run with: npm run review
import { ABBREVIATIONS, ROOTS } from "../lib/dictionary";
import { DRAFT_ABBREVIATIONS, DRAFT_ROOTS } from "../lib/dictionary-drafts";

const draftAbbrevs = Object.entries(DRAFT_ABBREVIATIONS);
const draftRoots = Object.entries(DRAFT_ROOTS);

console.log(`\nReviewed: ${Object.keys(ABBREVIATIONS).length} abbreviations, ${Object.keys(ROOTS).length} roots`);
console.log(`Drafts:   ${draftAbbrevs.length} abbreviations, ${draftRoots.length} roots\n`);

// A draft that duplicates a reviewed key is never used (reviewed entries win), so flag it.
const shadowed = [
  ...draftAbbrevs.filter(([k]) => k in ABBREVIATIONS).map(([k]) => `abbreviation ${k}`),
  ...draftRoots.filter(([k]) => k in ROOTS).map(([k]) => `root ${k}`),
];
if (shadowed.length) console.log(`⚠️  Already in dictionary.ts, delete from drafts: ${shadowed.join(", ")}\n`);

if (process.argv.includes("--list")) {
  console.log("ABBREVIATIONS");
  for (const [k, e] of draftAbbrevs) console.log(`  ${k.padEnd(7)} ${e.expansion} — "${e.literal}" → ${e.plain}${e.warning ? "  ⚠️" : ""}`);
  console.log("\nROOTS");
  for (const [k, e] of draftRoots) console.log(`  ${(k + "-").padEnd(11)} ${e.origin} · ${e.meaning}  💡 ${e.hook}`);
} else {
  console.log("Run `npm run review -- --list` to print every draft entry.");
}
