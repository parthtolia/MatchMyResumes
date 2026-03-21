import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, publicAiLimiter } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-ip";
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

    const fileType = file.type === "application/pdf" ? "pdf" : "docx";
    const buffer = Buffer.from(await file.arrayBuffer());

    // Parse the resume
    let resumeText = "";
    try {
      const { parseResume } = await import("@/lib/services/resume-parser");
      const parsed = await parseResume(buffer, fileType);
      resumeText = parsed.raw_text || "";

      if (resumeText.length < 50) {
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

    // Run extraction pipeline with empty JD for general polish
    let pipelineResult;
    try {
      pipelineResult = await runExtractionPipeline(
        buffer,
        fileType,
        "", // Empty JD for general polish
        [] // No missing keywords
      );
    } catch (e: any) {
      return NextResponse.json(
        { detail: `Polish failed: ${e.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      optimized_text: pipelineResult.optimized_text || "",
      changes_summary: pipelineResult.changes_summary || [],
      structured_resume: pipelineResult.optimized,
      contact_info: {
        name: pipelineResult.optimized?.name,
        email: pipelineResult.optimized?.email,
        phone: pipelineResult.optimized?.phone,
        location: pipelineResult.optimized?.location,
        title: pipelineResult.optimized?.title,
      },
    });
  } catch (error) {
    console.error("Polish resume error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
