import assert from "node:assert/strict";
import { test } from "node:test";
import { describeDue, MAX_EASE, MIN_EASE, nextSchedule } from "./review";

const now = new Date("2026-09-23T12:00:00Z");
const days = (iso: string) => (new Date(iso).getTime() - now.getTime()) / 86_400_000;
const fresh = { interval_days: 0, ease: 2.5, reps: 0 };

test("first correct answer schedules a review tomorrow, second in 3 days", () => {
  const first = nextSchedule(fresh, true, now);
  assert.equal(first.interval_days, 1);
  assert.equal(days(first.due_at), 1);
  const second = nextSchedule(first, true, now);
  assert.equal(second.interval_days, 3);
});

test("later correct answers grow the interval by the ease factor", () => {
  const third = nextSchedule({ interval_days: 3, ease: 2.5, reps: 2 }, true, now);
  assert.equal(third.interval_days, 8); // round(3 × 2.5)
  assert.ok(third.interval_days > 3);
});

test("a miss resets progress and brings the word back in 10 minutes", () => {
  const miss = nextSchedule({ interval_days: 8, ease: 2.6, reps: 3 }, false, now);
  assert.equal(miss.reps, 0);
  assert.equal(miss.interval_days, 0);
  assert.equal(miss.ease, 2.4);
  assert.equal(new Date(miss.due_at).getTime() - now.getTime(), 10 * 60 * 1000);
});

test("ease stays within bounds", () => {
  assert.equal(nextSchedule({ interval_days: 0, ease: MIN_EASE, reps: 0 }, false, now).ease, MIN_EASE);
  assert.equal(nextSchedule({ interval_days: 9, ease: MAX_EASE, reps: 5 }, true, now).ease, MAX_EASE);
});

test("describeDue reads naturally", () => {
  assert.equal(describeDue(new Date(now.getTime() - 1000).toISOString(), now), "now");
  assert.equal(describeDue(new Date(now.getTime() + 10 * 60000).toISOString(), now), "in 10 minutes");
  assert.equal(describeDue(new Date(now.getTime() + 3 * 86400000).toISOString(), now), "in 3 days");
});
