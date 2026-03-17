// -1 means unlimited
export const PLAN_LIMITS: Record<
  string,
  Record<string, number>
> = {
  free: {
    resume_upload: -1,
    cv_score: -1,
    jd_match: -1,
    ai_optimize: -1,
    cover_letter: -1,
    tracker: -1,
  },
  pro: {
    resume_upload: -1,
    cv_score: -1,
    jd_match: -1,
    ai_optimize: -1,
    cover_letter: -1,
    tracker: -1,
  },
  premium: {
    resume_upload: -1,
    cv_score: -1,
    jd_match: -1,
    ai_optimize: -1,
    cover_letter: -1,
    tracker: -1,
  },
};

export const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Returns the start of the current billing cycle based on the user's
 * account creation date. Each cycle runs from the signup day-of-month
 * to the same day next month.
 *
 * Example: account created Jan 15 → cycles are Jan 15–Feb 14, Feb 15–Mar 14, …
 *
 * Falls back to the 1st of the current calendar month when no
 * creation date is provided (e.g. user row doesn't exist yet).
 */
export function cycleStart(accountCreatedAt?: Date | null): Date {
  const now = new Date();

  if (!accountCreatedAt) {
    // Fallback: 1st of current UTC month
    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)
    );
  }

  const signupDay = accountCreatedAt.getUTCDate();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  // Try the signup day in the current month
  // Date.UTC handles day overflow (e.g. day 31 in a 28-day month → rolls to next month)
  // so clamp to the last day of the current month when needed
  const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const clampedDay = Math.min(signupDay, lastDayOfMonth);
  const candidate = new Date(Date.UTC(year, month, clampedDay, 0, 0, 0, 0));

  if (candidate <= now) {
    // Cycle started this month
    return candidate;
  }

  // Cycle hasn't started yet this month → use previous month's cycle start
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const lastDayOfPrevMonth = new Date(
    Date.UTC(prevYear, prevMonth + 1, 0)
  ).getUTCDate();
  const clampedPrevDay = Math.min(signupDay, lastDayOfPrevMonth);
  return new Date(Date.UTC(prevYear, prevMonth, clampedPrevDay, 0, 0, 0, 0));
}

/** @deprecated Use cycleStart(accountCreatedAt) instead */
export function monthStart(): Date {
  return cycleStart(null);
}
