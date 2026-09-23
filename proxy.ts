import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Skip static files and the decode API (it doesn't need a session).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/decode|samples/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
