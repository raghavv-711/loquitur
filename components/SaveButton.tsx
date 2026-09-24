"use client";

import { useState } from "react";
import type { NewCodexEntry } from "@/lib/codex";
import { SignInDialog } from "./AuthBar";
import { useCodex } from "./CodexProvider";

// `onPaper` is for the cream index cards, where gold ink would be too faint.
export function SaveButton({
  entry,
  label = "Save",
  onPaper = false,
}: {
  entry: NewCodexEntry;
  label?: string;
  onPaper?: boolean;
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
        className={`shrink-0 rounded-sm px-2.5 py-1 text-xs font-medium transition ${
          saved
            ? onPaper
              ? "text-[#3f6a4f]"
              : "text-emerald-300"
            : onPaper
              ? "border border-ink text-ink hover:bg-ink hover:text-paper"
              : "border border-accent text-accent hover:bg-accent hover:text-bg"
        }`}
        title={error ?? undefined}
      >
        {saved ? "✓ In My Words" : busy ? "Saving…" : `+ ${label}`}
      </button>
      {error && <span className={`text-xs ${onPaper ? "text-[#7a3317]" : "text-red-300"}`}>{error}</span>}
      {signingIn && <SignInDialog onClose={() => setSigningIn(false)} />}
    </>
  );
}
