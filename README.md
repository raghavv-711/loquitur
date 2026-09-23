# Loquitur

*Your medical paperwork, in plain English.*

Paste text or upload a photo. Loquitur finds the jargon in prescription labels and after-visit summaries, explains each term in plain English, and breaks medical words into their Latin and Greek roots. Every AI explanation is checked against a hand-built dictionary of prescription abbreviations and word roots before it's shown.

## Run it locally

1. Install Node.js 20 or newer (nodejs.org, LTS version). If Node lives in `~/.local/node` (no-installer setup), put it on your PATH first:
   ```bash
   export PATH="$HOME/.local/node/bin:$PATH"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.local.example` to `.env.local` and paste your Claude API key from console.anthropic.com.
   Optional, for accounts and the Codex: create a free Supabase project, run `supabase/schema.sql` in its SQL Editor,
   add `http://localhost:3000/auth/callback` to Authentication → URL Configuration, and paste the project URL and
   publishable key into `.env.local`. Without them, everything except sign-in still works.
4. Start the dev server and open http://localhost:3000:
   ```bash
   npm run dev
   ```

## Accuracy

Tested on 30 made-up documents (15 prescription labels, 15 after-visit summaries) with an expert answer key covering 144 abbreviations, 31 medical terms and 37 drugs. Run it with `npm run eval` (about $0.80 in API credits); the full report is in [eval/results/REPORT.md](eval/results/REPORT.md).

| Metric | Score |
|---|---|
| Jargon found | 100% (175/175) |
| Abbreviation expansions correct, AI alone | 89% (128/144) |
| Abbreviation expansions correct, AI + dictionary verification | **100%** (144/144) |
| Root breakdowns match the answer key | 94% (29/31) |
| Drug names confirmed in the FDA database | 100% (37/37) |

Half of the AI's abbreviation errors were Latin grammar: it expanded q6h as *"quaque 6 hora"* instead of the ordinal *quaque sexta hora* (8 of 16 misses). The dictionary corrected every one. Average cost is about $0.03 and 9 seconds per document.

## Tests

```bash
npm test
```

Covers the quiz builder (valid options, no near-duplicate answers, Latin-only distractors for Latin abbreviations, word list uses real dictionary roots) and the review scheduler.

## How it works

```
text or photo → Claude (structured JSON: transcript, terms, roots, summary)
     → verify against lib/dictionary.ts (dictionary wording wins)
     → confirm drug names in the FDA label database (openFDA)
     → highlighted document + term cards
```

- `lib/decode.ts`: the Claude call and the verification step
- `lib/dictionary.ts`: reviewed abbreviations (with ISMP error-prone warnings) and Latin/Greek roots
- `lib/dictionary-drafts.ts`: new entries awaiting review; the app labels them "Draft entry". Run `npm run review` for counts.
- `lib/highlight.ts`: finds each term in the original text for highlighting
- `lib/openfda.ts`: looks up drug names in the FDA's public drug label database, with a link to the full label on DailyMed
- `lib/image.ts`: shrinks photos in the browser before upload (faster and cheaper)
- `components/CodexProvider.tsx`, `app/codex/page.tsx`: sign-in (email link) and the Codex of saved roots and abbreviations
- `app/review/page.tsx`, `lib/quiz.ts`, `lib/review.ts`: daily review quizzes built from the dictionary, scheduled with spaced repetition (a simplified SM-2)
- `lib/words.ts`: real medical words built from dictionary roots, for "decode it yourself" questions
- `supabase/schema.sql`: the Codex table, with row-level security so each user sees only their own words
- `app/api/decode/route.ts`: the API endpoint (input limits, error handling, no storage)

## Privacy and safety

- Document text and photos are sent to the Claude API for decoding and never stored or logged by Loquitur.
- Loquitur explains words. It does not give medical advice.
- The Codex stores only the words a user saves, never their documents or photos.
- Only use made-up or public sample documents for testing.

## Roadmap

- [x] Week 1–2: paste text → highlighted jargon → term cards
- [x] Week 3: photo upload (Claude vision)
- [x] Week 4: grow the dictionary to 152 abbreviations and 264 roots
- [x] Week 5: confirm drug names with openFDA
- [x] Week 6: email sign-in + Codex (saved roots and abbreviations)
- [x] Week 7: spaced-repetition review quizzes
- [x] Week 8a: accuracy evaluation
- [ ] Week 8b: launch on Vercel
