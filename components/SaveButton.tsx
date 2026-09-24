"use client";

import { useState } from "react";
import type { NewCodexEntry } from "@/lib/codex";
import { SignInDialog } from "./AuthBar";
import { useCodex } from "./CodexProvider";

// `onPaper` is for the cream index cards, where gold ink would be too faint.
// `quiet` is a plain text link, for dictionary entries where a button would be too loud.
export function SaveButton({
  entry,
  label = "Save",
  onPaper = false,
  quiet = false,
}: {
  entry: NewCodexEntry;
  label?: string;
  onPaper?: boolean;
  quiet?: boolean;
}) {
  const { enabled, user, isSaved, save } = useCodex();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  if (!enabled) return null;
  const saved = isSaved(entry.kind, entry.key);

  async function onClick() {
    if (!user) return setSigningIn(true);
    setBusy(true);
    setError(await save(entry));
    setBusy(false);
  }

  return (
    <>
      <button
        onClick={onClick}
        disabled={saved || busy}
        className={`shrink-0 text-xs font-medium transition ${quiet ? "" : "rounded-sm px-2.5 py-1"} ${
          quiet
            ? saved
              ? "text-emerald-300"
              : "text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
            : saved
            ? onPaper
              ? "text-[#3f6a4f]"
              : "text-emerald-300"
            : onPaper
              ? "border border-ink text-ink hover:bg-ink hover:text-paper"
              : "border border-accent text-accent hover:bg-accent hover:text-bg"
        }`}
        title={error ?? undefined}
      >
        {saved ? (quiet ? "✓ saved" : "✓ In My Words") : busy ? "Saving…" : quiet ? `+ ${label.toLowerCase()}` : `+ ${label}`}
      </button>
      {error && <span className={`text-xs ${onPaper ? "text-[#7a3317]" : "text-red-300"}`}>{error}</span>}
      {signingIn && <SignInDialog onClose={() => setSigningIn(false)} />}
    </>
  );
}
