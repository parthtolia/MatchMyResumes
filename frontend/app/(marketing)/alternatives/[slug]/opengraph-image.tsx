import { ImageResponse } from "next/og"
import { competitors, getCompetitorBySlug } from "../data"

export const runtime = "nodejs"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export async function generateStaticParams() {
  return competitors.map((c) => ({ slug: c.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const competitor = getCompetitorBySlug(slug)

  if (!competitor) {
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
        <div style={{ fontSize: 32, color: "#a0a0a0", marginBottom: "20px" }}>Best</div>
        <div
          style={{
            fontSize: 72,
            fontWeight: "bold",
            marginBottom: "20px",
            background: "linear-gradient(90deg, #6c5ce7 0%, #00b894 100%)",
            backgroundClip: "text",
            color: "transparent",
            WebkitBackgroundClip: "text",
          }}
        >
          {competitor.name}
        </div>
        <div style={{ fontSize: 36, color: "#b0b0b0", marginBottom: "40px" }}>
          Alternative in 2026
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            marginBottom: "40px",
            fontSize: 28,
            color: "#a0a0a0",
          }}
        >
          <span style={{ color: "#6c5ce7", fontWeight: "bold" }}>MatchMyResumes</span>
          <span>vs</span>
          <span>{competitor.name}</span>
        </div>
        <div style={{ fontSize: 20, color: "#a0a0a0", maxWidth: "900px", lineHeight: "1.5" }}>
          Compare features, pricing, and functionality to find the best free resume optimization tool.
        </div>
        <div style={{ fontSize: 24, color: "#a0a0a0", marginTop: "40px" }}>matchmyresumes.com</div>
      </div>
    ),
    size
  )
}
