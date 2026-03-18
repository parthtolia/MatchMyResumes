import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, publicAiLimiter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-ip";
import { parseResume } from "@/lib/services/resume-parser";
import { generateEmbedding } from "@/lib/services/embedding-service";
import { computeAtsScore } from "@/lib/scoring/ats-scorer";

export const maxDuration = 60;

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimited = await checkRateLimit(publicAiLimiter, ip);
    if (rateLimited) return rateLimited;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const jdText = (formData.get("jd_text") as string) || "";

    if (!file) {
      return NextResponse.json(
        { detail: "Resume file is required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { detail: "Only PDF and DOCX files are supported" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { detail: "File size must be under 5MB" },
        { status: 400 }
      );
    }

    if (jdText.length < 50) {
      return NextResponse.json(
        { detail: "Job description must be at least 50 characters" },
        { status: 400 }
      );
    }

    if (jdText.length > 10000) {
      return NextResponse.json(
        { detail: "Job description must be under 10,000 characters" },
        { status: 400 }
      );
    }

    const fileType = file.type === "application/pdf" ? "pdf" : "docx";
    const buffer = Buffer.from(await file.arrayBuffer());

    let parsed;
    try {
      parsed = await parseResume(buffer, fileType);
    } catch {
      return NextResponse.json(
        { detail: "Could not parse the uploaded file" },
        { status: 400 }
      );
    }

    if (!parsed.raw_text || parsed.raw_text.length < 50) {
      return NextResponse.json(
        { detail: "Resume appears to be empty or too short" },
        { status: 400 }
      );
    }

    // Generate embeddings in parallel
    const [resumeEmbedding, jdEmbedding] = await Promise.all([
      generateEmbedding(parsed.raw_text).catch(() => null),
      generateEmbedding(jdText).catch(() => null),
    ]);

    // Use the same computeAtsScore as the authenticated /api/resumes/score route
    const scoreData = await computeAtsScore(
      parsed.raw_text,
      jdText,
      resumeEmbedding,
      jdEmbedding,
      parsed.structured_json,
      fileType
    );

    return NextResponse.json({
      total_score: scoreData.total_score,
      breakdown: {
        keyword_score: scoreData.keyword_score,
        semantic_score: scoreData.semantic_score,
        formatting_score: scoreData.formatting_score,
        section_score: scoreData.section_score,
        quantification_score: scoreData.quantification_score,
        details: scoreData.breakdown,
      },
      matched_keywords: scoreData.matched_keywords || [],
      missing_keywords: scoreData.missing_keywords || [],
    });
  } catch (error) {
    console.error("Public JD match error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
