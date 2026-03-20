import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, publicAiLimiter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-ip";
import { parseResume, parseSections } from "@/lib/services/resume-parser";
import { optimizeResumeSectional } from "@/lib/services/ai-service";
import { computeKeywordScore } from "@/lib/scoring/ats-scorer";

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

    // Compute missing keywords
    const [, , missingKeywords] = await computeKeywordScore(
      parsed.raw_text,
      jdText
    );

    // Run AI optimization (section-wise)
    let result;
    try {
      result = await optimizeResumeSectional(parsed.raw_text, jdText, missingKeywords);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      return NextResponse.json(
        { detail: `AI optimization failed: ${message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      optimized_text: result.optimized_text || "",
      changes_summary: result.changes_summary || [],
      optimized_sections: result.optimized_sections || {},
      structured_json: parseSections(result.optimized_text || ""),
    });
  } catch (error) {
    console.error("Public optimize error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
