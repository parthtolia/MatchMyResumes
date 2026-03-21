import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resumes, resumeScores, jobDescriptions, usageLogs } from "@/lib/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { getAuthUserId, handleAuthError, AuthError } from "@/lib/auth";
import { checkRateLimit, aiLimiter } from "@/lib/rate-limit";
import { runExtractionPipelineFromText } from "@/lib/services/resume-pipeline";
import { generateEmbedding } from "@/lib/services/embedding-service";
import { computeKeywordScore } from "@/lib/scoring/ats-scorer";
import type { StructuredResume } from "@/lib/types/structured-resume";

export const maxDuration = 60;

/**
 * Serialize a StructuredResume back to plain text for storage.
 * Used when saving optimized resume as a new version.
 */
function serializeStructuredResume(sr: StructuredResume): string {
  const lines: string[] = [];

  if (sr.name) lines.push(sr.name);
  if (sr.title) lines.push(sr.title);

  const contact = [sr.email, sr.phone, sr.location]
    .filter(Boolean)
    .join(" | ");
  if (contact) lines.push(contact);

  if (sr.summary) lines.push("\nSUMMARY\n" + sr.summary);

  if (sr.skills?.length) {
    lines.push("\nSKILLS\n" + sr.skills.join(", "));
  }

  if (sr.experience?.length) {
    lines.push("\nWORK EXPERIENCE");
    for (const e of sr.experience) {
      lines.push(`${e.role} | ${e.company} | ${e.duration}`);
      for (const p of e.points) {
        lines.push("- " + p);
      }
    }
  }

  if (sr.education?.length) {
    lines.push("\nEDUCATION");
    for (const e of sr.education) {
      lines.push(`${e.degree} | ${e.institution} | ${e.year}`.trim());
    }
  }

  if (sr.certifications?.length) {
    lines.push("\nCERTIFICATIONS");
    for (const c of sr.certifications) {
      lines.push("- " + c);
    }
  }

  return lines.join("\n");
}

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

    // Run extraction and optimization pipeline
    let pipelineResult;
    try {
      pipelineResult = await runExtractionPipelineFromText(
        resume.rawText || "",
        (resume.fileType as "pdf" | "docx") || "pdf",
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

      // Serialize optimized resume to text
      const optimizedRawText =
        serializeStructuredResume(pipelineResult.optimized) ||
        resume.rawText ||
        "";
      const newEmbedding = await generateEmbedding(optimizedRawText);

      newResumeId = crypto.randomUUID();
      await db.insert(resumes).values({
        id: newResumeId,
        userId,
        filename: newFilename,
        fileType: resume.fileType,
        rawText: optimizedRawText,
        structuredJson: pipelineResult.optimized,
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

    const response: any = {
      // Backward-compat stubs (dashboard page will prefer structured_resume now)
      optimized_text: "",
      changes_summary: pipelineResult.changes_summary,
      optimized_sections: {},
      new_resume_id: newResumeId,
      structured_json: null,

      // New canonical fields (matches public endpoint)
      structured_resume: pipelineResult.optimized,
      missing_fields: pipelineResult.missing_fields,
      confidence_score: pipelineResult.confidence_score,
      contact_info: {
        name: pipelineResult.optimized.name,
        email: pipelineResult.optimized.email,
        phone: pipelineResult.optimized.phone,
        location: pipelineResult.optimized.location,
        title: pipelineResult.optimized.title,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("Optimize resume error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
