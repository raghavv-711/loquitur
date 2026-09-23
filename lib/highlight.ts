import type { VerifiedTerm } from "./schema";

export type Segment = { text: string; termIndex: number | null };

const isWordChar = (ch: string | undefined) => !!ch && /[A-Za-z0-9]/.test(ch);

// Split the document into plain and highlighted pieces.
// Longer terms win so "q6h PRN" style overlaps don't break; matches must sit on word boundaries
// so "PO" doesn't light up inside "POSITIVE".
export function segmentText(text: string, terms: VerifiedTerm[]): Segment[] {
  const taken = new Array<number | null>(text.length).fill(null);
  const lowerText = text.toLowerCase();

  const order = terms
    .map((term, index) => ({ term, index }))
    .sort((a, b) => b.term.text.length - a.term.text.length);

  for (const { term, index } of order) {
    const needle = term.text.toLowerCase();
    if (!needle) continue;
    let from = 0;
    while (from <= lowerText.length - needle.length) {
      const at = lowerText.indexOf(needle, from);
      if (at === -1) break;
      const end = at + needle.length;
      const onBoundary = !isWordChar(text[at - 1]) && !isWordChar(text[end]);
      const free = taken.slice(at, end).every((slot) => slot === null);
      if (onBoundary && free) taken.fill(index, at, end);
      from = at + 1;
    }
  }

  const segments: Segment[] = [];
  for (let i = 0; i < text.length; i++) {
    const last = segments[segments.length - 1];
    if (last && last.termIndex === taken[i]) last.text += text[i];
    else segments.push({ text: text[i], termIndex: taken[i] });
  }
  return segments;
}
