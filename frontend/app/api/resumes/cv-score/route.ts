import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resumes, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthUserId, handleAuthError, AuthError } from "@/lib/auth";
import { checkRateLimit, aiLimiter } from "@/lib/rate-limit";
import { PLAN_LIMITS, monthStart } from "@/lib/plan-limits";
import { computeCvScore } from "@/lib/scoring/cv-scorer";

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();

    const rateLimited = await checkRateLimit(aiLimiter, userId);
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const { resume_id } = body;

    if (!resume_id) {
      return NextResponse.json(
        { detail: "resume_id is required" },
        { status: 400 }
      );
    }

    // Enforce monthly cv-score limit (tracked via usage_count + usage_reset_date)
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user) {
      const ms = monthStart();
      const resetDate = user.usageResetDate;
      if (!resetDate || resetDate < ms) {
        await db
          .update(users)
          .set({ usageCount: 0, usageResetDate: ms })
          .where(eq(users.id, userId));
        // Reset in-memory too
        user.usageCount = 0;
      }

      const plan = user.plan || "free";
      const limit = PLAN_LIMITS[plan]?.cv_score ?? PLAN_LIMITS.free.cv_score;
      if (limit !== -1 && (user.usageCount || 0) >= limit) {
        return NextResponse.json(
          {
            detail: `Monthly ATS Score limit reached (${limit}/month). Upgrade to Pro for unlimited scans.`,
          },
          { status: 402 }
        );
      }

      // Increment usage
      await db
        .update(users)
        .set({ usageCount: (user.usageCount || 0) + 1 })
        .where(eq(users.id, userId));
    }

    // Fetch resume
    const [resume] = await db
      .select()
      .from(resumes)
      .where(and(eq(resumes.id, resume_id), eq(resumes.userId, userId)))
      .limit(1);

    if (!resume) {
      return NextResponse.json(
        { detail: "Resume not found" },
        { status: 404 }
      );
    }

    if (!resume.rawText) {
      return NextResponse.json(
        { detail: "Resume has no parsed text" },
        { status: 400 }
      );
    }

    const scoreData = computeCvScore(
      resume.rawText,
      (resume.structuredJson as Record<string, any>) || {}
    );

    return NextResponse.json({
      resume_id: resume.id,
      filename: resume.filename,
      ...scoreData,
    });
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("CV score error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
