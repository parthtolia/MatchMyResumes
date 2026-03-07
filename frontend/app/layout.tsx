import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "MatchMyResumes – ATS Resume Optimization Suite",
  description: "Optimize your resume for ATS, generate tailored cover letters, and track your job applications with AI-powered insights.",
  keywords: ["ATS resume", "resume optimization", "cover letter", "job search", "AI resume"],
  openGraph: {
    title: "MatchMyResumes",
    description: "Beat the ATS with AI-powered resume optimization",
    type: "website",
  },
}

const HAS_REAL_CLERK =
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").startsWith("pk_") &&
  !(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").includes("_...")

import { dark } from "@clerk/themes"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const content = (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-inter antialiased bg-[#0a0a0f] text-white`}>
        {children}
      </body>
    </html>
  )

  return HAS_REAL_CLERK ? (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#8b5cf6", // violet-500
          colorBackground: "#0a0a0f",
          colorInputBackground: "rgba(255,255,255,0.05)",
        }
      }}
    >
      {content}
    </ClerkProvider>
  ) : content
}
