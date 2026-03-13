import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resumes, jobDescriptions, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAuthUserId, handleAuthError, AuthError } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getAuthUserId();

    // Fetch resumes (exclude raw_text, embedding for performance)
    const resumeRows = await db
      .select({
        id: resumes.id,
        filename: resumes.filename,
        versionTag: resumes.versionTag,
        isOptimized: resumes.isOptimized,
        createdAt: resumes.createdAt,
      })
      .from(resumes)
      .where(eq(resumes.userId, userId))
      .orderBy(desc(resumes.createdAt));

    // Fetch jobs (exclude raw_text, embedding for performance)
    const jobRows = await db
      .select({
        id: jobDescriptions.id,
        title: jobDescriptions.title,
        company: jobDescriptions.company,
        createdAt: jobDescriptions.createdAt,
      })
      .from(jobDescriptions)
      .where(eq(jobDescriptions.userId, userId))
      .orderBy(desc(jobDescriptions.createdAt));

    // Fetch user plan
    const [user] = await db
      .select({ plan: users.plan })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const plan = user?.plan || "free";

    return NextResponse.json({
      resumes: resumeRows.map((r) => ({
        id: r.id,
        filename: r.filename,
        version_tag: r.versionTag,
        is_optimized: r.isOptimized,
        created_at: r.createdAt,
      })),
      jobs: jobRows.map((j) => ({
        id: j.id,
        title: j.title,
        company: j.company,
        created_at: j.createdAt,
      })),
      plan,
    });
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("Dashboard init error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
