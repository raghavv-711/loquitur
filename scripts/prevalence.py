"""Measures how common each dictionary root and abbreviation is in real medical writing,
and writes lib/prevalence.ts (used by the dictionary's "Most common" sort).

Data (download first; not committed):
  wordlist.txt  98,119 English medical terms   https://github.com/glutanimate/wordlist-medicalterms-en (GPL-3.0)
  mtsamples.csv 4,999 sample medical reports    https://www.kaggle.com/datasets/tboyle10/medicaltranscriptions (CC0)
  entries.json  the dictionary's keys, exported from lib/dictionary.ts

Usage: python3 scripts/prevalence.py <data-folder>

Method
  Roots: count every word in the reports that (1) is in the medical word list, so everyday English
  like "about" can't inflate "a-", and (2) contains the root in the right position:
    - endings (-itis) must end the word (plural endings allowed)
    - prefixes (hyper-) must start it, and lose to a longer root that fits ("biopsy" is bio-, not bi-);
      short Latin prefixes (ad-, sub-, ex-) count any medical word they start, minus plain-English lookalikes
      ("above", "deep"); short Greek ones (a-, an-, di-) only count when a real root follows ("a-pnea"),
      since words like "ankle" and "disease" aren't built on them
    - word roots of 3 letters or fewer (ot-, my-, vir-) must start the word
    - longer word roots (nephr-) can sit mid-word only where roots join, at the start or after a vowel:
      "peri-o-steum" and "an-algesia" count, "posterior" doesn't count for oste-
    - a short list of false friends found by checking the top matches (history is not hist-)
  Abbreviations: count whole tokens in the reports, in the forms clinicians write: uppercase (PO),
  dotted lowercase (p.o.), and the usual lowercase units and shorthand (mg, s/p). Lowercase words
  that are ordinary English ("as", "am") are not counted as abbreviations.
"""
import csv, json, re, sys
from collections import Counter

data = sys.argv[1]
entries = json.load(open(f"{data}/entries.json"))
medical = {w.strip().lower() for w in open(f"{data}/wordlist.txt", encoding="utf-8", errors="replace") if w.strip()}
csv.field_size_limit(10**9)
reports = [r.get("transcription") or "" for r in csv.DictReader(open(f"{data}/mtsamples.csv", encoding="utf-8", errors="replace"))]

PREFIXES = {
    "a", "an", "anti", "ante", "pre", "post", "peri", "circum", "para", "epi", "endo", "ex", "exo", "extra",
    "trans", "supra", "infra", "retro", "contra", "ab", "ad", "de", "dia", "syn", "sym", "eu", "mal", "neo",
    "pan", "iso", "hemi", "semi", "uni", "mono", "di", "tri", "quadr", "poly", "olig", "micro", "macro", "mega",
    "hyper", "hypo", "tachy", "brady", "dys", "sub", "intra", "inter", "bi",
}
root_keys = [r["key"] for r in entries["roots"]]
LATIN_SHORT = {"ad", "ab", "de", "ex", "sub", "pre", "uni"}
# Plain-English words in the medical word list that start like a Latin prefix but aren't built on it.
ENGLISH_LOOKALIKES = {"above", "able", "abcd", "deep", "deeply", "deeper", "subtle", "under", "united", "exactly"}
# Roots that sit mid-word even though they're shown like endings (pediatrics, psychiatry).
MIDDLE = {"iatr"}
suffix = {r["key"] for r in entries["roots"] if r["suffix"]}
# Every prefix and root (2+ letters), for spotting where one word part ends and the next begins.
PARTS = sorted({k for k in root_keys if len(k) >= 2 and k not in suffix} | PREFIXES, key=len, reverse=True)
# "Another root" for the short-part rules: any dictionary root or ending of 3+ letters.
follow = sorted({k for k in root_keys if len(k) >= 3}, key=len, reverse=True)

def starts_with_root(rest: str, allow_vowel: bool = True) -> bool:
    """True if `rest` begins with another dictionary root (optionally after a connecting vowel)."""
    if any(rest.startswith(f) for f in follow):
        return True
    return allow_vowel and rest[:1] in "oiae" and any(rest[1:].startswith(f) for f in follow)

# Words that contain a root's letters by coincidence (different origin), found by checking the top matches.
FALSE_FRIENDS = {
    "hist": ("histor",),        # history is not histos, "tissue"
    "col": ("coll", "colu"),    # collagen, collateral, column
    "ven": ("vent",),           # ventricle is venter, "belly"
    "ren": ("rent",),
    "gen": ("gener", "gent"),   # general, generator, gentamicin
    "hem": ("hemi",),           # hemi- is "half", not haima, "blood"
    "a": ("aspir", "atri"),     # aspirin, atrial: not the Greek a-, "without"
    "pre": ("press", "pred"),   # pressure is premere, "to press"; prednisone is a drug name
    "uni": ("unin",),           # uninterrupted is English un- + in-
}

def root_matches(key: str, word: str) -> bool:
    if any(word.startswith(f) for f in FALSE_FRIENDS.get(key, ())):
        return False
    if key in suffix and key not in MIDDLE:
        return bool(re.search(re.escape(key) + r"(s|es)?$", word)) or (key.endswith("y") and word.endswith(key[:-1] + "ies"))
    if key in PREFIXES:
        if not word.startswith(key) or len(word) < len(key) + 3:
            return False
        # A longer root that also fits wins: "biopsy" is bio- + -opsy, not bi-.
        if any(k != key and k.startswith(key) and word.startswith(k) for k in root_keys):
            return False
        if len(key) > 3:
            return True
        # Latin short prefixes: almost every medical word starting with them really is built on them
        # (ad-equate, ad-minister, sub-dural, ex-cision, de-compression), minus plain-English words.
        if key in LATIN_SHORT:
            return word not in ENGLISH_LOOKALIKES and len(word) >= len(key) + 3
        # Greek short prefixes are often coincidences ("ankle", "disease"), so a real root (4+ letters)
        # must follow: a-pnea, an-emia, an-algesia.
        rest = word[len(key):]
        return any(rest.startswith(f) for f in follow if len(f) >= 4 or (len(key) >= 2 and len(f) >= 3))
    if len(key) <= 3:
        # Short word roots must start the word (vir-al, acu-te, ot-itis); anywhere else they match by accident.
        return word.startswith(key) and len(word) >= len(key) + 2
    # Longer word roots can sit mid-word, but only where parts join: at the start, after a vowel
    # (peri-o-steum), or right after another part (an-algesia). "p-oste-rior" is a coincidence.
    return any(joins(word, m.start()) for m in re.finditer(re.escape(key), word))


def joins(word: str, i: int) -> bool:
    """Is position i a place where one word part ends and another begins?"""
    if i == 0 or word[i - 1] in "aeiouy":
        return True
    before = word[:i]
    return any(before.endswith(k) for k in PARTS)  # an-algesia, ped-iatrics, dys-pepsia

# Medical words used in the reports, with how often each appears.
tokens = Counter()
for text in reports:
    for w in re.findall(r"[A-Za-z]+", text):
        lw = w.lower()
        if lw in medical and len(lw) >= 4:
            tokens[lw] += 1

root_counts = {k: sum(n for w, n in tokens.items() if root_matches(k, w)) for k in root_keys}
root_words = {k: sum(1 for w in tokens if root_matches(k, w)) for k in root_keys}

# ── Abbreviations ────────────────────────────────────────────────────────────
abbrev_keys = entries["abbreviations"]
# Written in lowercase by convention (units and chart shorthand); matched case-insensitively.
LOWER_FORMS = {
    "MG": ["mg"], "MCG": ["mcg"], "ML": ["ml"], "KG": ["kg"], "MEQ": ["meq"], "OZ": ["oz"],
    "TSP": ["tsp"], "TBSP": ["tbsp"], "GTT": ["gtt"], "GTTS": ["gtts"], "CAPS": ["caps"], "TABS": ["tabs"],
    "SUSP": ["susp"], "SUPP": ["supp"], "UNG": ["ung"], "SIG": ["sig"], "RX": ["rx"], "DISP": ["disp"],
    "QTY": ["qty"], "HX": ["hx"], "DX": ["dx"], "TX": ["tx"], "SX": ["sx"], "FX": ["fx"], "BX": ["bx"],
    "A1C": ["a1c"], "HCL": ["hcl"], "QAM": ["qam"], "QPM": ["qpm"], "QH": ["qh"], "SS": ["ss"], "AQ": ["aq"],
    "NOCT": ["noct"], "SP": ["s/p"], "RO": ["r/o"], "FU": ["f/u"], "NV": ["n/v"], "DC": ["d/c"], "WO": ["w/o"],
    "W": ["w/"], "PER": ["per"], "SOL": ["sol"],
}
# Counted with a pattern instead: "x 10 days" (not "x-ray") and "10 cc" (not "CC:" = chief complaint).
PATTERNS = {"X": r"(?<![\w-])x\s?\d", "CC": r"\d\s?cc\b"}
# Uppercase tokens that in these reports mostly mean something else: PR interval, ID (identification).
NOT_THIS_MEANING = {"PR", "ID", "CC", "X"}
PHRASES = {"ADLIB": r"\bad\s+lib\b", "UTDICT": r"\but\s+dict\b"}
SINGLE_LETTERS = {"A", "S", "P", "C", "Q", "G", "L", "U"}  # too ambiguous as bare tokens; only exact written forms count

abbrev_counts = Counter()
raw_tokens = Counter()
for text in reports:
    for t in re.findall(r"[A-Za-z0-9][A-Za-z0-9./]*", text):
        raw_tokens[t.rstrip(".")] += 1
        raw_tokens[t] += 1 if t.endswith(".") else 0  # keep dotted forms like "p.o." intact too
    for key, pat in (PHRASES | PATTERNS).items():
        abbrev_counts[key] += len(re.findall(pat, text, re.I))

dotted = re.compile(r"^(?:[a-z0-9]\.)+[a-z0-9]?\.?$")
for tok, n in raw_tokens.items():
    low = tok.lower()
    if dotted.match(low) and "." in low:
        key = re.sub(r"[^a-z0-9]", "", low).upper()
        if key in abbrev_keys and key not in SINGLE_LETTERS and key not in NOT_THIS_MEANING:
            abbrev_counts[key] += n
        continue
    if tok.isupper() and tok in abbrev_keys and tok not in SINGLE_LETTERS and tok not in NOT_THIS_MEANING:
        abbrev_counts[tok] += n
for key, forms in LOWER_FORMS.items():
    if key in abbrev_keys:
        abbrev_counts[key] += sum(n for tok, n in raw_tokens.items() if tok.lower() in forms and not tok.isupper())

def ts_record(name, counts, comment):
    body = "\n".join(f'  {json.dumps(k)}: {counts.get(k, 0)},' for k in sorted(counts, key=lambda k: (-counts.get(k, 0), k)))
    return f"// {comment}\nexport const {name}: Record<string, number> = {{\n{body}\n}};\n"

out = f'''// GENERATED by scripts/prevalence.py. Do not edit by hand; re-run the script instead.
// How often each entry appears in 4,999 sample medical reports (MTSamples, CC0), counting only
// words found in a 98,119-term medical word list (glutanimate/wordlist-medicalterms-en).
// See the script for the exact matching rules.

{ts_record("ROOT_FREQUENCY", root_counts, "Uses of each root in medical words in the reports.")}
{ts_record("ABBREV_FREQUENCY", {k: abbrev_counts.get(k, 0) for k in abbrev_keys}, "Uses of each abbreviation in the reports.")}'''
open("lib/prevalence.ts", "w").write(out)

top = lambda c, n: ", ".join(f"{k} {c[k]}" for k in sorted(c, key=lambda k: -c[k])[:n])
print(f"medical words seen: {len(tokens)} distinct, {sum(tokens.values())} uses")
print("TOP ROOTS:", top(root_counts, 25))
print("RAREST ROOTS:", ", ".join(f"{k} {root_counts[k]}" for k in sorted(root_counts, key=lambda k: root_counts[k])[:15]))
ac = {k: abbrev_counts.get(k, 0) for k in abbrev_keys}
print("TOP ABBREVIATIONS:", top(ac, 25))
print("ZERO-COUNT ABBREVIATIONS:", sum(1 for k in ac if ac[k] == 0), "of", len(ac))
print("check: ad", root_counts.get("ad"), "vs algesi", root_counts.get("algesi"))
