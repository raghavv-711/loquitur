import { ROOTS } from "./dictionary";
import { exampleWords, rootDisplay } from "./display";

// Roots that appear in at least two real words make the best daily lessons ("You'll see it in…").
// The list is shuffled once with a fixed seed so consecutive days aren't alphabetical neighbors.
const CANDIDATES = (() => {
  const keys = Object.keys(ROOTS).filter((k) => exampleWords(k, 3).length >= 2);
  let seed = 20260923;
  const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
  for (let i = keys.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [keys[i], keys[j]] = [keys[j], keys[i]];
  }
  return keys;
})();

// Same word for everyone on the same calendar day (in their own time zone).
export function wordOfTheDay(date = new Date()) {
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  const key = CANDIDATES[day % CANDIDATES.length];
  return { key, display: rootDisplay(key), ...ROOTS[key], examples: exampleWords(key, 3) };
}

export const WORD_OF_DAY_POOL_SIZE = CANDIDATES.length;
