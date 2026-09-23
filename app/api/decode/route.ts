import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { decodeDocument, DecodeRefusedError } from "@/lib/decode";
import { allowDecode, DAILY_LIMIT } from "@/lib/rate-limit";
import { IMAGE_TYPES, type DecodeInput, type ImageType } from "@/lib/schema";

const MAX_CHARS = 8000;
// The Claude API accepts images up to 5 MB. Base64 is ~4/3 the size of the raw bytes.
const MAX_IMAGE_BASE64 = Math.floor((5 * 1024 * 1024 * 4) / 3);

const badRequest = (error: string) => NextResponse.json({ error }, { status: 400 });

function parseInput(body: unknown): DecodeInput | string {
  if (typeof body !== "object" || body === null) return 'Send JSON like { "text": "..." }.';
  const { text, image } = body as { text?: unknown; image?: { data?: unknown; mediaType?: unknown } };

  if (image !== undefined) {
    if (typeof image?.data !== "string" || image.data.length === 0) return "The photo didn't upload. Try again.";
    if (!IMAGE_TYPES.includes(image.mediaType as ImageType)) return "Use a JPG, PNG, WebP or GIF photo.";
    if (image.data.length > MAX_IMAGE_BASE64) return "That photo is too large. Try a smaller one.";
    return { kind: "image", data: image.data, mediaType: image.mediaType as ImageType };
  }

  if (typeof text !== "string" || text.trim().length === 0) return "Paste some text from your document first.";
  if (text.length > MAX_CHARS) {
    return `That's too long. Paste up to ${MAX_CHARS.toLocaleString()} characters at a time.`;
  }
  return { kind: "text", text };
}

// Privacy: the text or photo is used for this one request and never stored or logged.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('Send JSON like { "text": "..." }.');
  }

  const input = parseInput(body);
  if (typeof input === "string") return badRequest(input);

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "No Claude API key yet. Add ANTHROPIC_API_KEY to .env.local, then restart the server." },
      { status: 500 },
    );
  }

  if (!(await allowDecode(request))) {
    return NextResponse.json(
      { error: `You've reached today's limit of ${DAILY_LIMIT} decodes. Come back tomorrow!` },
      { status: 429 },
    );
  }

  try {
    return NextResponse.json(await decodeDocument(input));
  } catch (err) {
    if (err instanceof DecodeRefusedError) {
      return NextResponse.json({ error: "Loquitur couldn't decode this document." }, { status: 422 });
    }
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "The Claude API key is missing or invalid. Check ANTHROPIC_API_KEY in .env.local." },
        { status: 500 },
      );
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Too many requests. Wait a minute and try again." }, { status: 429 });
    }
    if (err instanceof Anthropic.APIConnectionError) {
      return NextResponse.json({ error: "Couldn't reach the Claude API. Check your connection." }, { status: 502 });
    }
    if (err instanceof Anthropic.BadRequestError && input.kind === "image") {
      return NextResponse.json({ error: "Claude couldn't open that photo. Try a different one." }, { status: 400 });
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json({ error: `Claude API error (${err.status}). Try again.` }, { status: 502 });
    }
    console.error("decode failed:", err instanceof Error ? err.message : "unknown error");
    return NextResponse.json({ error: "Something went wrong decoding that document." }, { status: 500 });
  }
}
