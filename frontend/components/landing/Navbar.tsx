"use client"
import Link from "next/link"
import { UserButton, useUser as useClerkUser } from "@clerk/nextjs"
import { Logo } from "@/components/ui/Logo"
import { ChevronDown } from "lucide-react"
import { getToolHref } from "@/lib/tool-routes"

const HAS_REAL_CLERK =
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").startsWith("pk_") &&
  !(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").includes("_...")

function useUserSafe() {
  if (!HAS_REAL_CLERK) {
    return { user: null, isLoaded: true, isSignedIn: false }
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useClerkUser()
}

const tools = [
  { href: "/ats-score-checker", label: "ATS Score Checker" },
  { href: "/resume-job-description-match", label: "Resume vs JD Match" },
  { href: "/ai-resume-optimizer", label: "AI Resume Optimizer" },
  { href: "/cover-letter-generator", label: "Cover Letter Generator" },
]

export default function Navbar() {
  const { isLoaded, isSignedIn } = useUserSafe()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 border-b border-white/5 bg-black/20 backdrop-blur-xl">
      <Link href="/" className="scale-75 sm:scale-100 origin-left">
        <Logo />
      </Link>
      <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
        <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
        {/* Tools dropdown */}
        <div className="relative group">
          <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
            Tools <ChevronDown size={14} className="group-hover:text-white transition-colors" />
          </span>
          <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <div className="bg-[#111118] border border-white/10 rounded-xl p-2 min-w-[220px] shadow-xl shadow-black/40">
              {tools.map(tool => (
                <Link
                  key={tool.href}
                  href={getToolHref(tool.href, !!isSignedIn)}
                  className="block px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  {tool.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <Link href="/#how-it-works" className="hover:text-white transition-colors">How it works</Link>
        <Link href="/#faq" className="hover:text-white transition-colors">FAQ</Link>
        <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
      </div>
      <div className="flex items-center gap-3">
        {isLoaded && isSignedIn ? (
          <>
            <Link
              href="/dashboard"
              className="text-sm text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 font-medium"
            >
              Dashboard
            </Link>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9",
                },
              }}
            />
          </>
        ) : (
          <>
            <Link href="/sign-in" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2 hidden sm:block">
              Sign In
            </Link>
            <Link href="/sign-up" className="btn-glow text-xs sm:text-sm text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl font-medium whitespace-nowrap">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
