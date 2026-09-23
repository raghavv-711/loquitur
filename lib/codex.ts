import { normalizeAbbrev, rootKey } from "./dictionary";
import type { VerifiedRoot, VerifiedTerm } from "./schema";

export type CodexKind = "abbreviation" | "root";

export type AbbreviationDetails = { expansion: string; literal: string; plain: string };
export type RootDetails = { origin: string; meaning: string; hook: string | null };

export type CodexEntry = {
  id: string;
  kind: CodexKind;
  key: string;
  term: string;
  details: AbbreviationDetails | RootDetails;
  source_word: string | null;
  created_at: string;
  due_at: string;
  interval_days: number;
  ease: number;
  reps: number;
};

export type NewCodexEntry = Pick<CodexEntry, "kind" | "key" | "term" | "details" | "source_word">;

export const entryId = (kind: CodexKind, key: string) => `${kind}:${key}`;

// Only dictionary-backed items can be saved: the Codex teaches checked material, not AI guesses.
export function abbreviationEntry(term: VerifiedTerm): NewCodexEntry | null {
  if (term.kind !== "abbreviation" || term.status === "unverified" || !term.expansion) return null;
  return {
    kind: "abbreviation",
    key: normalizeAbbrev(term.text),
    term: term.text,
    details: { expansion: term.expansion, literal: term.literal ?? "", plain: term.plain },
    source_word: null,
  };
}

export function rootEntry(root: VerifiedRoot, word: string): NewCodexEntry | null {
  const key = rootKey(root.root);
  if ((!root.verified && !root.draft) || !key) return null;
  return {
    kind: "root",
    key,
    term: root.root,
    details: { origin: root.origin, meaning: root.meaning, hook: root.hook ?? null },
    source_word: word,
  };
}
