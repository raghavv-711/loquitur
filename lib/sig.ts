// Turns prescription directions ("1 tab PO TID x 10 days") into plain English, using only Loquitur's
// checked dictionary. Runs in the browser: nothing is sent anywhere. Anything it isn't sure of stays as
// written, and abbreviations it can't explain are listed so the reader knows to ask.
import { lookupAbbreviation, normalizeAbbrev } from "./dictionary";
import { abbrevDisplay } from "./display";

export type SigResult = {
  plain: string;
  warnings: string[]; // error-prone abbreviations that were translated: confirm with a pharmacist
  askAbout: string[]; // things that look like abbreviations but were left as written
};

// Abbreviations that are also everyday words or letters ("take AS needed", "vitamin C"). Never translated.
const AMBIGUOUS = new Set(["AS", "AD", "A", "S", "C", "P", "U", "L", "W", "G", "ET", "PER", "TOP", "ID", "SOL", "PE", "MS", "DM", "NS", "CC", "DC", "PR", "SS", "AM", "PM", "X"]);

// Left as written because people already know them from the bottle: units, product suffixes, drug shorthand.
const KEEP = new Set(["MG", "MCG", "KG", "ML", "MEQ", "IU", "TSP", "TBSP", "OZ", "HCL", "XL", "XR", "SR", "CR", "ER", "EC", "ODT", "RX", "APAP", "ASA", "HCTZ", "MSO4", "MGSO4", "NSAID", "SSRI"]);

// What gets translated: the words of directions (how, when, how often, where, what form)...
const DIRECTIONS = new Set([
  "PO", "BID", "TID", "QID", "QD", "QOD", "PRN", "HS", "QHS", "AC", "PC", "STAT", "NPO", "SL", "OD", "OS", "OU",
  "AU", "GTT", "GTTS", "SIG", "ADLIB", "UTDICT", "UD", "CAP", "CAPS", "TAB", "TABS", "IM", "IV", "SC", "SQ", "Q",
  "QH", "QAM", "QPM", "MANE", "NOCT", "TIW", "NR", "WO", "PV", "INJ", "INH", "SUPP", "UNG", "AQ",
]);
// ...and conditions that read naturally after "for" ("for HTN" → "for high blood pressure").
// Other clinical shorthand (NKDA, Dx, CBC…) stays as written: its explanation doesn't fit inside a sentence.
const CONDITIONS = new Set(["HTN", "UTI", "URI", "GERD", "COPD", "MI", "CVA", "DVT", "SOB", "CP", "NV", "BP", "CHF", "CKD"]);
const translatable = (key: string) => DIRECTIONS.has(key) || CONDITIONS.has(key) || /^Q\d+H$/.test(key);

// Countable forms: "1 tab" is one tablet, "2 tabs" are two.
const COUNTABLE: Record<string, [string, string]> = {
  TAB: ["tablet", "tablets"],
  TABS: ["tablet", "tablets"],
  CAP: ["capsule", "capsules"],
  CAPS: ["capsule", "capsules"],
  GTT: ["drop", "drops"],
  GTTS: ["drop", "drops"],
};

// Card-length wording where the dictionary's explanation is written for a reader, not a label.
const SHORT: Record<string, string> = {
  SL: "under the tongue",
  SIG: "",
  UD: "as directed",
};

// Two-word abbreviations written with a space: "ad lib", "ut dict".
const PAIRS = new Set(["ADLIB", "UTDICT"]);

const isNumber = (t: string) => /^\d+(\.\d+)?$/.test(t);
const isBarred = (t: string) => /[̄̅]/.test(t.normalize("NFD")); // c̄, s̄, p̄

function split(token: string) {
  const m = token.match(/^([("']*)(.*?)([),;:!?"']*)$/)!;
  return { lead: m[1], core: m[2], trail: m[3] };
}

export function translateSig(line: string): SigResult {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  const hasLower = /[a-z]/.test(line);
  const out: string[] = [];
  const warnings: string[] = [];
  const askAbout: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const { lead, core, trail } = split(tokens[i]);
    const key = normalizeAbbrev(core);
    const keep = () => out.push(tokens[i]);

    if (!key || isNumber(core)) {
      keep();
      continue;
    }

    // "x 10 days" / "x10 days" → "for 10 days"
    if (key === "X" && i + 1 < tokens.length && isNumber(split(tokens[i + 1]).core)) {
      out.push(lead + "for" + trail);
      continue;
    }
    const xN = core.match(/^[xX](\d+)$/);
    if (xN) {
      out.push(`${lead}for ${xN[1]}${trail}`);
      continue;
    }

    // "q4-6h" → "every 4 to 6 hours"
    const range = core.match(/^q(\d+)-(\d+)h$/i);
    if (range) {
      out.push(`${lead}every ${range[1]} to ${range[2]} hours${trail}`);
      continue;
    }

    // Two-word forms, checked before single words.
    if (i + 1 < tokens.length) {
      const pair = key + normalizeAbbrev(split(tokens[i + 1]).core);
      if (PAIRS.has(pair)) {
        const entry = lookupAbbreviation(pair)!;
        out.push(lead + entry.plain + split(tokens[i + 1]).trail);
        i++;
        continue;
      }
    }

    // Barred letters (c̄ with, s̄ without, p̄ after) are unambiguous even though plain "c" isn't.
    if (isBarred(core)) {
      const entry = lookupAbbreviation(core);
      const barred: Record<string, string> = { C: "with", S: "without", P: "after", A: "before" };
      if (entry && barred[key]) {
        out.push(lead + barred[key] + trail);
        continue;
      }
    }

    const isUpperInMixed = hasLower && core === core.toUpperCase() && /[A-Z]{2,}/.test(core);

    if (AMBIGUOUS.has(key) || KEEP.has(key)) {
      if (AMBIGUOUS.has(key) && isUpperInMixed) askAbout.push(core);
      keep();
      continue;
    }

    const entry = lookupAbbreviation(core);
    if (entry && !translatable(key)) {
      keep();
      continue;
    }
    if (!entry) {
      // Looks like shorthand (all caps in a mixed-case line, or dotted like "q.o.d.") but isn't in the dictionary.
      if ((isUpperInMixed || /[a-z]\.[a-z]/i.test(core)) && /^[A-Za-z.]{2,7}$/.test(core)) askAbout.push(core);
      keep();
      continue;
    }

    if (COUNTABLE[key]) {
      const prev = out.length ? split(out[out.length - 1]).core : "";
      const [one, many] = COUNTABLE[key];
      // "1 tab" → tablet, "2 tabs" → tablets; with no number, follow the label's own spelling ("caps" → capsules).
      out.push(lead + (prev === "1" ? one : isNumber(prev) || key.endsWith("S") ? many : one) + trail);
      continue;
    }

    let plain = key in SHORT ? SHORT[key] : entry.plain;
    // "PRN pain" → "only when needed for pain"
    if (key === "PRN" && i + 1 < tokens.length) {
      const next = split(tokens[i + 1]).core;
      const isCondition = CONDITIONS.has(normalizeAbbrev(next));
      if (/^[a-z]+$/i.test(next) && next.toLowerCase() !== "for" && (isCondition || !lookupAbbreviation(next))) plain += " for";
    }
    if (entry.warning) {
      warnings.push(`${abbrevDisplay(key)} is easy to misread. Check with your pharmacist that it means "${plain}".`);
    }
    if (plain) out.push(lead + plain + trail); // an empty one ("Sig:") disappears entirely
  }

  const plain = out
    .join(" ")
    .replace(/\s+([,;:)])/g, "$1")
    .replace(/^[,;:]\s*/, "")
    .trim();
  return { plain, warnings: [...new Set(warnings)], askAbout: [...new Set(askAbout)] };
}
