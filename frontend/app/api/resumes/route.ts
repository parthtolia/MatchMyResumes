import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resumes, users } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getAuthUserId, handleAuthError, AuthError } from "@/lib/auth";
import { ALLOWED_TYPES, MAX_FILE_SIZE } from "@/lib/plan-limits";
import { parseResume } from "@/lib/services/resume-parser";
import { generateEmbedding } from "@/lib/services/embedding-service";
import { checkRateLimit, generalLimiter } from "@/lib/rate-limit";

export async function GET() {
  try {
    const userId = await getAuthUserId();

    const rows = await db
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

    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        filename: r.filename,
        version_tag: r.versionTag,
        is_optimized: r.isOptimized,
        created_at: r.createdAt,
      }))
    );
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("List resumes error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId();

    // Rate limit
    const rateLimited = await checkRateLimit(generalLimiter, userId);
    if (rateLimited) return rateLimited;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const versionTag = (formData.get("version_tag") as string) || null;

    if (!file) {
      return NextResponse.json(
        { detail: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    let fileType = ALLOWED_TYPES[file.type];
    const filenameLower = (file.name || "").toLowerCase();
    if (!fileType) {
      if (filenameLower.endsWith(".pdf")) fileType = "pdf";
      else if (filenameLower.endsWith(".docx")) fileType = "docx";
      else {
        return NextResponse.json(
          { detail: "Only PDF and DOCX files are accepted" },
          { status: 400 }
        );
      }
    }

    // Check duplicate filename
    const [existing] = await db
      .select({ id: resumes.id })
      .from(resumes)
      .where(and(eq(resumes.userId, userId), eq(resumes.filename, file.name)))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        {
          detail: `A resume named '${file.name}' already exists. Rename the file or delete the existing one first.`,
        },
        { status: 409 }
      );
    }

    // Read file
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    if (fileBuffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { detail: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Parse resume
    let parsed;
    try {
      parsed = await parseResume(fileBuffer, fileType);
    } catch (e: any) {
      return NextResponse.json(
        { detail: `Failed to parse resume: ${e.message}` },
        { status: 422 }
      );
    }

    // Generate embedding (with timeout)
    let embedding: number[] | null = null;
    try {
      const embeddingPromise = generateEmbedding(parsed.raw_text);
      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 8000)
      );
      embedding = await Promise.race([embeddingPromise, timeoutPromise]);
    } catch {
      embedding = null;
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

    // Save resume
    const resumeId = crypto.randomUUID();
    await db.insert(resumes).values({
      id: resumeId,
      userId,
      filename: file.name,
      fileType,
      rawText: parsed.raw_text,
      structuredJson: parsed.structured_json,
      embedding,
      versionTag,
      isOptimized: false,
    });

    const [newResume] = await db
      .select()
      .from(resumes)
      .where(eq(resumes.id, resumeId))
      .limit(1);

    return NextResponse.json(
      {
        id: newResume.id,
        filename: newResume.filename,
        file_type: newResume.fileType,
        structured_json: newResume.structuredJson,
        version_tag: newResume.versionTag,
        created_at: newResume.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) return handleAuthError(error);
    console.error("Upload resume error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
