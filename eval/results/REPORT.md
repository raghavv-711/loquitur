# Loquitur accuracy report

2026-09-23 · claude-opus-5 · 30 made-up documents (15 prescription labels, 15 after-visit summaries) · answer key in `eval/cases.ts`

| Metric | Score | Count |
|---|---|---|
| Jargon found (abbreviations + medical terms) | **100%** | 175/175 |
| Abbreviation expansion correct: AI alone | **89%** | 128/144 |
| Abbreviation expansion correct: AI + dictionary | **100%** | 144/144 |
| Root breakdown matches expert key | **94%** | 29/31 |
| Drug names confirmed by FDA | **100%** | 37/37 |
| All highlighted terms marked ✓ Verified | **83%** |  |

- Average time per document: 8.8 s
- Total cost: $0.78 ($0.026 per document)
- Extra terms flagged beyond the answer key: 67 (not scored; often reasonable, like "mg" or "Refills")

## Misses

- **avs-04** `antiemetic` roots: got anti- + -emetic, expected anti + emet + ic
- **avs-11** `cholecystectomy` roots: got lapar- + -scopic + chol- + cyst- + -ectomy (in "laparoscopic cholecystectomy"), expected cholecyst + ectomy
