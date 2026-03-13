import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resumes, resumeScores } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthUserId, handleAuthError, AuthError } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  try {
    const userId = await getAuthUserId();
    const { resumeId } = await params;

    const [resume] = await db
      .select({
        id: resumes.id,
        filename: resumes.filename,
        versionTag: resumes.versionTag,
        isOptimized: resumes.isOptimized,
        rawText: resumes.rawText,
        structuredJson: resumes.structuredJson,
        createdAt: resumes.createdAt,
      })
      .from(resumes)
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)))
      .limit(1);

    if (!resume) {
      return NextResponse.json(
        { detail: "Resume not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: resume.id,
      filename: resume.filename,
      version_tag: resume.versionTag,
      is_optimized: resume.isOptimized,
      raw_text: resume.rawText,
      structured_json: resume.structuredJson,
      created_at: resume.createdAt,
    });
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("Get resume error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  try {
    const userId = await getAuthUserId();
    const { resumeId } = await params;

    const [resume] = await db
      .select({ id: resumes.id })
      .from(resumes)
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)))
      .limit(1);

    if (!resume) {
      return NextResponse.json(
        { detail: "Resume not found" },
        { status: 404 }
      );
    }

    // Delete associated scores first (cascade), then resume
    await db.delete(resumeScores).where(eq(resumeScores.resumeId, resumeId));
    await db.delete(resumes).where(eq(resumes.id, resumeId));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("Delete resume error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
