// Ready-made study decks, drawn from the dictionary. No sign-in needed.
// Every key must exist in lib/dictionary.ts; lib/decks.test.ts checks this.
import type { CodexEntry } from "./codex";
import { ABBREVIATIONS, ROOTS } from "./dictionary";
import { abbrevDisplay, rootDisplay } from "./display";

export type Deck = {
  id: string;
  title: string;
  description: string;
  roots: string[];
  abbreviations: string[];
  // 1 (gentle) to 5 (hardest), judged by hand: how many words, how unfamiliar they are, and how many look-alikes.
  difficulty: 1 | 2 | 3 | 4 | 5;
};

export const DECKS: Deck[] = [
  {
    id: "premed-starter",
    difficulty: 1,
    title: "Pre-med starter",
    description: "The prefixes and suffixes that build thousands of medical words. Start here.",
    roots: [
      "a", "an", "anti", "hyper", "hypo", "tachy", "brady", "dys", "peri", "endo", "epi", "sub", "intra", "inter",
      "bi", "hemi", "poly", "micro", "macro", "neo", "itis", "osis", "ectomy", "otomy", "ostomy", "scopy", "plasty",
      "logy", "algia", "emia", "oma", "megaly", "pathy", "penia", "rrhea", "cyte", "gram", "genic",
    ],
    abbreviations: [],
  },
  {
    id: "prescription-latin",
    difficulty: 3,
    title: "Prescription Latin",
    description: "The Latin shorthand on pill bottles: when, how and how much to take.",
    roots: [],
    abbreviations: [
      "PO", "BID", "TID", "QID", "QD", "QOD", "PRN", "HS", "QHS", "AC", "PC", "C", "S", "STAT", "NPO", "SL", "PR",
      "OD", "OS", "OU", "AD", "AS", "AU", "GTT", "RX", "SIG", "ADLIB", "CAP", "TAB", "Q", "QAM", "QPM", "UTDICT",
      "AA", "QS", "SS", "NR", "MANE", "NOCT",
    ],
  },
  {
    id: "heart",
    difficulty: 4,
    title: "Heart & blood vessels",
    description: "Cardiology words, from arrhythmia to atherosclerosis.",
    roots: [
      "cardi", "angi", "arteri", "ven", "phleb", "vas", "vascul", "coron", "thromb", "embol", "ather", "scler",
      "isch", "infarct", "tachy", "brady", "rhythm", "fibr", "sten", "hem", "hemat", "emia", "tension", "edema",
    ],
    abbreviations: ["BP", "HR", "HTN", "CHF", "CAD", "MI", "DVT", "PE", "ECG", "CP"],
  },
  {
    id: "kidneys",
    difficulty: 2,
    title: "Kidneys & urinary tract",
    description: "Nephrology and urology: stones, bladders and everything in between.",
    roots: ["nephr", "ren", "ur", "uria", "cyst", "lith", "calc", "ureter", "urethr", "vesic", "hydr", "noct", "iasis", "prostat", "adren"],
    abbreviations: ["UTI", "CKD", "AKI", "GU", "BMP"],
  },
  {
    id: "lungs",
    difficulty: 3,
    title: "Lungs & breathing",
    description: "Pulmonology words, from bronchitis to dyspnea.",
    roots: ["pulmon", "pneumon", "pneum", "bronch", "trache", "pleur", "laryng", "pharyng", "rhin", "pnea", "spir", "ox", "thorac", "pector", "cyan"],
    abbreviations: ["SOB", "RR", "COPD", "URI", "INH", "NEB", "MDI"],
  },
  {
    id: "digestion",
    difficulty: 3,
    title: "Stomach & digestion",
    description: "Gastroenterology, from the esophagus to the colon.",
    roots: [
      "gastr", "enter", "esophag", "col", "colon", "rect", "proct", "hepat", "chol", "cholecyst", "pancreat", "splen",
      "appendic", "phag", "peps", "emet", "lapar", "abdomin", "rrhea",
    ],
    abbreviations: ["GI", "GERD", "NV", "ABD", "NPO"],
  },
  {
    id: "brain",
    difficulty: 4,
    title: "Brain, nerves & mind",
    description: "Neurology and psychiatry words, from encephalitis to insomnia.",
    roots: ["neur", "encephal", "cerebr", "cephal", "crani", "psych", "somn", "hypn", "esthesi", "phas", "plegia", "algia", "dynia", "myel"],
    abbreviations: ["CVA", "CT", "MRI"],
  },
  {
    id: "bones",
    difficulty: 3,
    title: "Bones, joints & muscles",
    description: "Orthopedic words, from arthritis to osteomalacia.",
    roots: ["oste", "arthr", "my", "muscul", "tendin", "chondr", "oss", "spondyl", "vertebr", "cost", "carp", "brachi", "femor", "dactyl", "pod", "lumb", "malacia"],
    abbreviations: ["FX", "NSAID"],
  },
];

export const findDeck = (id: string) => DECKS.find((d) => d.id === id);
export const deckSize = (d: Deck) => d.roots.length + d.abbreviations.length;

// Turn a deck into the same shape as saved Codex words, so the quiz builder can use it.
export function deckEntries(deck: Deck): CodexEntry[] {
  const base = { source_word: null, created_at: "", due_at: "", interval_days: 0, ease: 2.5, reps: 0 };
  return [
    ...deck.roots.map((key): CodexEntry => {
      const r = ROOTS[key];
      return { ...base, id: `root:${key}`, kind: "root", key, term: rootDisplay(key), details: { origin: r.origin, meaning: r.meaning, hook: r.hook } };
    }),
    ...deck.abbreviations.map((key): CodexEntry => {
      const a = ABBREVIATIONS[key];
      return {
        ...base,
        id: `abbreviation:${key}`,
        kind: "abbreviation",
        key,
        term: abbrevDisplay(key),
        details: { expansion: a.expansion, literal: a.literal, plain: a.plain },
      };
    }),
  ];
}
