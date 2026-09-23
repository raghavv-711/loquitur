// How dictionary keys are shown to people. Keys are normalized for matching
// ("ADLIB", "nephr"); these functions give the spelling a label or textbook uses.
import { WORDS } from "./words";

const ABBREV_SPELLING: Record<string, string> = {
  ADLIB: "ad lib",
  UTDICT: "ut dict.",
  UD: "UD",
  DC: "D/C",
  SP: "S/P",
  RO: "R/O",
  FU: "F/U",
  NV: "N/V",
  W: "w/",
  WO: "w/o",
  C: "c̄",
  S: "s̄",
  P: "p̄",
  A: "ā",
  SS: "ss",
  Q: "q",
  QH: "qh",
  QAM: "qAM",
  QPM: "qPM",
  RX: "Rx",
  SIG: "Sig",
  DISP: "Disp",
  QTY: "Qty",
  HX: "Hx",
  DX: "Dx",
  TX: "Tx",
  SX: "Sx",
  FX: "Fx",
  BX: "Bx",
  A1C: "A1c",
  HCL: "HCl",
  MSO4: "MSO4",
  MGSO4: "MgSO4",
  MG: "mg",
  MCG: "mcg",
  ML: "mL",
  KG: "kg",
  G: "g",
  MEQ: "mEq",
  CC: "cc",
  TSP: "tsp",
  TBSP: "tbsp",
  OZ: "oz",
  GTT: "gtt",
  GTTS: "gtts",
  CAP: "cap",
  CAPS: "caps",
  TAB: "tab",
  TABS: "tabs",
  SOL: "sol",
  SUSP: "susp",
  SUPP: "supp",
  UNG: "ung",
  MANE: "mane",
  NOCT: "noct",
  AQ: "aq",
  ET: "et",
  PER: "per",
  X: "x",
  AM: "AM",
  PM: "PM",
  AA: "āā",
};

export function abbrevDisplay(key: string): string {
  return ABBREV_SPELLING[key] ?? key;
}

// Word endings: shown with a leading hyphen ("-itis"). Everything else is a prefix or
// combining form ("nephr-", "hyper-").
const SUFFIXES = new Set([
  "itis", "osis", "iasis", "ectomy", "otomy", "tomy", "ostomy", "stomy", "scopy", "scope", "algia", "dynia",
  "pnea", "emia", "uria", "ia", "ism", "oid", "ic", "ous", "ar", "ary", "al", "ive", "ion", "oma", "penia",
  "rrhea", "rrhage", "megaly", "ptosis", "plasty", "gram", "graphy", "meter", "logy", "logist", "lysis",
  "stasis", "genic", "trophy", "pathy", "cyte", "malacia", "plegia", "opsy", "iatr", "tension",
]);

// Also treat anything that only ever ends words in the word list as a suffix.
const LAST_ONLY = (() => {
  const first = new Set<string>();
  const last = new Set<string>();
  for (const w of WORDS) {
    w.roots.forEach((r, i) => (i === w.roots.length - 1 ? last : first).add(r));
  }
  return new Set([...last].filter((r) => !first.has(r)));
})();

export const isSuffix = (key: string) => SUFFIXES.has(key) || LAST_ONLY.has(key);

// Roots that sit in the middle of words, or end them, spelled the way textbooks do.
const ROOT_SPELLING: Record<string, string> = { iatr: "-iatr-", lateral: "-lateral" };

export function rootDisplay(key: string): string {
  return ROOT_SPELLING[key] ?? (isSuffix(key) ? `-${key}` : `${key}-`);
}

// Real words from the word list that contain this root, for examples.
export function exampleWords(key: string, limit = 3) {
  return WORDS.filter((w) => w.roots.includes(key)).slice(0, limit);
}
