import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import Script from "next/script"
import { OrganizationJsonLd, WebAppJsonLd } from "@/components/JsonLd"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })

const HAS_REAL_CLERK =
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").startsWith("pk_") &&
  !(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").includes("_...")

export const metadata: Metadata = {
  title: "MatchMyResumes – Match My Resume to Job Description | Free ATS Score Checker",
  description: "Match my resume to any job description and get an instant ATS score. Free resume match tool with AI-powered optimization, keyword gap analysis, and tailored cover letter generation.",
  keywords: ["match my resume", "match resume to job description", "resume job match tool", "ATS resume match", "ATS resume score", "resume optimization", "cover letter generator", "AI resume", "job search tools"],
  openGraph: {
    title: "MatchMyResumes – Match My Resume to Any Job Description | Free ATS Tools",
    description: "Match my resume to any job description with AI. Free ATS score checker, resume optimization, keyword gap analysis, and cover letter generator.",
    type: "website",
    siteName: "MatchMyResumes",
    url: "https://matchmyresumes.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MatchMyResumes – Beat the ATS with AI-Powered Resume Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MatchMyResumes – Match My Resume to Any Job | Free ATS Tools",
    description: "Match my resume to any job description. Free ATS score checker, AI resume optimizer, and cover letter generator.",
    images: ["/og-image.png"],
  },
  metadataBase: new URL("https://matchmyresumes.com"),
  alternates: { canonical: "https://matchmyresumes.com" },
  icons: {
    icon: [
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const content = (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-inter antialiased bg-[#0a0a0f] text-white`}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-JELDQCCJBS"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JELDQCCJBS');
          `}
        </Script>
        <OrganizationJsonLd />
        <WebAppJsonLd />
        {children}
        <SpeedInsights />
        <Analytics />
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
