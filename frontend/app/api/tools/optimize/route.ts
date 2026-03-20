import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, publicAiLimiter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-ip";
import { computeKeywordScore } from "@/lib/scoring/ats-scorer";
import { runExtractionPipeline } from "@/lib/services/resume-pipeline";

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

    // Compute missing keywords upfront for optimization step
    // For this, we need to quickly parse the resume first
    let initialKeywords: string[] = [];
    try {
      const { parseResume } = await import("@/lib/services/resume-parser");
      const parsed = await parseResume(buffer, fileType);
      if (parsed.raw_text && parsed.raw_text.length >= 50) {
        const [, , keywords] = await computeKeywordScore(parsed.raw_text, jdText);
        initialKeywords = keywords;
      } else {
        return NextResponse.json(
          { detail: "Resume appears to be empty or too short" },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { detail: "Could not parse the uploaded file" },
        { status: 400 }
      );
    }

    // Run new extraction pipeline
    let pipelineResult;
    try {
      pipelineResult = await runExtractionPipeline(
        buffer,
        fileType,
        jdText,
        initialKeywords
      );
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      console.error("Pipeline error:", message);
      return NextResponse.json(
        { detail: `Resume optimization failed: ${message}` },
        { status: 500 }
      );
    }

    // Return new response with structured data
    const response: any = {
      // Backward compat fields (empty now, but present)
      optimized_text: "",
      changes_summary: pipelineResult.changes_summary,
      optimized_sections: {},
      structured_json: {},

      // New fields from pipeline
      structured_resume: pipelineResult.optimized,
      missing_fields: pipelineResult.missing_fields,
      confidence_score: pipelineResult.confidence_score,

      // Contact info for backward compat
      contact_info: {
        name: pipelineResult.optimized.name,
        email: pipelineResult.optimized.email,
        phone: pipelineResult.optimized.phone,
        location: pipelineResult.optimized.location,
        title: pipelineResult.optimized.title,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Public optimize error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
