import { ImageResponse } from "next/og"
import { resumeExamples, getExampleBySlug } from "../data"

export const runtime = "nodejs"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export async function generateStaticParams() {
  return resumeExamples.map((ex) => ({ slug: ex.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const example = getExampleBySlug(slug)

  if (!example) {
    return new ImageResponse(<div>Not Found</div>, { ...size })
  }

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: '"Inter", "Helvetica Neue", sans-serif',
          padding: "60px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: "bold",
            marginBottom: "20px",
            background: "linear-gradient(90deg, #6c5ce7 0%, #00b894 100%)",
            backgroundClip: "text",
            color: "transparent",
            WebkitBackgroundClip: "text",
          }}
        >
          {example.title}
        </div>
        <div style={{ fontSize: 36, color: "#b0b0b0", marginBottom: "40px" }}>
          Resume Example & ATS Keywords (2026)
        </div>
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "40px",
            maxWidth: "1000px",
          }}
        >
          {example.keywords.slice(0, 6).map((keyword, i) => (
            <div
              key={i}
              style={{
                background: "rgba(108, 92, 231, 0.1)",
                border: "1px solid rgba(108, 92, 231, 0.3)",
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: 20,
                color: "#6c5ce7",
              }}
            >
              {keyword}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 24, color: "#a0a0a0" }}>matchmyresumes.com</div>
      </div>
    ),
    size
  )
}
