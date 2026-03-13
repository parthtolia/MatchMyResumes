import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobDescriptions, users } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getAuthUserId, handleAuthError, AuthError } from "@/lib/auth";
import { parseJobDescription } from "@/lib/services/jd-parser";
import { generateEmbedding } from "@/lib/services/embedding-service";

export async function GET() {
  try {
    const userId = await getAuthUserId();

    const rows = await db
      .select({
        id: jobDescriptions.id,
        title: jobDescriptions.title,
        company: jobDescriptions.company,
        parsedJson: jobDescriptions.parsedJson,
        createdAt: jobDescriptions.createdAt,
      })
      .from(jobDescriptions)
      .where(eq(jobDescriptions.userId, userId))
      .orderBy(desc(jobDescriptions.createdAt));

    return NextResponse.json(
      rows.map((j) => ({
        id: j.id,
        title: j.title,
        company: j.company,
        parsed_json: j.parsedJson,
        created_at: j.createdAt,
      }))
    );
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("List jobs error:", error);
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
    const { raw_text, title, company } = body;

    if (!raw_text || raw_text.length < 100 || raw_text.length > 50000) {
      return NextResponse.json(
        { detail: "raw_text must be between 100 and 50000 characters" },
        { status: 400 }
      );
    }

    // Check duplicate title
    if (title) {
      const [existing] = await db
        .select({ id: jobDescriptions.id })
        .from(jobDescriptions)
        .where(
          and(
            eq(jobDescriptions.userId, userId),
            eq(jobDescriptions.title, title)
          )
        )
        .limit(1);

      if (existing) {
        return NextResponse.json(
          {
            detail: `A job description titled '${title}' already exists. Use a different title or delete the existing one first.`,
          },
          { status: 409 }
        );
      }
    }

    // Ensure user exists
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!existingUser) {
      await db.insert(users).values({
        id: userId,
        email: `${userId}@placeholder.auth`,
        clerkId: userId,
        plan: "free",
        usageCount: 0,
        isActive: true,
        isAdmin: false,
      });
    }

    const parsed = parseJobDescription(raw_text);

    let embedding: number[] | null = null;
    try {
      embedding = await generateEmbedding(parsed.cleaned_text);
    } catch {
      embedding = null;
    }

    const jdId = crypto.randomUUID();
    await db.insert(jobDescriptions).values({
      id: jdId,
      userId,
      title: title || null,
      company: company || null,
      rawText: raw_text,
      parsedJson: parsed,
      embedding,
    });

    const [newJd] = await db
      .select()
      .from(jobDescriptions)
      .where(eq(jobDescriptions.id, jdId))
      .limit(1);

    return NextResponse.json(
      {
        id: newJd.id,
        title: newJd.title,
        company: newJd.company,
        parsed_json: newJd.parsedJson,
        created_at: newJd.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("Create JD error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
