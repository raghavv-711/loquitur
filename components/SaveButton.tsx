"use client";

import { useState } from "react";
import type { NewCodexEntry } from "@/lib/codex";
import { SignInDialog } from "./AuthBar";
import { useCodex } from "./CodexProvider";

export function SaveButton({ entry, label = "Save" }: { entry: NewCodexEntry; label?: string }) {
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
        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition ${
          saved ? "bg-emerald-400/15 text-emerald-200" : "border border-accent text-accent hover:bg-accent hover:text-bg"
        }`}
        title={error ?? undefined}
      >
        {saved ? "✓ In Codex" : busy ? "Saving…" : `+ ${label}`}
      </button>
      {error && <span className="text-xs text-red-300">{error}</span>}
      {signingIn && <SignInDialog onClose={() => setSigningIn(false)} />}
    </>
  );
}
