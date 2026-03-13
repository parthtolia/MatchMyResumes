import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, resumes, applications } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { getAuthUserId, handleAuthError, AuthError } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getAuthUserId();

    // Check admin
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { detail: "Admin access required" },
        { status: 403 }
      );
    }

    const [totalUsers] = await db
      .select({ value: count(users.id) })
      .from(users);
    const [totalResumes] = await db
      .select({ value: count(resumes.id) })
      .from(resumes);
    const [proUsers] = await db
      .select({ value: count(users.id) })
      .from(users)
      .where(eq(users.plan, "pro"));
    const [premiumUsers] = await db
      .select({ value: count(users.id) })
      .from(users)
      .where(eq(users.plan, "premium"));
    const [totalApplications] = await db
      .select({ value: count(applications.id) })
      .from(applications);

    return NextResponse.json({
      total_users: totalUsers?.value || 0,
      total_resumes: totalResumes?.value || 0,
      pro_users: proUsers?.value || 0,
      premium_users: premiumUsers?.value || 0,
      free_users:
        (totalUsers?.value || 0) -
        (proUsers?.value || 0) -
        (premiumUsers?.value || 0),
      total_applications: totalApplications?.value || 0,
    });
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
