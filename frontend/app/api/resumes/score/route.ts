import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  resumes,
  jobDescriptions,
  resumeScores,
  users,
  usageLogs,
} from "@/lib/db/schema";
import { eq, and, gte, count } from "drizzle-orm";
import { getAuthUserId, handleAuthError, AuthError } from "@/lib/auth";
import { checkRateLimit, aiLimiter } from "@/lib/rate-limit";
import { PLAN_LIMITS, monthStart } from "@/lib/plan-limits";
import { generateEmbedding } from "@/lib/services/embedding-service";
import { computeAtsScore } from "@/lib/scoring/ats-scorer";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();

    const rateLimited = await checkRateLimit(aiLimiter, userId);
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const { resume_id, jd_id } = body;

    if (!resume_id || !jd_id) {
      return NextResponse.json(
        { detail: "resume_id and jd_id are required" },
        { status: 400 }
      );
    }

    // Enforce monthly JD-match limit
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user) {
      const plan = user.plan || "free";
      const limit = PLAN_LIMITS[plan]?.jd_match ?? PLAN_LIMITS.free.jd_match;
      if (limit !== -1) {
        const [monthCount] = await db
          .select({ value: count(usageLogs.id) })
          .from(usageLogs)
          .where(
            and(
              eq(usageLogs.userId, userId),
              eq(usageLogs.feature, "jd_match"),
              gte(usageLogs.createdAt, monthStart())
            )
          );
        if ((monthCount?.value || 0) >= limit) {
          return NextResponse.json(
            {
              detail: `Monthly JD Match limit reached (${limit}/month). Upgrade to Pro for unlimited scans.`,
            },
            { status: 402 }
          );
        }
      }
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

    // Fetch JD
    const [jd] = await db
      .select()
      .from(jobDescriptions)
      .where(
        and(eq(jobDescriptions.id, jd_id), eq(jobDescriptions.userId, userId))
      )
      .limit(1);

    if (!jd) {
      return NextResponse.json(
        { detail: "Job description not found" },
        { status: 404 }
      );
    }

    // Generate embeddings if missing
    let resumeEmbedding = resume.embedding;
    let jdEmbedding = jd.embedding;

    if (!resumeEmbedding && resume.rawText) {
      resumeEmbedding = await generateEmbedding(resume.rawText);
      if (resumeEmbedding) {
        await db
          .update(resumes)
          .set({ embedding: resumeEmbedding })
          .where(eq(resumes.id, resume.id));
      }
    }
    if (!jdEmbedding && jd.rawText) {
      jdEmbedding = await generateEmbedding(jd.rawText);
      if (jdEmbedding) {
        await db
          .update(jobDescriptions)
          .set({ embedding: jdEmbedding })
          .where(eq(jobDescriptions.id, jd.id));
      }
    }

    // Compute score
    const scoreData = await computeAtsScore(
      resume.rawText || "",
      jd.rawText || "",
      resumeEmbedding || null,
      jdEmbedding || null,
      (resume.structuredJson as Record<string, any>) || {},
      resume.fileType || "pdf"
    );

    // Store score
    const scoreId = crypto.randomUUID();
    await db.insert(resumeScores).values({
      id: scoreId,
      resumeId: resume.id,
      jdId: jd.id,
      totalScore: scoreData.total_score,
      keywordScore: scoreData.keyword_score,
      semanticScore: scoreData.semantic_score,
      formattingScore: scoreData.formatting_score,
      sectionScore: scoreData.section_score,
      quantificationScore: scoreData.quantification_score,
      matchedKeywords: scoreData.matched_keywords,
      missingKeywords: scoreData.missing_keywords,
      breakdown: scoreData.breakdown,
    });

    // Record usage permanently (survives resume/score deletion)
    await db.insert(usageLogs).values({
      id: crypto.randomUUID(),
      userId,
      feature: "jd_match",
    });

    const [scoreRecord] = await db
      .select()
      .from(resumeScores)
      .where(eq(resumeScores.id, scoreId))
      .limit(1);

    return NextResponse.json({
      id: scoreRecord.id,
      resume_id: scoreRecord.resumeId,
      jd_id: scoreRecord.jdId,
      total_score: scoreRecord.totalScore,
      breakdown: {
        keyword_score: scoreRecord.keywordScore,
        semantic_score: scoreRecord.semanticScore,
        formatting_score: scoreRecord.formattingScore,
        section_score: scoreRecord.sectionScore,
        quantification_score: scoreRecord.quantificationScore,
        details: scoreRecord.breakdown,
      },
      matched_keywords: scoreRecord.matchedKeywords || [],
      missing_keywords: scoreRecord.missingKeywords || [],
      created_at: scoreRecord.createdAt,
    });
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("Score resume error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
