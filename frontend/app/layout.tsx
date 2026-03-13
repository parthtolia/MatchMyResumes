import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })

const HAS_REAL_CLERK =
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").startsWith("pk_") &&
  !(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").includes("_...")

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
  const content = (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-inter antialiased bg-[#0a0a0f] text-white`}>
        {children}
      </body>
    </html>
  )

  if (!HAS_REAL_CLERK) return content

  return (
    <ClerkProvider
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#8b5cf6",
          colorBackground: "#0a0a0f",
          colorInputBackground: "rgba(255,255,255,0.05)",
        }
      }}
    >
      {content}
    </ClerkProvider>
  )
}
