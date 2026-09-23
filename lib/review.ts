// Spaced repetition, a simplified version of the SM-2 algorithm used by Anki and SuperMemo.
// Right answers push the next review further out; a miss brings the word back soon.

export type Schedule = { due_at: string; interval_days: number; ease: number; reps: number };

export const MIN_EASE = 1.3;
export const MAX_EASE = 3.0;
const RETRY_MINUTES = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

export function nextSchedule(current: Omit<Schedule, "due_at">, correct: boolean, now = new Date()): Schedule {
  if (!correct) {
    return {
      reps: 0,
      interval_days: 0,
      ease: Math.max(MIN_EASE, round(current.ease - 0.2)),
      due_at: new Date(now.getTime() + RETRY_MINUTES * 60 * 1000).toISOString(),
    };
  }

  const reps = current.reps + 1;
  const interval_days =
    reps === 1 ? 1 : reps === 2 ? 3 : Math.max(current.interval_days + 1, Math.round(current.interval_days * current.ease));
  return {
    reps,
    interval_days,
    ease: Math.min(MAX_EASE, round(current.ease + 0.1)),
    due_at: new Date(now.getTime() + interval_days * DAY_MS).toISOString(),
  };
}

const round = (n: number) => Math.round(n * 100) / 100;

// "in 3 days", "in 10 minutes", "now"
export function describeDue(dueAt: string, now = new Date()): string {
  const ms = new Date(dueAt).getTime() - now.getTime();
  if (ms <= 0) return "now";
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `in ${minutes} minute${minutes === 1 ? "" : "s"}`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `in ${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.round(hours / 24);
  return `in ${days} day${days === 1 ? "" : "s"}`;
}
