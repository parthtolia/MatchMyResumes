import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MatchMyResumes – ATS Resume Optimization Suite",
    short_name: "MatchMyResumes",
    description: "Optimize your resume for ATS, generate tailored cover letters, and track your job applications with AI-powered insights.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#8b5cf6",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  }
}
