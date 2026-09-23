# Loquitur

*Your medical paperwork, in plain English.*

Loquitur finds the jargon in prescription labels and after-visit summaries, explains each term in plain English, and breaks medical words into their Latin and Greek roots. Every AI explanation is checked against a hand-built dictionary of prescription abbreviations and word roots before it's shown.

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
4. Start the dev server and open http://localhost:3000:
   ```bash
   npm run dev
   ```

## How it works

```
text → Claude (structured JSON: terms, roots, summary)
     → verify against lib/dictionary.ts (dictionary wording wins)
     → highlighted document + term cards
```

- `lib/decode.ts`: the Claude call and the verification step
- `lib/dictionary.ts`: hand-checked abbreviations (with ISMP error-prone warnings) and Latin/Greek roots
- `lib/highlight.ts`: finds each term in the original text for highlighting
- `app/api/decode/route.ts`: the API endpoint (input limits, error handling, no storage)

## Privacy and safety

- Document text is sent to the Claude API for decoding and never stored or logged by Loquitur.
- Loquitur explains words. It does not give medical advice.
- Only use made-up or public sample documents for testing.

## Roadmap

- [x] Week 1–2: paste text → highlighted jargon → term cards
- [ ] Week 3: photo upload (Claude vision)
- [ ] Week 4: grow the dictionary to ~60 abbreviations and ~150 roots
- [ ] Week 5: MedlinePlus + openFDA checks
- [ ] Week 6: sign-in + Codex (saved roots)
- [ ] Week 7: spaced-repetition review quizzes
- [ ] Week 8: accuracy evaluation + launch
