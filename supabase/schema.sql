-- Loquitur database schema. Paste this into Supabase → SQL Editor → New query → Run.
-- Safe to run more than once.

create table if not exists public.codex_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('abbreviation', 'root')),
  key text not null,              -- normalized form used for matching, e.g. "PRN" or "nephr"
  term text not null,             -- as displayed, e.g. "PRN" or "nephr-"
  details jsonb not null,         -- abbreviation: expansion, literal, plain; root: origin, meaning, hook
  source_word text,               -- the word it was saved from, e.g. "nephrolithiasis"
  created_at timestamptz not null default now(),

  -- Spaced-repetition review schedule (used by the week-7 review quizzes)
  due_at timestamptz not null default now(),
  interval_days integer not null default 0,
  ease real not null default 2.5,
  reps integer not null default 0,

  unique (user_id, kind, key)
);

create index if not exists codex_entries_user_due on public.codex_entries (user_id, due_at);

-- Row-level security: every user can only see and change their own saved words.
alter table public.codex_entries enable row level security;

drop policy if exists "read own entries" on public.codex_entries;
create policy "read own entries" on public.codex_entries
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "add own entries" on public.codex_entries;
create policy "add own entries" on public.codex_entries
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "update own entries" on public.codex_entries;
create policy "update own entries" on public.codex_entries
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "delete own entries" on public.codex_entries;
create policy "delete own entries" on public.codex_entries
  for delete to authenticated using ((select auth.uid()) = user_id);
