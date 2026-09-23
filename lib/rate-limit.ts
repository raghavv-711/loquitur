import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

// Daily decodes allowed per visitor. Each decode costs about $0.03 in Claude API credits.
export const DAILY_LIMIT = Number(process.env.DAILY_DECODE_LIMIT ?? 25);

// Returns true if this request may decode. Counts are kept in Supabase (supabase/schema.sql),
// so the limit holds across all of Vercel's servers. Without Supabase (local dev) there's no limit.
export async function allowDecode(request: Request): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return true;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
  // Hash with a secret salt so stored values can't be turned back into IP addresses.
  const visitor = createHash("sha256")
    .update(`${process.env.RATE_LIMIT_SALT ?? "loquitur"}:${ip}`)
    .digest("hex")
    .slice(0, 32);

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase.rpc("use_decode", { p_visitor: visitor, p_limit: DAILY_LIMIT });
  if (error) {
    console.error("rate limit check failed:", error.message);
    return true; // don't block people if the limiter itself is down; the console spend cap is the backstop
  }
  return data === true;
}
