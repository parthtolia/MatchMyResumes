import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  coverLetters,
  resumes,
  jobDescriptions,
  users,
} from "@/lib/db/schema";
import { eq, and, gte, desc, count } from "drizzle-orm";
import { getAuthUserId, handleAuthError, AuthError } from "@/lib/auth";
import { checkRateLimit, aiLimiter } from "@/lib/rate-limit";
import { monthStart } from "@/lib/plan-limits";
import { generateCoverLetter } from "@/lib/services/ai-service";

export const maxDuration = 60;

export async function GET() {
  try {
    const userId = await getAuthUserId();

    const rows = await db
      .select()
      .from(coverLetters)
      .where(eq(coverLetters.userId, userId))
      .orderBy(desc(coverLetters.createdAt));

    return NextResponse.json(
      rows.map((cl) => ({
        id: cl.id,
        content: cl.content,
        tone: cl.tone,
        length: cl.length,
        company_name: cl.companyName,
        job_title: cl.jobTitle,
        created_at: cl.createdAt,
      }))
    );
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("List cover letters error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
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
      tone = "professional",
      length = "medium",
      company_name,
      job_title,
      applicant_name,
    } = body;

    if (!resume_id || !jd_id) {
      return NextResponse.json(
        { detail: "resume_id and jd_id are required" },
        { status: 400 }
      );
    }

    // Check plan and monthly cover letter limit
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        {
          detail:
            "Cover letter generation requires Pro or Premium plan",
        },
        { status: 402 }
      );
    }

    const clLimits: Record<string, number> = {
      free: 1,
      pro: 10,
      premium: -1,
    };
    const plan = user.plan || "free";
    const clLimit = clLimits[plan] ?? 1;

    if (clLimit === 0) {
      return NextResponse.json(
        {
          detail:
            "Cover letter generation requires Pro or Premium plan",
        },
        { status: 402 }
      );
    }

    if (clLimit !== -1) {
      const [monthCount] = await db
        .select({ value: count(coverLetters.id) })
        .from(coverLetters)
        .where(
          and(
            eq(coverLetters.userId, userId),
            gte(coverLetters.createdAt, monthStart())
          )
        );

      if ((monthCount?.value || 0) >= clLimit) {
        const upgradeMsg =
          plan === "free"
            ? "Upgrade to Pro for 10/month."
            : "Upgrade to Premium for unlimited.";
        return NextResponse.json(
          {
            detail: `Monthly cover letter limit reached (${clLimit}/month). ${upgradeMsg}`,
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

    // Fetch JD
    const [jd] = await db
      .select()
      .from(jobDescriptions)
      .where(
        and(eq(jobDescriptions.id, jd_id), eq(jobDescriptions.userId, userId))
      )
      .limit(1);

    if (!jd) {
      return NextResponse.json(
        { detail: "Job description not found" },
        { status: 404 }
      );
    }

    // Generate cover letter
    let content: string;
    try {
      content = await generateCoverLetter(
        resume.rawText || "",
        jd.rawText || "",
        tone,
        length,
        applicant_name,
        company_name || jd.company,
        job_title || jd.title
      );
    } catch (e: any) {
      return NextResponse.json(
        { detail: `Cover letter generation failed: ${e.message}` },
        { status: 500 }
      );
    }

    const clId = crypto.randomUUID();
    await db.insert(coverLetters).values({
      id: clId,
      userId,
      resumeId: resume_id,
      jdId: jd_id,
      content,
      tone,
      length,
      companyName: company_name || jd.company,
      jobTitle: job_title || jd.title,
    });

    const [newCl] = await db
      .select()
      .from(coverLetters)
      .where(eq(coverLetters.id, clId))
      .limit(1);

    return NextResponse.json(
      {
        id: newCl.id,
        content: newCl.content,
        tone: newCl.tone,
        length: newCl.length,
        company_name: newCl.companyName,
        job_title: newCl.jobTitle,
        created_at: newCl.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("Create cover letter error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
