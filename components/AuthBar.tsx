"use client";

import Link from "next/link";
import { useState } from "react";
import { useCodex } from "./CodexProvider";

// Top bar: "Sign in" (email link) when signed out; Codex link and sign-out when signed in.
export function AuthBar() {
  const { enabled, user, loading } = useCodex();
  const [open, setOpen] = useState(false);

  if (!enabled || loading) return <div className="h-9" />;

  return (
    <nav className="flex items-center justify-end gap-3 text-sm">
      {user ? (
        <>
          <Link href="/" className="text-stone-600 hover:text-ink">
            Decode
          </Link>
          <Link href="/codex" className="font-medium text-terracotta hover:underline">
            My Codex
          </Link>
          <span className="hidden text-stone-400 sm:inline">{user.email}</span>
          <form action="/auth/signout" method="post">
            <button className="text-stone-600 hover:text-ink">Sign out</button>
          </form>
        </>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full border border-stone px-3 py-1.5 hover:border-terracotta"
        >
          Sign in to save words
        </button>
      )}
      {open && !user && <SignInDialog onClose={() => setOpen(false)} />}
    </nav>
  );
}

export function SignInDialog({ onClose }: { onClose: () => void }) {
  const { sendSignInLink } = useCodex();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const problem = await sendSignInLink(email.trim());
    if (problem) {
      setError(problem);
      setStatus("idle");
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="signin-title"
      >
        <h2 id="signin-title" className="font-serif text-2xl font-semibold">
          Sign in
        </h2>
        {status === "sent" ? (
          <p className="mt-3 text-stone-700">
            Check <strong>{email}</strong> for a sign-in link. Open it in this browser.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-3">
            <p className="text-sm text-stone-600">
              Save the roots and abbreviations you learn to your Codex. No password: we&apos;ll email you a link.
            </p>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-3 w-full rounded-xl border border-stone bg-parchment p-3 outline-none focus:border-terracotta"
            />
            {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
            <button
              disabled={status === "sending"}
              className="mt-3 w-full rounded-full bg-ink py-2.5 text-sm font-medium text-white hover:bg-terracotta disabled:opacity-40"
            >
              {status === "sending" ? "Sending…" : "Email me a sign-in link"}
            </button>
          </form>
        )}
        <button onClick={onClose} className="mt-3 w-full text-sm text-stone-500 hover:text-ink">
          Close
        </button>
      </div>
    </div>
  );
}
