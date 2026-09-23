import { z } from "zod";

// What Claude must return. Kept flat and explicit so the output is easy to verify.
export const RootSchema = z.object({
  root: z.string().describe('The word part as written in medicine, e.g. "nephr-", "-itis", "bi-"'),
  origin: z.string().describe('Source word and language, e.g. "Greek nephros"'),
  meaning: z.string().describe('Literal meaning, e.g. "kidney"'),
});

export const TermSchema = z.object({
  text: z.string().describe("The term exactly as it appears in the document, same spelling and case"),
  kind: z.enum(["abbreviation", "medical_term", "drug"]),
  plain: z.string().describe("Plain-English meaning in 25 words or fewer, at a 6th-grade reading level"),
  expansion: z
    .string()
    .nullable()
    .describe('For abbreviations, the full original phrase, e.g. "bis in die". Otherwise null.'),
  roots: z.array(RootSchema).describe("Latin/Greek word parts. Empty for drug names and abbreviations."),
});

export const DecodeSchema = z.object({
  summary: z
    .string()
    .describe("2-3 plain-English sentences saying what the document tells the patient. No advice beyond the document."),
  terms: z.array(TermSchema),
});

// Photos need one extra field: the text Claude read from the image, so it can be highlighted.
export const PhotoDecodeSchema = DecodeSchema.extend({
  transcript: z
    .string()
    .describe(
      "All text in the photo, copied exactly as printed, keeping line breaks. Empty string if there is no readable text.",
    ),
});

export type Root = z.infer<typeof RootSchema>;
export type Term = z.infer<typeof TermSchema>;
export type Decoded = z.infer<typeof DecodeSchema>;

// After our own dictionary checks the AI's answer.
// verified: every part matched a reviewed dictionary entry
// draft: every part matched, but at least one entry is still awaiting review
export type Verification = "verified" | "draft" | "partial" | "unverified";

export type VerifiedRoot = Root & { verified: boolean; draft?: boolean; hook?: string };

export type VerifiedTerm = Omit<Term, "roots"> & {
  roots: VerifiedRoot[];
  status: Verification;
  warning?: string; // set when the abbreviation is on the ISMP error-prone list
  literal?: string; // word-for-word translation of the Latin expansion
};

export type DecodeResponse = {
  summary: string;
  terms: VerifiedTerm[];
  transcript?: string; // only for photos
};

// Image formats the Claude API accepts.
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
export type ImageType = (typeof IMAGE_TYPES)[number];

export type DecodeInput =
  | { kind: "text"; text: string }
  | { kind: "image"; data: string; mediaType: ImageType }; // data is base64 without the data: prefix
