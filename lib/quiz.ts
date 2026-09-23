// Builds multiple-choice review questions from Codex entries, using only Loquitur's own data
// (dictionary + word list), so quizzes are instant, free and never made up.
import type { AbbreviationDetails, CodexEntry, RootDetails } from "./codex";
import { ABBREVIATIONS, ROOTS } from "./dictionary";
import { WORDS, type Word } from "./words";

export type QuestionType = "root-meaning" | "abbrev-meaning" | "abbrev-latin" | "decode";

export type Question = {
  type: QuestionType;
  prompt: string; // the question
  subject: string; // the big word shown on the card
  hint?: string; // e.g. "nephr- + -ectomy"
  options: string[];
  answer: number; // index into options
  explanation: string;
};

export type Rng = () => number; // returns [0, 1), like Math.random

export function buildQuestion(entry: CodexEntry, knownKeys: Set<string>, rng: Rng = Math.random): Question {
  if (entry.kind === "root") {
    // Prefer a word the user hasn't already seen (not the one they saved the root from).
    const all = WORDS.filter((w) => w.roots.includes(entry.key));
    const unseen = all.filter((w) => w.word !== entry.source_word?.toLowerCase());
    const words = unseen.length ? unseen : all;
    // Half the time (when possible), ask the user to decode a new word built from this root.
    if (words.length > 0 && rng() < 0.5) return decodeQuestion(entry, pick(words, rng), knownKeys, rng);
    return rootMeaningQuestion(entry, rng);
  }
  return rng() < 0.5 ? abbrevLatinQuestion(entry, rng) : abbrevMeaningQuestion(entry, rng);
}

function rootMeaningQuestion(entry: CodexEntry, rng: Rng): Question {
  const d = entry.details as RootDetails;
  const pool = Object.entries(ROOTS)
    .filter(([key]) => key !== entry.key)
    .map(([, r]) => r.meaning);
  return finish(
    {
      type: "root-meaning",
      prompt: "What does this word part mean?",
      subject: entry.term,
      explanation: `${entry.term} comes from ${d.origin}, "${d.meaning}".${d.hook ? ` 💡 ${d.hook}` : ""}`,
    },
    d.meaning,
    pool,
    rng,
  );
}

function abbrevMeaningQuestion(entry: CodexEntry, rng: Rng): Question {
  const d = entry.details as AbbreviationDetails;
  const pool = Object.entries(ABBREVIATIONS)
    .filter(([key]) => key !== entry.key)
    .map(([, a]) => a.plain);
  return finish(
    {
      type: "abbrev-meaning",
      prompt: "What does this abbreviation mean?",
      subject: entry.term,
      explanation: `${entry.term} is short for ${d.expansion}${d.literal ? `, "${d.literal}"` : ""}.`,
    },
    d.plain,
    pool,
    rng,
  );
}

function abbrevLatinQuestion(entry: CodexEntry, rng: Rng): Question {
  const d = entry.details as AbbreviationDetails;
  // Latin abbreviations get Latin wrong answers; English ones get English (so the answer isn't obvious).
  const latin = isLatin(d);
  const pool = Object.entries(ABBREVIATIONS)
    .filter(([key, a]) => key !== entry.key && isLatin(a) === latin)
    .map(([, a]) => a.expansion);
  return finish(
    {
      type: "abbrev-latin",
      prompt: "What is this abbreviation short for?",
      subject: entry.term,
      explanation: `${entry.term} = ${d.expansion}${d.literal ? ` ("${d.literal}")` : ""}: ${d.plain}.`,
    },
    d.expansion,
    pool,
    rng,
  );
}

function decodeQuestion(entry: CodexEntry, word: Word, knownKeys: Set<string>, rng: Rng): Question {
  const parts = word.roots.map((key) => ({ key, text: displayRoot(key, word.roots), meaning: ROOTS[key]?.meaning ?? "" }));
  const known = parts.filter((p) => knownKeys.has(p.key)).map((p) => p.text);
  // Wrong answers that share a root are the most useful distractors (nephrectomy vs nephritis).
  const related = WORDS.filter((w) => w.word !== word.word && w.roots.some((r) => word.roots.includes(r)));
  const others = WORDS.filter((w) => w.word !== word.word && !related.includes(w));
  const pool = [...shuffle(related, rng).slice(0, 2), ...shuffle(others, rng)].map((w) => w.meaning);
  return finish(
    {
      type: "decode",
      // In the Codex the user has learned these parts; in a study deck they may not have yet.
      prompt: known.length ? `You know ${list(known)}. Decode this word:` : "Decode this word from its parts:",
      subject: word.word,
      hint: parts.map((p) => p.text).join(" + "),
      explanation: parts.map((p) => `${p.text} = ${p.meaning}`).join(" · "),
    },
    word.meaning,
    pool,
    rng,
    false, // keep related distractors first in the pool; options get shuffled at the end anyway
  );
}

// "pro re nata" (translated as "for the thing that has arisen") is Latin; "blood pressure" is plain English.
function isLatin(a: { expansion: string; literal: string }): boolean {
  return a.expansion !== a.literal && !a.expansion.includes("(") && !a.expansion.includes("/");
}

// Shows a root the way doctors write it: first part "nephr-", last part "-itis", middle "-cardi-".
function displayRoot(key: string, all: string[]): string {
  const i = all.indexOf(key);
  if (all.length === 1) return `${key}-`;
  if (i === 0) return `${key}-`;
  if (i === all.length - 1) return `-${key}`;
  return `-${key}-`;
}

function finish(
  base: Omit<Question, "options" | "answer">,
  correct: string,
  pool: string[],
  rng: Rng,
  shufflePool = true,
): Question {
  // Skip wrong answers that are really the same answer ("kidney" vs "kidneys", "not, without" twice).
  const norm = (s: string) => s.toLowerCase().replace(/s\b/g, "").trim();
  const overlaps = (a: string, b: string) => a === b || a.includes(b) || b.includes(a);
  const chosen = [norm(correct)];
  const distractors: string[] = [];
  for (const option of shufflePool ? shuffle(pool, rng) : pool) {
    if (distractors.length === 3) break;
    const n = norm(option);
    if (!n || chosen.some((c) => overlaps(c, n))) continue;
    chosen.push(n);
    distractors.push(option);
  }
  const options = shuffle([correct, ...distractors], rng);
  return { ...base, options, answer: options.indexOf(correct) };
}

function shuffle<T>(items: T[], rng: Rng): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pick = <T,>(items: T[], rng: Rng) => items[Math.floor(rng() * items.length)];
const list = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
