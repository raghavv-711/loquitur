// DRAFT entries, written by AI and awaiting expert review.
// The app uses them but labels them "Draft entry" instead of "Verified".
//
// How to review: check each entry's Latin/Greek, meaning and hook. Fix anything wrong,
// then tell Claude which entries are approved so they can move into dictionary.ts.
// Run `npm run review` to see what's left.
import type { AbbreviationEntry, RootEntry } from "./dictionary";

// Keys are uppercase letters and digits only, like dictionary.ts.
export const DRAFT_ABBREVIATIONS: Record<string, AbbreviationEntry> = {
};

// Keys are lowercase with hyphens removed, like dictionary.ts.
export const DRAFT_ROOTS: Record<string, RootEntry> = {
};
