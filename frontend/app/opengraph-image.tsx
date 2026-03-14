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
          background: "linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 35%, #2d1b69 65%, #0a0a0f 100%)",
          fontFamily: "sans-serif",
          padding: "50px 60px",
        }}
      >
        {/* Left side — branding & text */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            gap: "20px",
          }}
        >
          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: "white",
              letterSpacing: "-1.5px",
              lineHeight: 1.15,
            }}
          >
            Beat the ATS.
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: "#a78bfa",
              letterSpacing: "-1.5px",
              lineHeight: 1.15,
            }}
          >
            Land Interviews.
          </div>
          <div
            style={{
              fontSize: 22,
              color: "#9ca3af",
              lineHeight: 1.5,
              marginTop: "8px",
              maxWidth: "440px",
            }}
          >
            AI-powered resume scoring, optimization & cover letter generation
          </div>
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "12px",
            }}
          >
            {["ATS Scoring", "AI Optimizer", "Cover Letters"].map((label) => (
              <div
                key={label}
                style={{
                  padding: "8px 20px",
                  borderRadius: "999px",
                  border: "1px solid rgba(139, 92, 246, 0.4)",
                  background: "rgba(139, 92, 246, 0.12)",
                  color: "#c4b5fd",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Right side — Score dashboard mockup */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "420px",
          }}
        >
          {/* Score card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "rgba(17, 17, 24, 0.9)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              borderRadius: "24px",
              padding: "36px 48px",
              gap: "16px",
              boxShadow: "0 0 60px rgba(139, 92, 246, 0.15)",
            }}
          >
            <div style={{ fontSize: 16, color: "#9ca3af", fontWeight: 500 }}>
              ATS Compatibility Score
            </div>
            {/* Score circle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "140px",
                height: "140px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(139, 92, 246, 0.15))",
                border: "4px solid rgba(34, 197, 94, 0.6)",
                position: "relative",
              }}
            >
              <div style={{ fontSize: 56, fontWeight: 800, color: "#22c55e" }}>
                92
              </div>
            </div>
            {/* Score breakdown bars */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                width: "280px",
                marginTop: "8px",
              }}
            >
              {[
                { label: "Keywords", score: 95, color: "#22c55e" },
                { label: "Formatting", score: 88, color: "#a78bfa" },
                { label: "Sections", score: 92, color: "#22c55e" },
                { label: "Impact", score: 85, color: "#a78bfa" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      color: "#9ca3af",
                      width: "80px",
                      textAlign: "right",
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      height: "8px",
                      borderRadius: "4px",
                      background: "rgba(255,255,255,0.08)",
                      display: "flex",
                    }}
                  >
                    <div
                      style={{
                        width: `${item.score}%`,
                        height: "100%",
                        borderRadius: "4px",
                        background: item.color,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 13, color: item.color, width: "28px" }}>
                    {item.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom watermark */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            left: 60,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 700, color: "white" }}>
            MatchMyResumes
          </div>
          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }}>
            matchmyresumes.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
