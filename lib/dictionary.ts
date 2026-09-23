// Loquitur's hand-checked reference data.
// The AI suggests explanations; these entries are what we trust to confirm them.
// This is a starter set. Growing it to about 60 abbreviations and 150 roots is the
// week-4 milestone, and it's where the Latin expertise in this project lives.

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

// Keys are uppercase with periods, slashes and spaces removed (see normalizeAbbrev).
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
};

export function normalizeAbbrev(text: string): string {
  return text.toUpperCase().replace(/[.\s/]/g, "");
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

export function lookupAbbreviation(text: string): AbbreviationEntry | undefined {
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
    };
  }
  return ABBREVIATIONS[key];
}

// Medical words join roots with a connecting "o" (nephr-o-lith-iasis), so "hydro-" should match "hydr".
export function lookupRoot(text: string): RootEntry | undefined {
  const key = normalizeRoot(text);
  return ROOTS[key] ?? (key.endsWith("o") ? ROOTS[key.slice(0, -1)] : undefined);
}
