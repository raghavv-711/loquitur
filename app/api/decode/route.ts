import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { decodeDocument, DecodeRefusedError } from "@/lib/decode";

const MAX_CHARS = 8000;

// Privacy: the document text is used for this one request and never stored or logged.
export async function POST(request: Request) {
  let text: unknown;
  try {
    ({ text } = await request.json());
  } catch {
    return NextResponse.json({ error: "Send JSON like { \"text\": \"...\" }." }, { status: 400 });
  }

  if (typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json({ error: "Paste some text from your document first." }, { status: 400 });
  }
  if (text.length > MAX_CHARS) {
    return NextResponse.json(
      { error: `That's too long. Paste up to ${MAX_CHARS.toLocaleString()} characters at a time.` },
      { status: 400 },
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "No Claude API key yet. Add ANTHROPIC_API_KEY to .env.local, then restart the server." },
      { status: 500 },
    );
  }

  try {
    return NextResponse.json(await decodeDocument(text));
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
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json({ error: `Claude API error (${err.status}). Try again.` }, { status: 502 });
    }
    console.error("decode failed:", err instanceof Error ? err.message : "unknown error");
    return NextResponse.json({ error: "Something went wrong decoding that document." }, { status: 500 });
  }
}
