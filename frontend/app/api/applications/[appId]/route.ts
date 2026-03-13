import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applications } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthUserId, handleAuthError, AuthError } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  try {
    const userId = await getAuthUserId();
    const { appId } = await params;

    const [existing] = await db
      .select()
      .from(applications)
      .where(and(eq(applications.id, appId), eq(applications.userId, userId)))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { detail: "Application not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updateData: Record<string, any> = {};

    if (body.company_name !== undefined)
      updateData.companyName = body.company_name;
    if (body.job_title !== undefined) updateData.jobTitle = body.job_title;
    if (body.job_url !== undefined) updateData.jobUrl = body.job_url;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.date_applied !== undefined)
      updateData.dateApplied = body.date_applied
        ? new Date(body.date_applied)
        : null;
    if (body.resume_id !== undefined) updateData.resumeId = body.resume_id;
    if (body.jd_id !== undefined) updateData.jdId = body.jd_id;

    updateData.updatedAt = new Date();

    await db
      .update(applications)
      .set(updateData)
      .where(eq(applications.id, appId));

    const [updated] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, appId))
      .limit(1);

    return NextResponse.json({
      id: updated.id,
      company_name: updated.companyName,
      job_title: updated.jobTitle,
      job_url: updated.jobUrl,
      status: updated.status,
      notes: updated.notes,
      date_applied: updated.dateApplied,
      resume_id: updated.resumeId,
      jd_id: updated.jdId,
      created_at: updated.createdAt,
      updated_at: updated.updatedAt,
    });
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("Update application error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  try {
    const userId = await getAuthUserId();
    const { appId } = await params;

    const [existing] = await db
      .select({ id: applications.id })
      .from(applications)
      .where(and(eq(applications.id, appId), eq(applications.userId, userId)))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { detail: "Application not found" },
        { status: 404 }
      );
    }

    await db.delete(applications).where(eq(applications.id, appId));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("Delete application error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
