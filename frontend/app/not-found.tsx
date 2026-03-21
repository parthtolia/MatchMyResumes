import Link from "next/link"
import { Home, ScanSearch, FileText, BookOpen, ArrowRight, GitCompareArrows } from "lucide-react"

const links = [
  {
    href: "/",
    icon: Home,
    title: "Home",
    description: "Back to the main page",
  },
  {
    href: "/ats-score-checker",
    icon: ScanSearch,
    title: "ATS Score Checker",
    description: "Check your resume's ATS compatibility",
  },
  {
    href: "/resume-examples",
    icon: FileText,
    title: "Resume Examples",
    description: "Browse professional resume samples",
  },
  {
    href: "/blog",
    icon: BookOpen,
    title: "Blog",
    description: "Career tips and resume advice",
  },
  {
    href: "/cover-letter-generator",
    icon: FileText,
    title: "Cover Letter Generator",
    description: "Create tailored cover letters with AI",
  },
  {
    href: "/alternatives",
    icon: GitCompareArrows,
    title: "Compare Tools",
    description: "See why MatchMyResumes is the best choice",
  },
]

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-8xl font-bold gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-3">
          Page Not Found
        </h2>
        <p className="text-gray-400 mb-10">
          Sorry, the page you're looking for doesn't exist or has been moved.
          Try one of these instead:
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-violet-500/40 hover:bg-white/[0.06]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                <link.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{link.title}</p>
                <p className="text-xs text-gray-500">{link.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-gray-600 transition group-hover:text-violet-400 group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
