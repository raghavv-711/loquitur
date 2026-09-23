"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useCodex } from "./CodexProvider";
import { GoogleButton, googleButtonAvailable } from "./GoogleButton";

// Top bar: "Sign in" (email link) when signed out; Codex link and sign-out when signed in.
export function AuthBar() {
  const { enabled, user, loading, dueCount } = useCodex();
  const [open, setOpen] = useState(false);

  if (!enabled || loading) return <div className="h-9" />;

  return (
    <nav className="flex items-center justify-end gap-3 text-sm">
      {user ? (
        <>
          <Link href="/" className="text-stone-600 hover:text-ink">
            Decode
          </Link>
          <Link href="/codex" className="text-stone-600 hover:text-ink">
            My Codex
          </Link>
          <Link href="/review" className="font-medium text-terracotta hover:underline">
            Review
            {dueCount > 0 && (
              <span className="ml-1 rounded-full bg-terracotta px-1.5 py-0.5 text-xs text-white">{dueCount}</span>
            )}
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

// Email sign-in links only reach Supabase team members until a custom email service is connected,
// so the option is hidden unless NEXT_PUBLIC_EMAIL_SIGNIN=true.
const EMAIL_SIGNIN = process.env.NEXT_PUBLIC_EMAIL_SIGNIN === "true";

export function SignInDialog({ onClose }: { onClose: () => void }) {
  const { sendSignInLink, signInWithGoogle } = useCodex();
  const router = useRouter();
  const onGoogleSignedIn = useCallback(() => {
    onClose();
    router.push("/codex");
  }, [onClose, router]);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function google() {
    setError(null);
    const problem = await signInWithGoogle(); // on success the page navigates to Google
    if (problem) setError(problem);
  }

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
            <p className="text-sm text-stone-600">Save the roots and abbreviations you learn to your Codex.</p>
            {googleButtonAvailable ? (
              <GoogleButton onSignedIn={onGoogleSignedIn} />
            ) : (
              // Fallback when NEXT_PUBLIC_GOOGLE_CLIENT_ID isn't set: redirect flow through Supabase.
              <button
                type="button"
                onClick={google}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-stone py-2.5 text-sm font-medium hover:border-ink"
              >
                <GoogleLogo />
                Continue with Google
              </button>
            )}
            {EMAIL_SIGNIN && (
              <>
                <div className="my-4 flex items-center gap-3 text-xs text-stone-400">
                  <span className="h-px flex-1 bg-stone" />
                  or get an email link
                  <span className="h-px flex-1 bg-stone" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-stone bg-parchment p-3 outline-none focus:border-terracotta"
                />
                <button
                  disabled={status === "sending"}
                  className="mt-3 w-full rounded-full bg-ink py-2.5 text-sm font-medium text-white hover:bg-terracotta disabled:opacity-40"
                >
                  {status === "sending" ? "Sending…" : "Email me a sign-in link"}
                </button>
              </>
            )}
            {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
          </form>
        )}
        <button onClick={onClose} className="mt-3 w-full text-sm text-stone-500 hover:text-ink">
          Close
        </button>
      </div>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
