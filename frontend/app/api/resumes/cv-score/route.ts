import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resumes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthUserId, handleAuthError, AuthError } from "@/lib/auth";
import { checkRateLimit, aiLimiter } from "@/lib/rate-limit";
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
