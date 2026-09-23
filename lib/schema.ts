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

export type Root = z.infer<typeof RootSchema>;
export type Term = z.infer<typeof TermSchema>;
export type Decoded = z.infer<typeof DecodeSchema>;

// After our own dictionary checks the AI's answer.
export type Verification = "verified" | "partial" | "unverified";

export type VerifiedRoot = Root & { verified: boolean; hook?: string };

export type VerifiedTerm = Omit<Term, "roots"> & {
  roots: VerifiedRoot[];
  status: Verification;
  warning?: string; // set when the abbreviation is on the ISMP error-prone list
  literal?: string; // word-for-word translation of the Latin expansion
};

export type DecodeResponse = {
  summary: string;
  terms: VerifiedTerm[];
};
