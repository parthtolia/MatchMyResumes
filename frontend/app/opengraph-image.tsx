import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "MatchMyResumes – ATS Resume Optimization Suite"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 40%, #2d1b69 70%, #0a0a0f 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: "white",
              letterSpacing: "-2px",
              lineHeight: 1.1,
              textAlign: "center",
            }}
          >
            MatchMyResumes
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: "#c4b5fd",
              textAlign: "center",
              maxWidth: "700px",
              lineHeight: 1.4,
            }}
          >
            Beat the ATS with AI-powered resume optimization
          </div>
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "16px",
            }}
          >
            {["ATS Scoring", "AI Optimizer", "Cover Letters"].map((label) => (
              <div
                key={label}
                style={{
                  padding: "10px 24px",
                  borderRadius: "999px",
                  border: "1px solid rgba(139, 92, 246, 0.5)",
                  background: "rgba(139, 92, 246, 0.15)",
                  color: "#e9d5ff",
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 16,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          matchmyresumes.com
        </div>
      </div>
    ),
    { ...size }
  )
}
