// Real medical words built from dictionary roots, for "decode it yourself" review questions.
// Each root key must exist in ROOTS (lib/dictionary.ts); lib/quiz.test.ts checks this.

export type Word = { word: string; roots: string[]; meaning: string };

export const WORDS: Word[] = [
  // -itis: inflammation
  { word: "nephritis", roots: ["nephr", "itis"], meaning: "inflammation of the kidneys" },
  { word: "hepatitis", roots: ["hepat", "itis"], meaning: "inflammation of the liver" },
  { word: "arthritis", roots: ["arthr", "itis"], meaning: "inflammation of the joints" },
  { word: "gastritis", roots: ["gastr", "itis"], meaning: "inflammation of the stomach lining" },
  { word: "dermatitis", roots: ["dermat", "itis"], meaning: "inflammation of the skin (a rash)" },
  { word: "bronchitis", roots: ["bronch", "itis"], meaning: "inflammation of the airways in the lungs" },
  { word: "laryngitis", roots: ["laryng", "itis"], meaning: "inflammation of the voice box" },
  { word: "pharyngitis", roots: ["pharyng", "itis"], meaning: "inflammation of the throat (a sore throat)" },
  { word: "appendicitis", roots: ["appendic", "itis"], meaning: "inflammation of the appendix" },
  { word: "colitis", roots: ["col", "itis"], meaning: "inflammation of the colon" },
  { word: "pancreatitis", roots: ["pancreat", "itis"], meaning: "inflammation of the pancreas" },
  { word: "encephalitis", roots: ["encephal", "itis"], meaning: "inflammation of the brain" },
  { word: "phlebitis", roots: ["phleb", "itis"], meaning: "inflammation of a vein" },
  { word: "cystitis", roots: ["cyst", "itis"], meaning: "inflammation of the bladder" },
  { word: "otitis", roots: ["ot", "itis"], meaning: "inflammation of the ear (an ear infection)" },
  { word: "rhinitis", roots: ["rhin", "itis"], meaning: "inflammation of the nose (a runny or stuffy nose)" },
  { word: "gastroenteritis", roots: ["gastr", "enter", "itis"], meaning: "inflammation of the stomach and intestines (stomach flu)" },
  { word: "pericarditis", roots: ["peri", "cardi", "itis"], meaning: "inflammation of the sac around the heart" },
  { word: "endocarditis", roots: ["endo", "cardi", "itis"], meaning: "inflammation of the heart's inner lining" },

  // stones, enlargement, softening
  { word: "nephrolithiasis", roots: ["nephr", "lith", "iasis"], meaning: "kidney stones" },
  { word: "cholelithiasis", roots: ["chol", "lith", "iasis"], meaning: "gallstones" },
  { word: "hepatomegaly", roots: ["hepat", "megaly"], meaning: "an enlarged liver" },
  { word: "cardiomegaly", roots: ["cardi", "megaly"], meaning: "an enlarged heart" },
  { word: "splenomegaly", roots: ["splen", "megaly"], meaning: "an enlarged spleen" },
  { word: "osteomalacia", roots: ["oste", "malacia"], meaning: "softening of the bones" },

  // surgery and procedures
  { word: "nephrectomy", roots: ["nephr", "ectomy"], meaning: "surgery to remove a kidney" },
  { word: "hysterectomy", roots: ["hyster", "ectomy"], meaning: "surgery to remove the uterus" },
  { word: "mastectomy", roots: ["mast", "ectomy"], meaning: "surgery to remove a breast" },
  { word: "cholecystectomy", roots: ["cholecyst", "ectomy"], meaning: "surgery to remove the gallbladder" },
  { word: "splenectomy", roots: ["splen", "ectomy"], meaning: "surgery to remove the spleen" },
  { word: "thyroidectomy", roots: ["thyr", "oid", "ectomy"], meaning: "surgery to remove the thyroid" },
  { word: "tracheotomy", roots: ["trache", "otomy"], meaning: "a surgical cut into the windpipe" },
  { word: "craniotomy", roots: ["crani", "otomy"], meaning: "surgery that opens the skull" },
  { word: "tracheostomy", roots: ["trache", "ostomy"], meaning: "an opening made in the windpipe for breathing" },
  { word: "colostomy", roots: ["col", "ostomy"], meaning: "an opening from the colon through the belly wall" },
  { word: "rhinoplasty", roots: ["rhin", "plasty"], meaning: "surgery to reshape the nose" },
  { word: "angioplasty", roots: ["angi", "plasty"], meaning: "a procedure to reopen a narrowed blood vessel" },
  { word: "colonoscopy", roots: ["colon", "scopy"], meaning: "looking inside the colon with a camera" },
  { word: "bronchoscopy", roots: ["bronch", "scopy"], meaning: "looking inside the lung airways with a camera" },
  { word: "cystoscopy", roots: ["cyst", "scopy"], meaning: "looking inside the bladder with a camera" },
  { word: "endoscopy", roots: ["endo", "scopy"], meaning: "looking inside the body with a camera" },
  { word: "mammogram", roots: ["mamm", "gram"], meaning: "an X-ray image of the breast" },

  // specialists
  { word: "cardiologist", roots: ["cardi", "logist"], meaning: "a heart specialist" },
  { word: "nephrologist", roots: ["nephr", "logist"], meaning: "a kidney specialist" },
  { word: "neurologist", roots: ["neur", "logist"], meaning: "a brain and nerve specialist" },
  { word: "oncologist", roots: ["onc", "logist"], meaning: "a cancer specialist" },
  { word: "hematology", roots: ["hemat", "logy"], meaning: "the study of blood and blood diseases" },
  { word: "psychiatry", roots: ["psych", "iatr"], meaning: "the branch of medicine that treats mental illness" },

  // pain
  { word: "neuralgia", roots: ["neur", "algia"], meaning: "nerve pain" },
  { word: "myalgia", roots: ["my", "algia"], meaning: "muscle pain" },
  { word: "arthralgia", roots: ["arthr", "algia"], meaning: "joint pain" },
  { word: "cephalalgia", roots: ["cephal", "algia"], meaning: "a headache" },

  // urine, thirst, swallowing, speech, breathing, heart rate
  { word: "hematuria", roots: ["hemat", "uria"], meaning: "blood in the urine" },
  { word: "polyuria", roots: ["poly", "uria"], meaning: "peeing much more than usual" },
  { word: "nocturia", roots: ["noct", "uria"], meaning: "waking up at night to pee" },
  { word: "polydipsia", roots: ["poly", "dips", "ia"], meaning: "extreme thirst" },
  { word: "dysphagia", roots: ["dys", "phag", "ia"], meaning: "trouble swallowing" },
  { word: "aphasia", roots: ["a", "phas", "ia"], meaning: "loss of the ability to speak or understand language" },
  { word: "dyspnea", roots: ["dys", "pnea"], meaning: "shortness of breath" },
  { word: "apnea", roots: ["a", "pnea"], meaning: "a pause in breathing" },
  { word: "tachypnea", roots: ["tachy", "pnea"], meaning: "abnormally fast breathing" },
  { word: "tachycardia", roots: ["tachy", "cardi", "ia"], meaning: "a fast heart rate" },
  { word: "bradycardia", roots: ["brady", "cardi", "ia"], meaning: "a slow heart rate" },

  // blood
  { word: "hyperglycemia", roots: ["hyper", "glyc", "emia"], meaning: "high blood sugar" },
  { word: "hypoglycemia", roots: ["hypo", "glyc", "emia"], meaning: "low blood sugar" },
  { word: "hyperlipidemia", roots: ["hyper", "lip", "emia"], meaning: "high levels of fat (like cholesterol) in the blood" },
  { word: "anemia", roots: ["an", "emia"], meaning: "too few healthy red blood cells" },
  { word: "leukemia", roots: ["leuk", "emia"], meaning: "cancer of the white blood cells" },
  { word: "leukopenia", roots: ["leuk", "penia"], meaning: "too few white blood cells" },
  { word: "erythrocyte", roots: ["erythr", "cyte"], meaning: "a red blood cell" },
  { word: "leukocyte", roots: ["leuk", "cyte"], meaning: "a white blood cell" },
  { word: "hemorrhage", roots: ["hem", "rrhage"], meaning: "heavy bleeding" },
  { word: "hematoma", roots: ["hemat", "oma"], meaning: "a pocket of pooled blood under the skin, like a deep bruise" },
  { word: "hypertension", roots: ["hyper", "tension"], meaning: "high blood pressure" },
  { word: "hypotension", roots: ["hypo", "tension"], meaning: "low blood pressure" },

  // conditions
  { word: "thrombosis", roots: ["thromb", "osis"], meaning: "a blood clot forming in a vessel" },
  { word: "arteriosclerosis", roots: ["arteri", "scler", "osis"], meaning: "hardening of the arteries" },
  { word: "atherosclerosis", roots: ["ather", "scler", "osis"], meaning: "fatty plaque building up inside the arteries" },
  { word: "cyanosis", roots: ["cyan", "osis"], meaning: "bluish skin from too little oxygen" },
  { word: "hydronephrosis", roots: ["hydr", "nephr", "osis"], meaning: "a kidney swollen with urine that can't drain" },
  { word: "neuropathy", roots: ["neur", "pathy"], meaning: "nerve damage" },
  { word: "cardiomyopathy", roots: ["cardi", "my", "pathy"], meaning: "disease of the heart muscle" },
  { word: "hypothyroidism", roots: ["hypo", "thyr", "oid", "ism"], meaning: "an underactive thyroid" },
  { word: "diarrhea", roots: ["dia", "rrhea"], meaning: "loose, watery stools" },

  // tumors
  { word: "carcinoma", roots: ["carcin", "oma"], meaning: "a cancer that starts in the lining of organs or skin" },
  { word: "lymphoma", roots: ["lymph", "oma"], meaning: "a cancer of the lymph system" },
  { word: "melanoma", roots: ["melan", "oma"], meaning: "a skin cancer that starts in pigment cells" },
  { word: "lipoma", roots: ["lip", "oma"], meaning: "a harmless fatty lump" },
  { word: "adenoma", roots: ["aden", "oma"], meaning: "a (usually harmless) tumor of a gland" },

  // directions and routes
  { word: "bilateral", roots: ["bi", "later", "al"], meaning: "on both sides" },
  { word: "intravenous", roots: ["intra", "ven", "ous"], meaning: "into a vein" },
  { word: "subcutaneous", roots: ["sub", "cutane", "ous"], meaning: "under the skin" },
  { word: "intramuscular", roots: ["intra", "muscul", "ar"], meaning: "into a muscle" },
  { word: "sublingual", roots: ["sub", "lingu", "al"], meaning: "under the tongue" },
  { word: "cerebrovascular", roots: ["cerebr", "vascul", "ar"], meaning: "relating to the brain's blood vessels" },

  // medicines
  { word: "antipyretic", roots: ["anti", "pyr", "ic"], meaning: "a fever reducer" },
  { word: "antiemetic", roots: ["anti", "emet", "ic"], meaning: "an anti-nausea medicine" },
  { word: "antitussive", roots: ["anti", "tuss", "ive"], meaning: "a cough medicine" },
];
