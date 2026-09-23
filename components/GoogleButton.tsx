"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// "Sign in with Google" using Google's own button (Google Identity Services).
// Google gives the page a signed ID token, which Supabase exchanges for a session.
// Nothing redirects through the Supabase domain, so Google's sign-in screen names
// loquitur.vercel.app (or "Loquitur" once the brand is verified) instead of *.supabase.co.
// Docs: https://supabase.com/docs/guides/auth/social-login/auth-google

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

type CredentialResponse = { credential: string };
type GoogleId = {
  initialize: (options: {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    nonce: string;
    use_fedcm_for_prompt?: boolean;
  }) => void;
  renderButton: (element: HTMLElement, options: Record<string, string | number>) => void;
};
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

export const googleButtonAvailable = Boolean(CLIENT_ID);

export function GoogleButton({ onSignedIn }: { onSignedIn: () => void }) {
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  // Keep the latest callback without re-creating Google's button on every render.
  const onSignedInRef = useRef(onSignedIn);
  useEffect(() => {
    onSignedInRef.current = onSignedIn;
  }, [onSignedIn]);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    (async () => {
      await loadScript();
      if (cancelled || !container.current || !window.google) return;

      // A one-time random value: Google signs its hash into the token, Supabase checks it,
      // so a stolen token can't be replayed.
      const nonce = randomNonce();
      const hashedNonce = await sha256Hex(nonce);

      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        nonce: hashedNonce,
        use_fedcm_for_prompt: true,
        callback: async ({ credential }) => {
          const { error } = await createClient().auth.signInWithIdToken({ provider: "google", token: credential, nonce });
          if (error) setError("Google sign-in didn't work. Try again, or use an email link.");
          else onSignedInRef.current();
        },
      });
      window.google.accounts.id.renderButton(container.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width: Math.min(320, container.current.offsetWidth || 320),
      });
    })().catch(() => setError("Couldn't load Google sign-in. Check your connection or ad blocker."));

    return () => {
      cancelled = true;
    };
  }, []);

  if (!CLIENT_ID) return null;
  return (
    <div className="mt-4">
      <div ref={container} className="flex min-h-10 justify-center" />
      {error && <p className="mt-2 text-center text-sm text-red-300">{error}</p>}
    </div>
  );
}

let scriptPromise: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Google script failed to load"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

function randomNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes));
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}
