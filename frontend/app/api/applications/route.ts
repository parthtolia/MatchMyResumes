import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applications, users } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { getAuthUserId, handleAuthError, AuthError } from "@/lib/auth";

export async function GET() {
  try {
    const userId = await getAuthUserId();

    const rows = await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.createdAt));

    return NextResponse.json(
      rows.map((a) => ({
        id: a.id,
        company_name: a.companyName,
        job_title: a.jobTitle,
        job_url: a.jobUrl,
        status: a.status,
        notes: a.notes,
        date_applied: a.dateApplied,
        resume_id: a.resumeId,
        jd_id: a.jdId,
        created_at: a.createdAt,
        updated_at: a.updatedAt,
      }))
    );
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("List applications error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();

    const body = await request.json();
    const {
      company_name,
      job_title,
      job_url,
      resume_id,
      jd_id,
      status = "saved",
      notes,
      date_applied,
    } = body;

    if (!company_name || !job_title) {
      return NextResponse.json(
        { detail: "company_name and job_title are required" },
        { status: 400 }
      );
    }

    // Enforce tracker limit per plan
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const trackerLimits: Record<string, number> = {
      free: 20,
      pro: 200,
      premium: -1,
    };
    const plan = user?.plan || "free";
    const trackerLimit = trackerLimits[plan] ?? 20;

    if (trackerLimit !== -1) {
      const [total] = await db
        .select({ value: count(applications.id) })
        .from(applications)
        .where(eq(applications.userId, userId));

      if ((total?.value || 0) >= trackerLimit) {
        const upgradeMsg =
          plan === "free"
            ? "Upgrade to Pro for 200 jobs."
            : "Upgrade to Premium for unlimited.";
        return NextResponse.json(
          {
            detail: `Job tracker limit reached (${trackerLimit} applications). ${upgradeMsg}`,
          },
          { status: 402 }
        );
      }
    }

    const appId = crypto.randomUUID();
    await db.insert(applications).values({
      id: appId,
      userId,
      companyName: company_name,
      jobTitle: job_title,
      jobUrl: job_url || null,
      resumeId: resume_id || null,
      jdId: jd_id || null,
      status,
      notes: notes || null,
      dateApplied: date_applied ? new Date(date_applied) : null,
    });

    const [newApp] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, appId))
      .limit(1);

    return NextResponse.json(
      {
        id: newApp.id,
        company_name: newApp.companyName,
        job_title: newApp.jobTitle,
        job_url: newApp.jobUrl,
        status: newApp.status,
        notes: newApp.notes,
        date_applied: newApp.dateApplied,
        resume_id: newApp.resumeId,
        jd_id: newApp.jdId,
        created_at: newApp.createdAt,
        updated_at: newApp.updatedAt,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("Create application error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
