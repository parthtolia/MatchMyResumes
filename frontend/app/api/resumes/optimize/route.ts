import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resumes, resumeScores, jobDescriptions, users, usageLogs } from "@/lib/db/schema";
import { eq, and, gte, desc, count } from "drizzle-orm";
import { getAuthUserId, handleAuthError, AuthError } from "@/lib/auth";
import { checkRateLimit, aiLimiter } from "@/lib/rate-limit";
import { PLAN_LIMITS, cycleStart } from "@/lib/plan-limits";
import { optimizeResume } from "@/lib/services/ai-service";
import { generateEmbedding } from "@/lib/services/embedding-service";
import { computeKeywordScore } from "@/lib/scoring/ats-scorer";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();

    const rateLimited = await checkRateLimit(aiLimiter, userId);
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const {
      resume_id,
      jd_id,
      jd_text,
      save_as_version,
      version_tag,
    } = body;

    if (!resume_id) {
      return NextResponse.json(
        { detail: "resume_id is required" },
        { status: 400 }
      );
    }

    // Check plan access
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || user.plan === "free") {
      return NextResponse.json(
        { detail: "AI optimization requires Pro or Premium plan" },
        { status: 402 }
      );
    }

    const plan = user.plan || "free";
    const limit =
      PLAN_LIMITS[plan]?.ai_optimize ?? PLAN_LIMITS.free.ai_optimize;
    if (limit !== -1) {
      const [monthCount] = await db
        .select({ value: count(usageLogs.id) })
        .from(usageLogs)
        .where(
          and(
            eq(usageLogs.userId, userId),
            eq(usageLogs.feature, "ai_optimize"),
            gte(usageLogs.createdAt, cycleStart(user.createdAt))
          )
        );
      if ((monthCount?.value || 0) >= limit) {
        return NextResponse.json(
          {
            detail: `Monthly AI optimization limit reached (${limit}/month). Upgrade to Premium for unlimited.`,
          },
          { status: 402 }
        );
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

    if (!jd_id && !jd_text) {
      return NextResponse.json(
        { detail: "Must provide either jd_id or jd_text" },
        { status: 400 }
      );
    }

    let rawJdText = "";
    let jobTitle = "job";
    let missingKeywords: string[] = [];

    if (jd_id) {
      const [jd] = await db
        .select()
        .from(jobDescriptions)
        .where(
          and(
            eq(jobDescriptions.id, jd_id),
            eq(jobDescriptions.userId, userId)
          )
        )
        .limit(1);

      if (!jd) {
        return NextResponse.json(
          { detail: "Job description not found" },
          { status: 404 }
        );
      }
      rawJdText = jd.rawText || "";
      jobTitle = jd.title || "job";

      // Get missing keywords from latest score
      const [latestScore] = await db
        .select({ missingKeywords: resumeScores.missingKeywords })
        .from(resumeScores)
        .where(
          and(
            eq(resumeScores.resumeId, resume.id),
            eq(resumeScores.jdId, jd.id)
          )
        )
        .orderBy(desc(resumeScores.createdAt))
        .limit(1);

      missingKeywords =
        (latestScore?.missingKeywords as string[]) || [];
    } else {
      rawJdText = jd_text;
      jobTitle = "custom job";
    }

    // If no prior score, compute missing keywords on the fly
    if (!missingKeywords.length && rawJdText) {
      const [, , missing] = await computeKeywordScore(
        resume.rawText || "",
        rawJdText
      );
      missingKeywords = missing;
    }

    // Run AI optimization
    let result;
    try {
      result = await optimizeResume(
        resume.rawText || "",
        rawJdText,
        missingKeywords
      );
    } catch (e: any) {
      return NextResponse.json(
        { detail: `AI optimization failed: ${e.message}` },
        { status: 500 }
      );
    }

    let newResumeId: string | null = null;
    if (save_as_version) {
      const tag = version_tag || `Optimized for ${jobTitle}`;

      // Find root resume
      const rootId = resume.parentResumeId || resume.id;
      let rootResume = resume;
      if (resume.parentResumeId) {
        const [root] = await db
          .select()
          .from(resumes)
          .where(eq(resumes.id, rootId))
          .limit(1);
        if (root) rootResume = root;
      }

      // Count versions
      const [versionCount] = await db
        .select({ value: count(resumes.id) })
        .from(resumes)
        .where(eq(resumes.parentResumeId, rootId));

      const newVersion = (versionCount?.value || 0) + 1;

      // Build filename
      const cleanJdTitle = jobTitle
        .replace(/[^a-zA-Z0-9 \-_]/g, "")
        .trim()
        .replace(/\s+/g, "_")
        .replace(/__+/g, "_") || "job";

      const parts = rootResume.filename.split(".");
      const ext = parts.length > 1 ? parts.pop() : "txt";
      const baseName = parts.join(".");
      const newFilename = `${baseName}_${cleanJdTitle}_v${newVersion}.${ext}`;

      const newEmbedding = await generateEmbedding(
        result.optimized_text || ""
      );

      newResumeId = crypto.randomUUID();
      await db.insert(resumes).values({
        id: newResumeId,
        userId,
        filename: newFilename,
        fileType: resume.fileType,
        rawText: result.optimized_text || resume.rawText,
        structuredJson: resume.structuredJson,
        embedding: newEmbedding,
        versionTag: tag,
        isOptimized: true,
        parentResumeId: rootId,
      });
    }

    // Record usage permanently (survives resume deletion)
    await db.insert(usageLogs).values({
      id: crypto.randomUUID(),
      userId,
      feature: "ai_optimize",
    });

    return NextResponse.json({
      optimized_text: result.optimized_text || "",
      changes_summary: result.changes_summary || [],
      new_resume_id: newResumeId,
      structured_json: null,
    });
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("Optimize resume error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
