"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { entryId, type CodexKind, type NewCodexEntry } from "@/lib/codex";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";

type CodexContextValue = {
  enabled: boolean; // false when Supabase isn't set up yet
  user: User | null;
  loading: boolean;
  isSaved: (kind: CodexKind, key: string) => boolean;
  dueCount: number; // saved words due for review now
  refreshDue: () => void;
  save: (entry: NewCodexEntry) => Promise<string | null>; // returns an error message, or null
  remove: (kind: CodexKind, key: string) => Promise<string | null>;
  sendSignInLink: (email: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
};

const CodexContext = createContext<CodexContextValue | null>(null);

export function useCodex() {
  const value = useContext(CodexContext);
  if (!value) throw new Error("useCodex must be used inside <CodexProvider>");
  return value;
}

export function CodexProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => (supabaseConfigured ? createClient() : null), []);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(supabaseConfigured);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [dueCount, setDueCount] = useState(0);

  const refreshDue = useCallback(() => {
    if (!supabase || !user) return setDueCount(0);
    supabase
      .from("codex_entries")
      .select("id", { count: "exact", head: true })
      .lte("due_at", new Date().toISOString())
      .then(({ count }) => setDueCount(count ?? 0));
  }, [supabase, user]);

  // Track sign-in state.
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  // Load which items this user has already saved, so cards can show "Saved".
  useEffect(() => {
    if (!supabase || !user) {
      setSaved(new Set());
      return;
    }
    supabase
      .from("codex_entries")
      .select("kind, key")
      .then(({ data }) => setSaved(new Set((data ?? []).map((row) => entryId(row.kind, row.key)))));
    refreshDue();
  }, [supabase, user, refreshDue]);

  const save = useCallback(
    async (entry: NewCodexEntry) => {
      if (!supabase || !user) return "Sign in to save words to your Codex.";
      const { error } = await supabase
        .from("codex_entries")
        .upsert(entry, { onConflict: "user_id,kind,key", ignoreDuplicates: true });
      if (error) return "Couldn't save that. Try again.";
      setSaved((prev) => new Set(prev).add(entryId(entry.kind, entry.key)));
      refreshDue(); // new words are due right away
      return null;
    },
    [supabase, user, refreshDue],
  );

  const remove = useCallback(
    async (kind: CodexKind, key: string) => {
      if (!supabase || !user) return "Sign in first.";
      const { error } = await supabase.from("codex_entries").delete().match({ kind, key });
      if (error) return "Couldn't remove that. Try again.";
      setSaved((prev) => {
        const next = new Set(prev);
        next.delete(entryId(kind, key));
        return next;
      });
      refreshDue();
      return null;
    },
    [supabase, user, refreshDue],
  );

  const sendSignInLink = useCallback(
    async (email: string) => {
      if (!supabase) return "Sign-in isn't set up yet.";
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (!error) return null;
      return error.status === 429
        ? "Too many sign-in emails. Wait a few minutes and try again."
        : "Couldn't send the sign-in link. Check the email address and try again.";
    },
    [supabase],
  );

  // Sends the browser to Google, which returns to /auth/callback with a code (handled there).
  // Same callback address as the email links, so one Supabase redirect-URL entry covers both.
  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return "Sign-in isn't set up yet.";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    return error ? "Couldn't start Google sign-in. Try again." : null;
  }, [supabase]);

  const value = useMemo<CodexContextValue>(
    () => ({
      enabled: supabaseConfigured,
      user,
      loading,
      isSaved: (kind, key) => saved.has(entryId(kind, key)),
      dueCount,
      refreshDue,
      save,
      remove,
      sendSignInLink,
      signInWithGoogle,
    }),
    [user, loading, saved, dueCount, refreshDue, save, remove, sendSignInLink, signInWithGoogle],
  );

  return <CodexContext.Provider value={value}>{children}</CodexContext.Provider>;
}
