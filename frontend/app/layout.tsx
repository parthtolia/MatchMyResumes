import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })

export const metadata: Metadata = {
  title: "MatchMyResumes – ATS Resume Optimization Suite",
  description: "Optimize your resume for ATS, generate tailored cover letters, and track your job applications with AI-powered insights.",
  keywords: ["ATS resume", "resume optimization", "cover letter", "job search", "AI resume"],
  openGraph: {
    title: "MatchMyResumes – ATS Resume Optimization Suite",
    description: "Beat the ATS with AI-powered resume optimization. Score, optimize, and tailor your resume for any job description.",
    type: "website",
    siteName: "MatchMyResumes",
    url: "https://matchmyresumes.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "MatchMyResumes – ATS Resume Optimization Suite",
    description: "Beat the ATS with AI-powered resume optimization.",
  },
  metadataBase: new URL("https://matchmyresumes.com"),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-inter antialiased bg-[#0a0a0f] text-white`}>
        {children}
      </body>
    </html>
  )
}
