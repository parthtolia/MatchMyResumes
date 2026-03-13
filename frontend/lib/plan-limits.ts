// -1 means unlimited
export const PLAN_LIMITS: Record<
  string,
  Record<string, number>
> = {
  free: {
    cv_score: 5,
    jd_match: 5,
    ai_optimize: 0,
    cover_letter: 1,
    tracker: 20,
  },
  pro: {
    cv_score: -1,
    jd_match: -1,
    ai_optimize: 10,
    cover_letter: 10,
    tracker: 200,
  },
  premium: {
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

export function monthStart(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)
  );
}
