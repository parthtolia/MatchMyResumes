import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resumes, coverLetters, applications } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { getAuthUserId, handleAuthError, AuthError } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getAuthUserId();

    const [resumeCount] = await db
      .select({ value: count(resumes.id) })
      .from(resumes)
      .where(eq(resumes.userId, userId));

    const [clCount] = await db
      .select({ value: count(coverLetters.id) })
      .from(coverLetters)
      .where(eq(coverLetters.userId, userId));

    const [appCount] = await db
      .select({ value: count(applications.id) })
      .from(applications)
      .where(eq(applications.userId, userId));

    return NextResponse.json({
      resumes: resumeCount?.value || 0,
      scans: resumeCount?.value || 0,
      cover_letters: clCount?.value || 0,
      applications: appCount?.value || 0,
    });
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
