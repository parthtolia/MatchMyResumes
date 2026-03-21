import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resumes, usageLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUserId, handleAuthError, AuthError } from "@/lib/auth";
import { checkRateLimit, aiLimiter } from "@/lib/rate-limit";
import { runExtractionPipelineFromText } from "@/lib/services/resume-pipeline";
import { generateEmbedding } from "@/lib/services/embedding-service";
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
    const { resume_id, save_as_version, version_tag } = body;

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
      .where(eq(resumes.id, resume_id));

    if (!resume || resume.userId !== userId) {
      return NextResponse.json(
        { detail: "Resume not found" },
        { status: 404 }
      );
    }

    // Run extraction and optimization pipeline with empty JD
    let pipelineResult;
    try {
      pipelineResult = await runExtractionPipelineFromText(
        resume.rawText || "",
        (resume.fileType as "pdf" | "docx") || "pdf",
        "", // Empty JD for general optimization
        [] // No missing keywords
      );
    } catch (e: any) {
      return NextResponse.json(
        { detail: `Polish failed: ${e.message}` },
        { status: 500 }
      );
    }

    let newResumeId: string | null = null;
    if (save_as_version) {
      const tag = version_tag || "General Polish";

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

      // Build filename
      const parts = rootResume.filename.split(".");
      const ext = parts.length > 1 ? parts.pop() : "txt";
      const baseName = parts.join(".");
      const newFilename = `${baseName}_polished.${ext}`;

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

    // Record usage permanently
    await db.insert(usageLogs).values({
      id: crypto.randomUUID(),
      userId,
      feature: "quick_optimize",
    });

    const response: any = {
      optimized_text: "",
      changes_summary: pipelineResult.changes_summary,
      optimized_sections: {},
      new_resume_id: newResumeId,
      structured_json: null,

      // New canonical fields
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
    console.error("Quick optimize resume error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
