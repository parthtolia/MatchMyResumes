import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobDescriptions, resumeScores } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthUserId, handleAuthError, AuthError } from "@/lib/auth";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ jdId: string }> }
) {
  try {
    const userId = await getAuthUserId();
    const { jdId } = await params;

    const [jd] = await db
      .select({ id: jobDescriptions.id })
      .from(jobDescriptions)
      .where(
        and(eq(jobDescriptions.id, jdId), eq(jobDescriptions.userId, userId))
      )
      .limit(1);

    if (!jd) {
      return NextResponse.json(
        { detail: "Job description not found" },
        { status: 404 }
      );
    }

    // Delete associated scores first, then JD
    await db.delete(resumeScores).where(eq(resumeScores.jdId, jdId));
    await db.delete(jobDescriptions).where(eq(jobDescriptions.id, jdId));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("Delete JD error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
