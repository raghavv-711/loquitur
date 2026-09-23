// Confirms drug names against the FDA's public drug label database (openFDA).
// Docs: https://open.fda.gov/apis/drug/label/
//
// Two small requests per drug instead of downloading many full labels (each label is ~100 KB):
//   1. ask which ingredient names match the drug ("count" query, ~1 KB)
//   2. fetch one label for the best single-ingredient match

const BASE = "https://api.fda.gov/drug/label.json";
const TIMEOUT_MS = 5000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE = 500;

export type FdaInfo = {
  genericName: string; // e.g. "METFORMIN HYDROCHLORIDE"
  brandName: string | null; // set when the label's brand differs from the generic name
  usedFor: string | null; // first sentence of the label's purpose / indications
  labelUrl: string | null; // full label on DailyMed (National Library of Medicine)
};

const cache = new Map<string, { value: FdaInfo | null; expires: number }>();

// Words on labels that describe the form or salt, not the drug itself.
const NOISE =
  /\b(hcl|hydrochloride|hbr|hydrobromide|sodium|potassium|calcium|sulfate|er|xr|sr|xl|cr|dr|odt|ec|tab|tabs|tablets?|cap|caps|capsules?|oral|solution|suspension|mg|mcg|ml|g|usp)\b/g;

// "METFORMIN HCL 500 MG TAB" → "metformin"; "Dextromethorphan (antitussive)" → "dextromethorphan"
export function cleanDrugName(text: string): string {
  return text
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/[\d.,/%]+/g, " ")
    .replace(NOISE, " ")
    .replace(/[^a-z\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .slice(0, 3)
    .join(" ");
}

export async function lookupDrug(text: string): Promise<FdaInfo | null> {
  const name = cleanDrugName(text);
  if (name.length < 3) return null;

  const cached = cache.get(name);
  if (cached && cached.expires > Date.now()) return cached.value;

  let value: FdaInfo | null = null;
  try {
    value = await fetchDrug(name);
  } catch {
    return null; // network trouble: treat as unverified, but don't cache the failure
  }

  if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value!);
  cache.set(name, { value, expires: Date.now() + CACHE_TTL_MS });
  return value;
}

async function fetchDrug(name: string): Promise<FdaInfo | null> {
  const phrase = `"${name}"`;
  const counts = await query<{ term: string; count: number }>(
    `search=openfda.generic_name:${phrase}+openfda.brand_name:${phrase}&count=openfda.generic_name.exact&limit=25`,
  );
  const generic = pickGeneric(name.toUpperCase(), counts);
  if (!generic) return null;

  // If the user's word was a brand (e.g. "Advil"), prefer that brand's label.
  const isBrand = !generic.includes(name.toUpperCase());
  const brandFilter = isBrand ? `+AND+openfda.brand_name:${phrase}` : "";
  const [label] =
    (await query<Label>(`search=openfda.generic_name.exact:"${generic}"${brandFilter}&limit=1`)) ??
    (await query<Label>(`search=openfda.generic_name.exact:"${generic}"&limit=1`)) ??
    [];
  if (!label) return { genericName: generic, brandName: null, usedFor: null, labelUrl: null };

  const brand = label.openfda?.brand_name?.[0] ?? null;
  const setId = label.set_id ?? label.openfda?.spl_set_id?.[0];
  return {
    genericName: generic,
    brandName: isBrand ? brand : null,
    usedFor: firstSentence(label.purpose?.[0] ?? label.indications_and_usage?.[0]),
    labelUrl: setId ? `https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=${setId}` : null,
  };
}

// Salt forms that follow the drug's name on labels: METFORMIN HYDROCHLORIDE, DEXTROMETHORPHAN HBR.
const SALT =
  /^(HCL|HYDROCHLORIDE|HBR|HYDROBROMIDE|SODIUM|POTASSIUM|CALCIUM|MAGNESIUM|SULFATE|CITRATE|MALEATE|TARTRATE|SUCCINATE|FUMARATE|MESYLATE|BESYLATE|ACETATE|PHOSPHATE|BROMIDE|CHLORIDE)( |$)/;

// Salts and esters: the listed ones, or any single word ending in -ATE/-IDE (FLUTICASONE PROPIONATE).
// "ADVIL PM" isn't a salt, so brand variants don't sneak through.
const isSalt = (rest: string) => SALT.test(rest) || /^[A-Z]+(ATE|IDE)$/.test(rest);

// Prefer single-ingredient products: the exact name, then its salt form,
// then the most common single ingredient (for brands: ADVIL → IBUPROFEN).
export function pickGeneric(name: string, counts: { term: string; count: number }[] | null): string | null {
  if (!counts?.length) return null;
  const single = counts.filter((c) => !/ AND |,/.test(c.term));
  return (
    single.find((c) => c.term === name)?.term ??
    single.find((c) => c.term.startsWith(name + " ") && isSalt(c.term.slice(name.length + 1)))?.term ??
    single.find((c) => !c.term.startsWith(name + " "))?.term ??
    null
  );
}

type Label = {
  set_id?: string;
  purpose?: string[];
  indications_and_usage?: string[];
  openfda?: { brand_name?: string[]; spl_set_id?: string[] };
};

async function query<T>(params: string): Promise<T[] | null> {
  const key = process.env.OPENFDA_API_KEY ? `&api_key=${process.env.OPENFDA_API_KEY}` : "";
  const res = await fetch(`${BASE}?${params}${key}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (res.status === 404) return null; // openFDA's way of saying "no matches"
  if (!res.ok) throw new Error(`openFDA ${res.status}`);
  const data = (await res.json()) as { results?: T[] };
  return data.results?.length ? data.results : null;
}

// Label sections start with headings and cross-references: "1 INDICATIONS AND USAGE ... ( 1 )".
export function firstSentence(raw: string | undefined): string | null {
  if (!raw) return null;
  let text = raw
    .replace(/\(\s*[\d.]+\s*\)/g, " ")
    .replace(/\[\s*see [^\]]*\]/gi, " ")
    .replace(/[\u200b\u00a0]/g, " ") // zero-width and non-breaking spaces
    .replace(/\s+/g, " ")
    .replace(/\s+([.,;:])/g, "$1")
    .trim();
  // Strip leading headings, which are sometimes repeated ("Purposes Purposes").
  const heading = /^(\d+(\.\d+)?\s*)?(indications\s*(and|&)\s*usage|purposes?|uses?)\b[:\s]*/i;
  while (heading.test(text)) text = text.replace(heading, "");
  // OTC labels sometimes repeat the whole phrase: "Pain reliever Pain reliever".
  const words = text.split(" ");
  const half = words.length / 2;
  if (Number.isInteger(half) && words.slice(0, half).join(" ") === words.slice(half).join(" ")) {
    text = words.slice(0, half).join(" ");
  }
  const sentence = text.match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? text;
  if (sentence.length <= 240) return sentence;
  return sentence.slice(0, 240).replace(/\s+\S*$/, "") + "…";
}
