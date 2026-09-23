// Loquitur's hand-checked reference data.
// The AI suggests explanations; these entries are what we trust to confirm them.
// New entries start in dictionary-drafts.ts and move here once they've been reviewed.
import { DRAFT_ABBREVIATIONS, DRAFT_ROOTS } from "./dictionary-drafts";

export type AbbreviationEntry = {
  expansion: string; // the original Latin (or English) phrase
  literal: string; // word-for-word translation
  plain: string; // what it means on a label
  warning?: string; // ISMP / Joint Commission error-prone abbreviation note
};

export type RootEntry = {
  origin: string;
  meaning: string;
  hook: string; // a memory aid from an everyday English word
};

// Keys are uppercase letters and digits only (see normalizeAbbrev).
export const ABBREVIATIONS: Record<string, AbbreviationEntry> = {
  PO: { expansion: "per os", literal: "through the mouth", plain: "by mouth" },
  BID: { expansion: "bis in die", literal: "twice in a day", plain: "two times a day" },
  TID: { expansion: "ter in die", literal: "three times in a day", plain: "three times a day" },
  QID: { expansion: "quater in die", literal: "four times in a day", plain: "four times a day" },
  QD: {
    expansion: "quaque die",
    literal: "every day",
    plain: "once a day",
    warning: 'Error-prone: "QD" can be misread as "QID" (four times a day). Safer to write "daily".',
  },
  QOD: {
    expansion: "quaque altera die",
    literal: "every other day",
    plain: "every other day",
    warning: 'Error-prone: "QOD" can be misread as "QD" or "QID". Safer to write "every other day".',
  },
  PRN: { expansion: "pro re nata", literal: "for the thing that has arisen", plain: "only when needed" },
  HS: {
    expansion: "hora somni",
    literal: "at the hour of sleep",
    plain: "at bedtime",
    warning: 'Error-prone: "HS" can be misread as "half-strength". Safer to write "bedtime".',
  },
  QHS: {
    expansion: "quaque hora somni",
    literal: "every hour of sleep",
    plain: "every night at bedtime",
    warning: 'Error-prone: "QHS" can be misread as "every hour". Safer to write "nightly at bedtime".',
  },
  C: { expansion: "cum", literal: "with", plain: "with (often written as a c with a bar over it: c̄)" },
  AC: { expansion: "ante cibum", literal: "before food", plain: "before meals" },
  PC: { expansion: "post cibum", literal: "after food", plain: "after meals" },
  STAT: { expansion: "statim", literal: "immediately", plain: "right away" },
  NPO: { expansion: "nil per os", literal: "nothing through the mouth", plain: "nothing to eat or drink" },
  SL: { expansion: "sub lingua", literal: "under the tongue", plain: "let it dissolve under your tongue" },
  PR: { expansion: "per rectum", literal: "through the rectum", plain: "rectally" },
  OD: {
    expansion: "oculus dexter",
    literal: "right eye",
    plain: "in the right eye",
    warning: "Error-prone: OD, OS and OU are easily confused with each other and with AD, AS and AU (ears).",
  },
  OS: {
    expansion: "oculus sinister",
    literal: "left eye",
    plain: "in the left eye",
    warning: "Error-prone: OD, OS and OU are easily confused with each other and with AD, AS and AU (ears).",
  },
  OU: {
    expansion: "oculus uterque",
    literal: "each eye",
    plain: "in both eyes",
    warning: "Error-prone: OD, OS and OU are easily confused with each other and with AD, AS and AU (ears).",
  },
  AD: {
    expansion: "auris dextra",
    literal: "right ear",
    plain: "in the right ear",
    warning: "Error-prone: AD, AS and AU are easily confused with each other and with OD, OS and OU (eyes).",
  },
  AS: {
    expansion: "auris sinistra",
    literal: "left ear",
    plain: "in the left ear",
    warning: "Error-prone: AD, AS and AU are easily confused with each other and with OD, OS and OU (eyes).",
  },
  AU: {
    expansion: "auris utraque",
    literal: "each ear",
    plain: "in both ears",
    warning: "Error-prone: AD, AS and AU are easily confused with each other and with OD, OS and OU (eyes).",
  },
  GTT: { expansion: "guttae", literal: "drops", plain: "drops" },
  RX: { expansion: "recipe", literal: "take! (a command)", plain: "prescription" },
  SIG: { expansion: "signa", literal: "mark! / label! (a command)", plain: "directions for the label" },
  ADLIB: { expansion: "ad libitum", literal: "at one's pleasure", plain: "freely, as much as you want" },
  CAP: { expansion: "capsula", literal: "little box", plain: "capsule" },
  TAB: { expansion: "tabella", literal: "little board", plain: "tablet" },
  IM: { expansion: "intra musculum", literal: "into the muscle", plain: "injected into a muscle" },
  IV: { expansion: "intra venam", literal: "into the vein", plain: "into a vein" },
  SC: {
    expansion: "subcutaneous (sub cutem)",
    literal: "under the skin",
    plain: "injected just under the skin",
    warning: 'Error-prone: "SC" can be misread as "SL" (under the tongue). Safer to write "subcut".',
  },
  SQ: {
    expansion: "subcutaneous (sub cutem)",
    literal: "under the skin",
    plain: "injected just under the skin",
    warning: 'Error-prone: "SQ" can be misread as "5 every". Safer to write "subcut".',
  },
  DC: {
    expansion: "discharge / discontinue",
    literal: "discharge or discontinue",
    plain: "either leave the hospital OR stop a medicine",
    warning: 'Error-prone: "D/C" can mean discharge OR discontinue. Ask which one is meant.',
  },
  CC: {
    expansion: "cubic centimeters",
    literal: "cubic centimeters",
    plain: "same as milliliters (mL)",
    warning: 'Error-prone: "cc" can be misread as "U" (units). Safer to write "mL".',
  },
  U: {
    expansion: "unit",
    literal: "unit",
    plain: "unit (a dose measure, often for insulin)",
    warning: 'Error-prone: "U" can be misread as 0 or 4, causing a 10x overdose. Safer to write "unit".',
  },
  IU: {
    expansion: "international unit",
    literal: "international unit",
    plain: "international unit (a dose measure)",
    warning: 'Error-prone: "IU" can be misread as "IV" or "10". Safer to write "units".',
  },

  // ── Added in week 4 (reviewed) ──
  // ── Timing (Latin) ──────────────────────────────────────────────
  Q: { expansion: "quaque", literal: "every", plain: "every" },
  QH: { expansion: "quaque hora", literal: "every hour", plain: "every hour" },
  QAM: { expansion: "quaque ante meridiem", literal: "every (day) before midday", plain: "every morning" },
  QPM: { expansion: "quaque post meridiem", literal: "every (day) after midday", plain: "every evening" },
  AM: { expansion: "ante meridiem", literal: "before midday", plain: "morning" },
  PM: { expansion: "post meridiem", literal: "after midday", plain: "afternoon or evening" },
  MANE: { expansion: "mane", literal: "in the morning", plain: "in the morning" },
  NOCT: { expansion: "nocte", literal: "at night", plain: "at night" },
  TIW: {
    expansion: "three times a week",
    literal: "three times a week",
    plain: "three times a week",
    warning: 'Error-prone: "TIW" can be misread as "three times a day" or "twice a week". Safer to write it out.',
  },

  // ── Directions (Latin) ──────────────────────────────────────────
  UD: { expansion: "ut dictum", literal: "as it has been said", plain: "as directed" },
  UTDICT: { expansion: "ut dictum", literal: "as it has been said", plain: "as directed" },
  AA: { expansion: "ana (Greek)", literal: "of each", plain: "of each (equal amounts of each ingredient)" },
  QS: { expansion: "quantum sufficit", literal: "as much as suffices", plain: "as much as needed" },
  SS: {
    expansion: "semis",
    literal: "a half",
    plain: "one half",
    warning: 'Error-prone: "ss" can be misread as "55" or confused with "sliding scale". Safer to write "one-half" or "1/2".',
  },
  NR: { expansion: "non repetatur", literal: "let it not be repeated", plain: "no refills" },
  S: { expansion: "sine", literal: "without", plain: "without (often written as an s with a bar over it: s̄)" },
  P: { expansion: "post", literal: "after", plain: "after (often written as a p with a bar over it: p̄)" },
  A: { expansion: "ante", literal: "before", plain: "before (often written as an a with a bar over it: ā)" },
  ET: { expansion: "et", literal: "and", plain: "and" },
  PER: { expansion: "per", literal: "through, by means of", plain: "by or through" },
  AQ: { expansion: "aqua", literal: "water", plain: "water" },
  W: { expansion: "with", literal: "with", plain: "with" },
  WO: { expansion: "without", literal: "without", plain: "without" },

  // ── Routes (how to take it) ─────────────────────────────────────
  PV: { expansion: "per vaginam", literal: "through the vagina", plain: "vaginally" },
  TOP: { expansion: "topical (Greek topos, place)", literal: "for a place", plain: "put on the skin" },
  INJ: { expansion: "injectio", literal: "a throwing in", plain: "injection" },
  ID: { expansion: "intradermal", literal: "within the skin", plain: "injected into the skin" },
  INH: { expansion: "inhalation", literal: "a breathing in", plain: "breathe it in" },
  NEB: { expansion: "nebulizer (Latin nebula, mist)", literal: "mist-maker", plain: "a machine that turns medicine into mist to breathe" },
  MDI: { expansion: "metered-dose inhaler", literal: "metered-dose inhaler", plain: "an inhaler that gives a set dose per puff" },

  // ── Forms (what it is) ──────────────────────────────────────────
  CAPS: { expansion: "capsulae", literal: "little boxes", plain: "capsules" },
  TABS: { expansion: "tabellae", literal: "little boards", plain: "tablets" },
  SOL: { expansion: "solutio", literal: "a loosening, dissolving", plain: "a liquid with the medicine dissolved in it" },
  SUSP: { expansion: "suspensio", literal: "a hanging up", plain: "a liquid with particles floating in it (shake well)" },
  SUPP: { expansion: "suppositorium", literal: "something placed underneath", plain: "suppository" },
  UNG: { expansion: "unguentum", literal: "ointment", plain: "ointment" },
  GTTS: { expansion: "guttae", literal: "drops", plain: "drops" },
  EC: { expansion: "enteric-coated (Greek enteron, intestine)", literal: "intestine-coated", plain: "coated so it dissolves in the intestine, not the stomach" },
  ODT: { expansion: "orally disintegrating tablet", literal: "orally disintegrating tablet", plain: "a tablet that dissolves on your tongue" },
  SR: { expansion: "sustained release", literal: "sustained release", plain: "releases medicine slowly over time" },
  CR: { expansion: "controlled release", literal: "controlled release", plain: "releases medicine slowly over time" },
  XR: { expansion: "extended release", literal: "extended release", plain: "releases medicine slowly over time; don't crush or chew" },
  XL: { expansion: "extra long (extended release)", literal: "extra long", plain: "releases medicine slowly over time; don't crush or chew" },
  HCL: { expansion: "hydrochloride", literal: "hydrochloride", plain: "the salt form of the drug (it doesn't change what the drug does)" },

  // ── Amounts ─────────────────────────────────────────────────────
  MG: { expansion: "milligram (Latin mille, thousand)", literal: "a thousandth of a gram", plain: "milligram, a small unit of weight" },
  MCG: { expansion: "microgram (Greek mikros, small)", literal: "a millionth of a gram", plain: "microgram, 1,000 times smaller than a milligram" },
  G: { expansion: "gram (Greek gramma, a small weight)", literal: "gram", plain: "gram" },
  KG: { expansion: "kilogram (Greek chilioi, thousand)", literal: "a thousand grams", plain: "kilogram (about 2.2 pounds)" },
  ML: { expansion: "milliliter (Latin mille, thousand)", literal: "a thousandth of a liter", plain: "milliliter (a teaspoon is about 5 mL)" },
  L: { expansion: "liter", literal: "liter", plain: "liter" },
  MEQ: { expansion: "milliequivalent", literal: "milliequivalent", plain: "a unit for minerals like potassium" },
  TSP: {
    expansion: "teaspoon",
    literal: "teaspoon",
    plain: "teaspoon (5 mL)",
    warning: "Easy to mix up: TSP (5 mL) vs TBSP (15 mL). Use a dosing cup or syringe marked in mL.",
  },
  TBSP: {
    expansion: "tablespoon",
    literal: "tablespoon",
    plain: "tablespoon (15 mL)",
    warning: "Easy to mix up: TSP (5 mL) vs TBSP (15 mL). Use a dosing cup or syringe marked in mL.",
  },
  OZ: { expansion: "ounce (Latin uncia, a twelfth)", literal: "a twelfth", plain: "ounce (about 30 mL for liquids)" },

  // ── On the label ────────────────────────────────────────────────
  DISP: { expansion: "dispense (Latin dispensare, to weigh out)", literal: "weigh out", plain: "how much the pharmacy gives you" },
  QTY: { expansion: "quantity (Latin quantitas, how much)", literal: "how much", plain: "how many you get" },
  DAW: { expansion: "dispense as written", literal: "dispense as written", plain: "the pharmacy must give the exact brand written, not a generic" },
  X: { expansion: "times / for", literal: "times", plain: 'for a length of time ("x 10 days") or a number of times' },
  NKDA: { expansion: "no known drug allergies", literal: "no known drug allergies", plain: "you have no known allergies to medicines" },
  NKA: { expansion: "no known allergies", literal: "no known allergies", plain: "you have no known allergies" },
  OTC: { expansion: "over the counter", literal: "over the counter", plain: "you can buy it without a prescription" },

  // ── Chart shorthand ─────────────────────────────────────────────
  HX: { expansion: "history (Greek historia, inquiry)", literal: "history", plain: "your past health history" },
  DX: { expansion: "diagnosis (Greek dia + gnosis, knowing through)", literal: "knowing through", plain: "what the doctor thinks you have" },
  TX: { expansion: "treatment", literal: "treatment", plain: "treatment" },
  SX: { expansion: "symptoms", literal: "symptoms", plain: "symptoms (sometimes: surgery)" },
  FX: { expansion: "fracture (Latin fractura, a breaking)", literal: "a breaking", plain: "broken bone" },
  BX: { expansion: "biopsy (Greek bios + opsis, viewing life)", literal: "a viewing of living tissue", plain: "taking a small tissue sample to test" },
  SP: { expansion: "status post", literal: "the state after", plain: "after (a past surgery or event)" },
  RO: { expansion: "rule out", literal: "rule out", plain: "the doctor wants to check whether you have this" },
  FU: { expansion: "follow-up", literal: "follow-up", plain: "a later appointment to check how you're doing" },
  WNL: { expansion: "within normal limits", literal: "within normal limits", plain: "normal" },
  PCP: { expansion: "primary care provider", literal: "primary care provider", plain: "your regular doctor" },
  BP: { expansion: "blood pressure", literal: "blood pressure", plain: "blood pressure" },
  HR: { expansion: "heart rate", literal: "heart rate", plain: "heartbeats per minute" },
  RR: { expansion: "respiratory rate", literal: "respiratory rate", plain: "breaths per minute" },
  SOB: { expansion: "shortness of breath", literal: "shortness of breath", plain: "trouble breathing" },
  CP: { expansion: "chest pain", literal: "chest pain", plain: "chest pain" },
  NV: { expansion: "nausea and vomiting (Greek nausia, seasickness)", literal: "seasickness and vomiting", plain: "feeling sick to your stomach and throwing up" },
  ABD: { expansion: "abdomen", literal: "abdomen", plain: "belly" },
  BMI: { expansion: "body mass index", literal: "body mass index", plain: "a weight-for-height number" },

  // ── Conditions ──────────────────────────────────────────────────
  GI: { expansion: "gastrointestinal (Greek gaster + Latin intestinum)", literal: "stomach and intestines", plain: "your stomach and gut" },
  GU: { expansion: "genitourinary", literal: "genitals and urinary tract", plain: "your urinary and reproductive organs" },
  ENT: { expansion: "ear, nose and throat", literal: "ear, nose and throat", plain: "ear, nose and throat" },
  URI: { expansion: "upper respiratory infection", literal: "upper respiratory infection", plain: "a cold or other infection of the nose and throat" },
  UTI: { expansion: "urinary tract infection", literal: "urinary tract infection", plain: "a bladder or kidney infection" },
  HTN: { expansion: "hypertension", literal: "over-pressure", plain: "high blood pressure" },
  DM: {
    expansion: "diabetes mellitus",
    literal: "a honey-sweet passing-through",
    plain: "diabetes (high blood sugar). Greek diabetes, 'siphon'; Latin mellitus, 'honeyed'",
  },
  CHF: { expansion: "congestive heart failure", literal: "congestive heart failure", plain: "the heart doesn't pump strongly enough, so fluid builds up" },
  COPD: { expansion: "chronic obstructive pulmonary disease", literal: "long-lasting blocked-lung disease", plain: "a long-term lung disease that makes breathing hard" },
  CAD: { expansion: "coronary artery disease", literal: "crown-artery disease", plain: "narrowed arteries that feed the heart" },
  MI: { expansion: "myocardial infarction (Latin infarcire, to stuff)", literal: "heart-muscle stuffing", plain: "heart attack" },
  CVA: { expansion: "cerebrovascular accident", literal: "brain-vessel accident", plain: "stroke" },
  DVT: { expansion: "deep vein thrombosis (Greek thrombos, clot)", literal: "deep vein clotting", plain: "a blood clot in a deep vein, usually the leg" },
  PE: {
    expansion: "pulmonary embolism / physical exam",
    literal: "lung plug / physical exam",
    plain: "either a blood clot in the lung OR a physical exam, depending on context",
  },
  GERD: { expansion: "gastroesophageal reflux disease (Latin refluxus, flowing back)", literal: "stomach-gullet flowing-back disease", plain: "acid reflux / heartburn" },
  CKD: { expansion: "chronic kidney disease", literal: "long-lasting kidney disease", plain: "kidneys that have slowly lost function" },
  AKI: { expansion: "acute kidney injury (Latin acutus, sharp)", literal: "sudden kidney injury", plain: "kidneys that suddenly stopped working well" },

  // ── Tests ───────────────────────────────────────────────────────
  CBC: { expansion: "complete blood count", literal: "complete blood count", plain: "a blood test that counts your blood cells" },
  BMP: { expansion: "basic metabolic panel", literal: "basic metabolic panel", plain: "a blood test for kidneys, blood sugar and salts" },
  CMP: { expansion: "comprehensive metabolic panel", literal: "comprehensive metabolic panel", plain: "a BMP plus liver and protein tests" },
  A1C: { expansion: "hemoglobin A1c", literal: "hemoglobin A1c", plain: "your average blood sugar over about 3 months" },
  LDL: { expansion: "low-density lipoprotein", literal: "low-density fat-protein", plain: '"bad" cholesterol' },
  HDL: { expansion: "high-density lipoprotein", literal: "high-density fat-protein", plain: '"good" cholesterol' },
  ECG: { expansion: "electrocardiogram", literal: "electric heart-writing", plain: "a test that records your heartbeat" },
  EKG: { expansion: "electrocardiogram (German spelling)", literal: "electric heart-writing", plain: "a test that records your heartbeat" },
  CT: { expansion: "computed tomography (Greek tomos, slice)", literal: "computed slice-writing", plain: "a detailed X-ray scan in slices" },
  MRI: { expansion: "magnetic resonance imaging", literal: "magnetic resonance imaging", plain: "a detailed scan that uses magnets, not X-rays" },

  // ── Drug shorthand ──────────────────────────────────────────────
  NSAID: { expansion: "nonsteroidal anti-inflammatory drug", literal: "non-steroid anti-inflammation drug", plain: "a pain reliever like ibuprofen or naproxen" },
  SSRI: { expansion: "selective serotonin reuptake inhibitor", literal: "selective serotonin reuptake inhibitor", plain: "a common type of antidepressant" },
  ASA: { expansion: "acetylsalicylic acid (Latin salix, willow)", literal: "willow acid", plain: "aspirin" },
  APAP: { expansion: "N-acetyl-para-aminophenol", literal: "N-acetyl-para-aminophenol", plain: "acetaminophen (Tylenol)" },
  NS: { expansion: "normal saline (Latin sal, salt)", literal: "normal salt water", plain: "salt water given through an IV" },
  HCTZ: {
    expansion: "hydrochlorothiazide",
    literal: "hydrochlorothiazide",
    plain: "a water pill for blood pressure",
    warning: 'Error-prone: "HCTZ" can be mistaken for hydrocortisone. Drug-name abbreviations are risky.',
  },
  MS: {
    expansion: "morphine sulfate / magnesium sulfate",
    literal: "morphine sulfate / magnesium sulfate",
    plain: "could mean either of two very different drugs",
    warning: 'Error-prone: "MS" can mean morphine sulfate OR magnesium sulfate. Ask which one is meant.',
  },
  MSO4: {
    expansion: "morphine sulfate",
    literal: "morphine sulfate",
    plain: "morphine (a strong pain medicine)",
    warning: 'Error-prone: "MSO4" can be confused with "MgSO4" (magnesium sulfate). Safer to write the full name.',
  },
  MGSO4: {
    expansion: "magnesium sulfate",
    literal: "magnesium sulfate",
    plain: "magnesium (a mineral)",
    warning: 'Error-prone: "MgSO4" can be confused with "MSO4" (morphine sulfate). Safer to write the full name.',
  },
};

// Keys are lowercase with hyphens removed (see normalizeRoot). Add variant spellings as extra keys.
export const ROOTS: Record<string, RootEntry> = {
  nephr: { origin: "Greek nephros", meaning: "kidney", hook: "nephrologist = kidney doctor" },
  ren: { origin: "Latin renes", meaning: "kidneys", hook: "renal failure = kidney failure" },
  hepat: { origin: "Greek hēpar, hēpatos", meaning: "liver", hook: "hepatitis = liver inflammation" },
  cardi: { origin: "Greek kardia", meaning: "heart", hook: "cardiologist = heart doctor" },
  gastr: { origin: "Greek gastēr", meaning: "stomach", hook: "gastric = of the stomach" },
  enter: { origin: "Greek enteron", meaning: "intestine", hook: "gastroenteritis = stomach flu" },
  derm: { origin: "Greek derma", meaning: "skin", hook: "dermatologist = skin doctor" },
  dermat: { origin: "Greek derma, dermatos", meaning: "skin", hook: "dermatologist = skin doctor" },
  cutane: { origin: "Latin cutis", meaning: "skin", hook: "subcutaneous = under the skin" },
  oste: { origin: "Greek osteon", meaning: "bone", hook: "osteoporosis = porous bones" },
  arthr: { origin: "Greek arthron", meaning: "joint", hook: "arthritis = joint inflammation" },
  neur: { origin: "Greek neuron", meaning: "nerve", hook: "neurologist = nerve doctor" },
  pulmon: { origin: "Latin pulmo, pulmonis", meaning: "lung", hook: "pulmonary = of the lungs" },
  pneumon: { origin: "Greek pneumōn", meaning: "lung", hook: "pneumonia = lung infection" },
  hem: { origin: "Greek haima", meaning: "blood", hook: "hemorrhage = heavy bleeding" },
  hemat: { origin: "Greek haima, haimatos", meaning: "blood", hook: "hematology = study of blood" },
  emia: { origin: "Greek haima", meaning: "blood condition", hook: "anemia = lacking (healthy) blood" },
  angi: { origin: "Greek angeion", meaning: "vessel", hook: "angioplasty = repairing a blood vessel" },
  vascul: { origin: "Latin vasculum", meaning: "small vessel", hook: "vascular = of the blood vessels" },
  cyst: { origin: "Greek kystis", meaning: "bladder, sac", hook: "cystitis = bladder infection" },
  lith: { origin: "Greek lithos", meaning: "stone", hook: "monolith = a single stone" },
  hydr: { origin: "Greek hydōr", meaning: "water", hook: "hydrate = add water" },
  itis: { origin: "Greek -itis", meaning: "inflammation", hook: "tonsillitis = inflamed tonsils" },
  osis: { origin: "Greek -ōsis", meaning: "condition, process", hook: "fibrosis = a scarring condition" },
  iasis: { origin: "Greek -iasis", meaning: "condition, disease", hook: "psoriasis = a skin condition" },
  ectomy: { origin: "Greek ektomē", meaning: "cutting out", hook: "appendectomy = removing the appendix" },
  otomy: { origin: "Greek tomē", meaning: "cutting", hook: "anatomy = cutting up (to study)" },
  scopy: { origin: "Greek skopein", meaning: "looking at", hook: "telescope = far-looker" },
  algia: { origin: "Greek algos", meaning: "pain", hook: "nostalgia = pain of homecoming" },
  pnea: { origin: "Greek pnoē", meaning: "breathing", hook: "apnea = not breathing" },
  hyper: { origin: "Greek hyper", meaning: "over, above", hook: "hyperactive = overactive" },
  hypo: { origin: "Greek hypo", meaning: "under, below", hook: "hypothermia = body heat too low" },
  tension: { origin: "Latin tensio", meaning: "stretching, pressure", hook: "hypertension = high (blood) pressure" },
  tachy: { origin: "Greek tachys", meaning: "fast", hook: "tachometer = speed gauge" },
  brady: { origin: "Greek bradys", meaning: "slow", hook: "bradycardia = slow heartbeat" },
  bi: { origin: "Latin bis", meaning: "two, twice", hook: "bicycle = two wheels" },
  later: { origin: "Latin latus, lateris", meaning: "side", hook: "lateral = to the side" },
  lateral: { origin: "Latin latus, lateris", meaning: "side", hook: "lateral = to the side" },
  sub: { origin: "Latin sub", meaning: "under", hook: "submarine = under the sea" },
  intra: { origin: "Latin intra", meaning: "within, into", hook: "intramural = within the walls" },
  inter: { origin: "Latin inter", meaning: "between", hook: "international = between nations" },
  dys: { origin: "Greek dys-", meaning: "bad, difficult", hook: "dysfunction = working badly" },
  glyc: { origin: "Greek glykys", meaning: "sweet, sugar", hook: "hypoglycemia = low blood sugar" },
  thromb: { origin: "Greek thrombos", meaning: "clot", hook: "thrombosis = forming a clot" },
  cephal: { origin: "Greek kephalē", meaning: "head", hook: "encephalitis = brain inflammation" },
  ocul: { origin: "Latin oculus", meaning: "eye", hook: "binoculars = two eyes" },
  ophthalm: { origin: "Greek ophthalmos", meaning: "eye", hook: "ophthalmologist = eye doctor" },
  ot: { origin: "Greek ous, ōtos", meaning: "ear", hook: "otitis = ear infection" },
  carcin: { origin: "Greek karkinos", meaning: "crab; cancer", hook: "carcinogen = cancer-causer" },
  onc: { origin: "Greek onkos", meaning: "mass, tumor", hook: "oncologist = cancer doctor" },
  thorac: { origin: "Greek thōrax", meaning: "chest", hook: "thoracic = of the chest" },
  lumb: { origin: "Latin lumbus", meaning: "loin, lower back", hook: "lumbar pain = lower back pain" },
  uria: { origin: "Greek ouron", meaning: "urine condition", hook: "hematuria = blood in the urine" },
  tens: { origin: "Latin tendere, tensus", meaning: "to stretch", hook: "tense = stretched tight" },
  ion: { origin: "Latin -io, -ionis", meaning: "act or state of", hook: "action = the act of doing" },
  al: { origin: "Latin -alis", meaning: "relating to", hook: "renal = relating to the kidneys" },

  // ── Added in week 4 (reviewed) ──
  // ── Brain, nerves, mind ─────────────────────────────────────────
  encephal: { origin: "Greek enkephalos", meaning: "brain", hook: "encephalitis = brain inflammation" },
  cerebr: { origin: "Latin cerebrum", meaning: "brain", hook: "cerebral = of the brain" },
  crani: { origin: "Greek kranion", meaning: "skull", hook: "cranium = skull" },
  psych: { origin: "Greek psychē", meaning: "mind, soul", hook: "psychology = study of the mind" },
  somn: { origin: "Latin somnus", meaning: "sleep", hook: "insomnia = not sleeping (as in hora somni)" },
  hypn: { origin: "Greek hypnos", meaning: "sleep", hook: "hypnotic = sleep-inducing" },
  esthesi: { origin: "Greek aisthēsis", meaning: "feeling, sensation", hook: "anesthesia = without feeling" },
  phas: { origin: "Greek phasis", meaning: "speech", hook: "aphasia = loss of speech" },
  plegia: { origin: "Greek plēgē", meaning: "stroke, paralysis", hook: "paraplegia = paralysis of the lower body" },

  // ── Head, senses, mouth ─────────────────────────────────────────
  opt: { origin: "Greek optikos", meaning: "sight", hook: "optometrist = eye-measurer" },
  kerat: { origin: "Greek keras, keratos", meaning: "horn; cornea", hook: "keratitis = inflamed cornea" },
  blephar: { origin: "Greek blepharon", meaning: "eyelid", hook: "blepharitis = inflamed eyelids" },
  aur: { origin: "Latin auris", meaning: "ear", hook: "aural = of the ear (as in AU, AD, AS)" },
  rhin: { origin: "Greek rhis, rhinos", meaning: "nose", hook: "rhinoceros = nose-horn" },
  nas: { origin: "Latin nasus", meaning: "nose", hook: "nasal = of the nose" },
  stomat: { origin: "Greek stoma, stomatos", meaning: "mouth", hook: "stomatitis = mouth sores" },
  gloss: { origin: "Greek glōssa", meaning: "tongue", hook: "glossary = a list of words (tongue = language)" },
  lingu: { origin: "Latin lingua", meaning: "tongue", hook: "sublingual = under the tongue (as in SL)" },
  dent: { origin: "Latin dens, dentis", meaning: "tooth", hook: "dentist = tooth doctor" },
  odont: { origin: "Greek odous, odontos", meaning: "tooth", hook: "orthodontist = straight-teeth doctor" },
  laryng: { origin: "Greek larynx, laryngos", meaning: "voice box", hook: "laryngitis = losing your voice" },
  pharyng: { origin: "Greek pharynx, pharyngos", meaning: "throat", hook: "pharyngitis = sore throat" },

  // ── Chest, heart, lungs ─────────────────────────────────────────
  trache: { origin: "Greek tracheia", meaning: "windpipe", hook: "tracheotomy = cutting into the windpipe" },
  bronch: { origin: "Greek bronchos", meaning: "airway", hook: "bronchitis = inflamed airways" },
  pleur: { origin: "Greek pleura", meaning: "rib, side; lung lining", hook: "pleurisy = inflamed lung lining" },
  pector: { origin: "Latin pectus, pectoris", meaning: "chest", hook: "pectorals = chest muscles" },
  pneum: { origin: "Greek pneuma", meaning: "air, breath", hook: "pneumatic tires = air-filled tires" },
  spir: { origin: "Latin spirare", meaning: "to breathe", hook: "respiration = breathing again and again" },
  ox: { origin: "Greek oxys", meaning: "sharp; oxygen", hook: "hypoxia = too little oxygen" },
  coron: { origin: "Latin corona", meaning: "crown", hook: "coronary arteries circle the heart like a crown" },
  arteri: { origin: "Greek artēria", meaning: "artery", hook: "arteriosclerosis = hardened arteries" },
  ven: { origin: "Latin vena", meaning: "vein", hook: "intravenous = into a vein (as in IV)" },
  phleb: { origin: "Greek phleps, phlebos", meaning: "vein", hook: "phlebotomist = the person who draws your blood" },
  vas: { origin: "Latin vas", meaning: "vessel, duct", hook: "vase = a vessel" },
  rhythm: { origin: "Greek rhythmos", meaning: "regular beat", hook: "arrhythmia = an irregular heartbeat" },
  fibr: { origin: "Latin fibra", meaning: "fiber", hook: "fibrillation = quivering like loose fibers" },
  sten: { origin: "Greek stenos", meaning: "narrow", hook: "stenography = narrow (shorthand) writing" },
  ather: { origin: "Greek athērē", meaning: "gruel, paste", hook: "atherosclerosis = paste-hardening of arteries" },
  isch: { origin: "Greek ischein", meaning: "to hold back", hook: "ischemia = blood held back from tissue" },
  infarct: { origin: "Latin infarcire", meaning: "to stuff, cram", hook: "infarction = tissue death from a stuffed (blocked) vessel" },
  embol: { origin: "Greek embolos", meaning: "plug, wedge", hook: "embolism = a vessel plugged by a clot" },
  edema: { origin: "Greek oidēma", meaning: "swelling", hook: "edema = fluid swelling, often in the legs" },

  // ── Digestive system ────────────────────────────────────────────
  esophag: { origin: "Greek oisophagos", meaning: "gullet", hook: "esophagus = the food tube" },
  phag: { origin: "Greek phagein", meaning: "to eat, swallow", hook: "dysphagia = trouble swallowing" },
  peps: { origin: "Greek pepsis", meaning: "digestion", hook: "dyspepsia = indigestion" },
  col: { origin: "Greek kolon", meaning: "colon, large intestine", hook: "colitis = inflamed colon" },
  colon: { origin: "Greek kolon", meaning: "colon, large intestine", hook: "colonoscopy = looking inside the colon" },
  rect: { origin: "Latin rectus", meaning: "straight; rectum", hook: "rectum = the straight (last) part of the intestine" },
  proct: { origin: "Greek prōktos", meaning: "anus, rectum", hook: "proctologist = rectum doctor" },
  chol: { origin: "Greek cholē", meaning: "bile", hook: "cholesterol = bile-solid (first found in gallstones)" },
  cholecyst: { origin: "Greek cholē + kystis", meaning: "gallbladder", hook: "cholecystectomy = gallbladder removal" },
  pancreat: { origin: "Greek pankreas", meaning: "pancreas ('all flesh')", hook: "pancreatitis = inflamed pancreas" },
  splen: { origin: "Greek splēn", meaning: "spleen", hook: "splenectomy = spleen removal" },
  appendic: { origin: "Latin appendix, appendicis", meaning: "appendix ('something hung on')", hook: "appendicitis = inflamed appendix" },
  abdomin: { origin: "Latin abdomen", meaning: "belly", hook: "abdominal = of the belly" },
  lapar: { origin: "Greek lapara", meaning: "flank, abdomen", hook: "laparoscopy = looking into the belly" },
  emet: { origin: "Greek emein", meaning: "to vomit", hook: "antiemetic = anti-nausea medicine" },
  cirrh: { origin: "Greek kirrhos", meaning: "tawny, yellow-orange", hook: "cirrhosis = scarred (tawny) liver" },

  // ── Kidneys, urinary, reproductive ──────────────────────────────
  ur: { origin: "Greek ouron", meaning: "urine", hook: "urology = study of the urinary tract" },
  ureter: { origin: "Greek ourētēr", meaning: "ureter (kidney-to-bladder tube)", hook: "ureteral stone = a stone in the ureter" },
  urethr: { origin: "Greek ourēthra", meaning: "urethra (bladder outlet)", hook: "urethritis = inflamed urethra" },
  vesic: { origin: "Latin vesica", meaning: "bladder, blister", hook: "vesicle = a small blister" },
  calc: { origin: "Latin calx; calculus", meaning: "lime, limestone; small pebble", hook: "renal calculus = kidney stone ('little pebble')" },
  noct: { origin: "Latin nox, noctis", meaning: "night", hook: "nocturia = peeing at night (as in nocte)" },
  prostat: { origin: "Greek prostatēs", meaning: "prostate ('one standing before')", hook: "prostatitis = inflamed prostate" },
  orch: { origin: "Greek orchis", meaning: "testicle", hook: "orchid (named for the shape of its root)" },
  hyster: { origin: "Greek hystera", meaning: "womb, uterus", hook: "hysterectomy = removal of the uterus" },
  uter: { origin: "Latin uterus", meaning: "womb", hook: "uterine = of the uterus" },
  oophor: { origin: "Greek ōiophoros", meaning: "ovary ('egg-bearer')", hook: "oophorectomy = ovary removal" },
  ovari: { origin: "Latin ovarium (from ovum, egg)", meaning: "ovary", hook: "ovarian = of the ovary" },
  gynec: { origin: "Greek gynē, gynaikos", meaning: "woman", hook: "gynecologist = women's health doctor" },
  nat: { origin: "Latin natus", meaning: "born", hook: "prenatal = before birth" },
  mamm: { origin: "Latin mamma", meaning: "breast", hook: "mammogram = breast X-ray" },
  mast: { origin: "Greek mastos", meaning: "breast", hook: "mastectomy = breast removal" },

  // ── Bones, muscles, limbs ───────────────────────────────────────
  my: { origin: "Greek mys, myos", meaning: "muscle", hook: "myalgia = muscle pain" },
  muscul: { origin: "Latin musculus", meaning: "muscle ('little mouse')", hook: "a flexed muscle looks like a mouse under the skin" },
  tendin: { origin: "Latin tendo, tendinis", meaning: "tendon", hook: "tendinitis = inflamed tendon" },
  chondr: { origin: "Greek chondros", meaning: "cartilage", hook: "hypochondriac: once 'under the rib cartilage', where gloom was thought to live" },
  oss: { origin: "Latin os, ossis", meaning: "bone", hook: "ossify = turn into bone" },
  myel: { origin: "Greek myelos", meaning: "marrow; spinal cord", hook: "myeloma = cancer of bone-marrow cells" },
  spondyl: { origin: "Greek spondylos", meaning: "vertebra", hook: "spondylitis = inflamed spine joints" },
  vertebr: { origin: "Latin vertebra", meaning: "spine bone ('joint, turning point')", hook: "vertebrate = an animal with a backbone" },
  cost: { origin: "Latin costa", meaning: "rib", hook: "intercostal = between the ribs" },
  carp: { origin: "Greek karpos", meaning: "wrist", hook: "carpal tunnel = the wrist tunnel" },
  brachi: { origin: "Latin bracchium", meaning: "arm", hook: "brachial artery = the main arm artery" },
  femor: { origin: "Latin femur, femoris", meaning: "thigh", hook: "femoral = of the thigh" },
  dactyl: { origin: "Greek daktylos", meaning: "finger, toe", hook: "pterodactyl = wing-finger" },
  pod: { origin: "Greek pous, podos", meaning: "foot", hook: "podiatrist = foot doctor" },
  ped: {
    origin: "Greek pais, paidos (child) or Latin pes, pedis (foot)",
    meaning: "child or foot, depending on the word",
    hook: "pediatrician = child doctor; pedal = for the foot",
  },
  malacia: { origin: "Greek malakia", meaning: "softening", hook: "osteomalacia = softened bones" },

  // ── Blood, cells, glands ────────────────────────────────────────
  cyt: { origin: "Greek kytos", meaning: "cell ('hollow vessel')", hook: "cytology = study of cells" },
  cyte: { origin: "Greek kytos", meaning: "cell", hook: "lymphocyte = a white blood cell" },
  erythr: { origin: "Greek erythros", meaning: "red", hook: "erythrocyte = red blood cell" },
  leuk: { origin: "Greek leukos", meaning: "white", hook: "leukemia = white-blood-cell cancer" },
  cyan: { origin: "Greek kyanos", meaning: "dark blue", hook: "cyan ink; cyanosis = bluish skin from low oxygen" },
  melan: { origin: "Greek melas, melanos", meaning: "black, dark", hook: "melanoma = a dark skin cancer" },
  lymph: { origin: "Latin lympha", meaning: "clear water", hook: "lymph nodes filter clear lymph fluid" },
  aden: { origin: "Greek adēn", meaning: "gland", hook: "adenoids = gland-like tissue in the throat" },
  thyr: { origin: "Greek thyreos", meaning: "shield", hook: "thyroid = shield-shaped gland" },
  adren: { origin: "Latin ad + renes", meaning: "near the kidneys", hook: "adrenaline comes from glands on top of the kidneys" },
  coagul: { origin: "Latin coagulare", meaning: "to curdle, clot", hook: "anticoagulant = blood thinner" },
  lip: { origin: "Greek lipos", meaning: "fat", hook: "liposuction = fat removal" },
  adip: { origin: "Latin adeps, adipis", meaning: "fat", hook: "adipose tissue = body fat" },
  sarc: { origin: "Greek sarx, sarkos", meaning: "flesh", hook: "sarcasm = 'tearing flesh' with words" },
  scler: { origin: "Greek sklēros", meaning: "hard", hook: "sclerosis = hardening" },
  xer: { origin: "Greek xēros", meaning: "dry", hook: "Xerox = dry copying" },
  diabet: { origin: "Greek diabētēs", meaning: "siphon, passing through", hook: "diabetes: early doctors saw fluid 'pass through' the body" },
  mellit: { origin: "Latin mellitus", meaning: "sweetened with honey", hook: "diabetes mellitus: the urine tasted sweet" },

  // ── Infection, fever, drugs ─────────────────────────────────────
  sept: { origin: "Greek sēptikos", meaning: "rotting", hook: "antiseptic = against rotting (germs)" },
  bacter: { origin: "Greek baktērion", meaning: "little staff, rod", hook: "bacteria were named for their rod shape" },
  vir: { origin: "Latin virus", meaning: "poison, slime", hook: "antiviral = against viruses" },
  myc: { origin: "Greek mykēs", meaning: "fungus", hook: "mycology = study of mushrooms" },
  tox: { origin: "Greek toxikon", meaning: "poison (for arrows)", hook: "toxic = poisonous" },
  pyr: { origin: "Greek pyr", meaning: "fire; fever", hook: "antipyretic = fever reducer" },
  febr: { origin: "Latin febris", meaning: "fever", hook: "febrile = feverish" },
  therm: { origin: "Greek thermē", meaning: "heat", hook: "thermometer = heat-measurer" },
  tuss: { origin: "Latin tussis", meaning: "cough", hook: "antitussive = cough medicine" },
  prurit: { origin: "Latin prurire", meaning: "to itch", hook: "antipruritic = anti-itch" },
  algesi: { origin: "Greek algēsis", meaning: "sense of pain", hook: "analgesic = painkiller ('without pain')" },
  dynia: { origin: "Greek odynē", meaning: "pain", hook: "pleurodynia = chest-wall pain" },
  narc: { origin: "Greek narkē", meaning: "numbness", hook: "narcotic = numbing drug" },
  sed: { origin: "Latin sedare", meaning: "to calm, settle", hook: "sedative = calming medicine" },
  hist: { origin: "Greek histos", meaning: "tissue ('web')", hook: "antihistamine = allergy medicine (histamine is a tissue chemical)" },
  pharmac: { origin: "Greek pharmakon", meaning: "drug; poison", hook: "pharmacy = drug store" },
  dos: { origin: "Greek dosis", meaning: "a giving", hook: "dose = how much you're given" },
  dips: { origin: "Greek dipsa", meaning: "thirst", hook: "polydipsia = extreme thirst" },

  // ── Time, course, diagnosis ─────────────────────────────────────
  chron: { origin: "Greek chronos", meaning: "time", hook: "chronic = lasting a long time" },
  acu: { origin: "Latin acutus", meaning: "sharp", hook: "acute = sudden and sharp" },
  gnos: { origin: "Greek gnōsis", meaning: "knowledge", hook: "diagnosis = knowing through; prognosis = knowing beforehand" },
  bio: { origin: "Greek bios", meaning: "life", hook: "biology = study of life" },
  opsy: { origin: "Greek opsis", meaning: "sight, viewing", hook: "biopsy = viewing living tissue" },
  somat: { origin: "Greek sōma, sōmatos", meaning: "body", hook: "psychosomatic = mind-body" },
  path: { origin: "Greek pathos", meaning: "suffering, disease", hook: "pathology = study of disease" },
  pathy: { origin: "Greek pathos", meaning: "disease of", hook: "neuropathy = nerve disease" },
  therap: { origin: "Greek therapeia", meaning: "healing, service", hook: "therapy = treatment" },
  iatr: { origin: "Greek iatros", meaning: "healer, doctor", hook: "pediatrician = child-healer" },
  gen: { origin: "Greek genesis", meaning: "origin, producing", hook: "carcinogen = cancer-producer" },
  genic: { origin: "Greek genesis", meaning: "producing, caused by", hook: "carcinogenic = cancer-causing" },
  troph: { origin: "Greek trophē", meaning: "nourishment", hook: "atrophy = wasting away ('no nourishment')" },
  trophy: { origin: "Greek trophē", meaning: "nourishment, growth", hook: "hypertrophy = overgrowth" },

  // ── Procedures and tests (suffixes) ─────────────────────────────
  ostomy: { origin: "Greek stoma", meaning: "creating an opening", hook: "colostomy = an opening from the colon" },
  stomy: { origin: "Greek stoma", meaning: "creating an opening", hook: "tracheostomy = an opening in the windpipe" },
  tomy: { origin: "Greek tomē", meaning: "cutting", hook: "lobotomy = cutting a lobe" },
  plasty: { origin: "Greek plastos", meaning: "shaping, repair", hook: "rhinoplasty = nose job" },
  scope: { origin: "Greek skopein", meaning: "instrument for looking", hook: "microscope = small-looker" },
  gram: { origin: "Greek gramma", meaning: "a record, writing", hook: "telegram = far-writing" },
  graphy: { origin: "Greek graphein", meaning: "process of recording", hook: "photography = light-writing" },
  meter: { origin: "Greek metron", meaning: "measure", hook: "thermometer = heat-measurer" },
  logy: { origin: "Greek logos", meaning: "study of", hook: "biology = study of life" },
  logist: { origin: "Greek logos", meaning: "specialist in", hook: "cardiologist = heart specialist" },
  lysis: { origin: "Greek lysis", meaning: "loosening, breaking down", hook: "dialysis = filtering blood 'through'" },
  stasis: { origin: "Greek stasis", meaning: "standing still, stopping", hook: "hemostasis = stopping bleeding" },

  // ── Conditions (suffixes) ───────────────────────────────────────
  oma: { origin: "Greek -ōma", meaning: "tumor, mass", hook: "melanoma = dark tumor" },
  penia: { origin: "Greek penia", meaning: "lack, poverty", hook: "neutropenia = too few neutrophils" },
  rrhea: { origin: "Greek rhoia", meaning: "flow, discharge", hook: "diarrhea = flowing through" },
  rrhage: { origin: "Greek rhēgnynai", meaning: "bursting forth", hook: "hemorrhage = blood bursting out" },
  megaly: { origin: "Greek megas, megalou", meaning: "enlargement", hook: "cardiomegaly = enlarged heart" },
  ptosis: { origin: "Greek ptōsis", meaning: "falling, drooping", hook: "eyelid ptosis = a droopy eyelid" },
  ia: { origin: "Greek/Latin -ia", meaning: "condition", hook: "pneumonia = lung condition" },
  ism: { origin: "Greek -ismos", meaning: "condition, state", hook: "hypothyroidism = underactive-thyroid state" },
  oid: { origin: "Greek eidos", meaning: "resembling, shaped like", hook: "thyroid = shield-shaped" },
  ic: { origin: "Greek -ikos", meaning: "relating to", hook: "gastric = relating to the stomach" },
  ous: { origin: "Latin -osus", meaning: "full of, having", hook: "cancerous = having cancer" },
  ar: { origin: "Latin -aris", meaning: "relating to", hook: "muscular = relating to muscle" },
  ary: { origin: "Latin -arius", meaning: "relating to", hook: "pulmonary = relating to the lungs" },
  ive: { origin: "Latin -ivus", meaning: "tending to, doing", hook: "sedative = tending to calm" },

  // ── Prefixes ────────────────────────────────────────────────────
  a: { origin: "Greek a-", meaning: "not, without", hook: "apnea = not breathing" },
  an: { origin: "Greek an-", meaning: "not, without", hook: "anemia = lacking blood" },
  anti: { origin: "Greek anti", meaning: "against", hook: "antibiotic = against (bacterial) life" },
  ante: { origin: "Latin ante", meaning: "before", hook: "antenatal = before birth (as in ante cibum)" },
  pre: { origin: "Latin prae", meaning: "before", hook: "prenatal = before birth" },
  post: { origin: "Latin post", meaning: "after", hook: "postoperative = after surgery (as in post cibum)" },
  peri: { origin: "Greek peri", meaning: "around", hook: "perimeter = measure around" },
  circum: { origin: "Latin circum", meaning: "around", hook: "circumference = around the circle" },
  para: { origin: "Greek para", meaning: "beside; abnormal", hook: "paramedic = one who works beside doctors" },
  epi: { origin: "Greek epi", meaning: "upon, over", hook: "epidermis = the skin's top layer" },
  endo: { origin: "Greek endon", meaning: "within", hook: "endoscopy = looking within" },
  ex: { origin: "Latin/Greek ex", meaning: "out of", hook: "exhale = breathe out" },
  exo: { origin: "Greek exō", meaning: "outside", hook: "exoskeleton = outside skeleton" },
  extra: { origin: "Latin extra", meaning: "outside, beyond", hook: "extraordinary = beyond ordinary" },
  trans: { origin: "Latin trans", meaning: "across, through", hook: "transfusion = pouring across" },
  supra: { origin: "Latin supra", meaning: "above", hook: "suprarenal = above the kidney" },
  infra: { origin: "Latin infra", meaning: "below", hook: "infrared = below red" },
  retro: { origin: "Latin retro", meaning: "backward, behind", hook: "retrograde = moving backward" },
  contra: { origin: "Latin contra", meaning: "against", hook: "contraindication = a reason against a treatment" },
  ab: { origin: "Latin ab", meaning: "away from", hook: "abduct = lead away" },
  ad: { origin: "Latin ad", meaning: "toward, near", hook: "adrenal = near the kidneys" },
  de: { origin: "Latin de", meaning: "down, away, removing", hook: "dehydration = water removed" },
  dia: { origin: "Greek dia", meaning: "through, across", hook: "diameter = measure across" },
  syn: { origin: "Greek syn", meaning: "together, with", hook: "syndrome = symptoms that 'run together'" },
  sym: { origin: "Greek syn (sym- before b, m, p)", meaning: "together, with", hook: "symptom = what 'falls together' with an illness" },
  eu: { origin: "Greek eu", meaning: "good, normal", hook: "euphoria = feeling good" },
  mal: { origin: "Latin malus", meaning: "bad", hook: "malnutrition = bad nutrition" },
  neo: { origin: "Greek neos", meaning: "new", hook: "neonatal = newborn" },
  pan: { origin: "Greek pan", meaning: "all", hook: "pandemic = (affecting) all people" },
  iso: { origin: "Greek isos", meaning: "equal", hook: "isometric = equal measure" },
  hemi: { origin: "Greek hēmi-", meaning: "half", hook: "hemisphere = half a sphere" },
  semi: { origin: "Latin semi-", meaning: "half", hook: "semicircle = half circle (as in ss, semis)" },
  uni: { origin: "Latin unus", meaning: "one", hook: "unicycle = one wheel" },
  mono: { origin: "Greek monos", meaning: "one, single", hook: "monologue = one speaker" },
  di: { origin: "Greek di-", meaning: "two, twice", hook: "dioxide = two oxygens" },
  tri: { origin: "Latin/Greek tri-", meaning: "three", hook: "tricycle = three wheels (as in ter in die)" },
  quadr: { origin: "Latin quattuor", meaning: "four", hook: "quadriceps = four-headed muscle (as in quater in die)" },
  poly: { origin: "Greek polys", meaning: "many, much", hook: "polygon = many angles" },
  olig: { origin: "Greek oligos", meaning: "few, little", hook: "oligarchy = rule by the few" },
  micro: { origin: "Greek mikros", meaning: "small", hook: "microscope = small-looker" },
  macro: { origin: "Greek makros", meaning: "large, long", hook: "macroeconomics = the big-picture economy" },
  mega: { origin: "Greek megas", meaning: "large", hook: "megaphone = large voice" },
};

export function normalizeAbbrev(text: string): string {
  return text.toUpperCase().replace(/[^A-Z0-9]/g, ""); // "Rx#", "D/C", "q.i.d." all match
}

export function normalizeRoot(text: string): string {
  return text.toLowerCase().replace(/[-\s]/g, "");
}

// Handles the "every N hours" family (q4h, q6h, q12h...) without listing each one.
// Latin counts the hour with an ordinal: q6h = quaque sexta hora, "at every sixth hour".
const EVERY_N_HOURS = /^Q(\d{1,2})H$/;
const ORDINAL_HOURS: Record<string, [latin: string, english: string]> = {
  "1": ["prima", "first"],
  "2": ["secunda", "second"],
  "3": ["tertia", "third"],
  "4": ["quarta", "fourth"],
  "6": ["sexta", "sixth"],
  "8": ["octava", "eighth"],
  "12": ["duodecima", "twelfth"],
  "24": ["vicesima quarta", "twenty-fourth"],
};

// "draft" is true when the match came from dictionary-drafts.ts (not yet reviewed).
export type Found<T> = T & { draft: boolean };

export function lookupAbbreviation(text: string): Found<AbbreviationEntry> | undefined {
  const key = normalizeAbbrev(text);
  const match = key.match(EVERY_N_HOURS);
  if (match) {
    const n = match[1];
    const ordinal = ORDINAL_HOURS[n];
    if (!ordinal) return undefined;
    const [latin, english] = ordinal;
    return {
      expansion: `quaque ${latin} hora`,
      literal: n === "1" ? "at every hour" : `at every ${english} hour`,
      plain: n === "1" ? "every hour" : `every ${n} hours`,
      draft: false,
    };
  }
  return find(key, ABBREVIATIONS, DRAFT_ABBREVIATIONS);
}

// Medical words join roots with a connecting "o" (nephr-o-lith-iasis), so "hydro-" should match "hydr".
export function lookupRoot(text: string): Found<RootEntry> | undefined {
  const key = rootKey(text);
  return key ? find(key, ROOTS, DRAFT_ROOTS) : undefined;
}

// The dictionary key a root matches ("hydro-" → "hydr"), or undefined if it isn't in the dictionary.
export function rootKey(text: string): string | undefined {
  const key = normalizeRoot(text);
  const known = (k: string) => k in ROOTS || k in DRAFT_ROOTS;
  if (known(key)) return key;
  if (key.endsWith("o") && known(key.slice(0, -1))) return key.slice(0, -1);
  return undefined;
}

function find<T>(key: string, reviewed: Record<string, T>, drafts: Record<string, T>): Found<T> | undefined {
  if (key in reviewed) return { ...reviewed[key], draft: false };
  if (key in drafts) return { ...drafts[key], draft: true };
  return undefined;
}
