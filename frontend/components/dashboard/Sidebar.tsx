"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { UserButton, useUser as useClerkUser } from "@clerk/nextjs"
import api from "@/lib/api"
import {
    LayoutDashboard, FileText, Zap, Mail,
    Briefcase, Settings, BarChart3, CreditCard, ScanSearch, X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/ui/Logo"

const HAS_REAL_CLERK =
    (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").startsWith("pk_") &&
    !(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").includes("_...")

// Safe hook: bypass useUser when ClerkProvider isn't present
function useUserSafe() {
    if (!HAS_REAL_CLERK) {
        return { user: null, isLoaded: true }
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useClerkUser()
}

const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/cv-analysis", icon: ScanSearch, label: "Resume ATS Score" },
    { href: "/dashboard/scan", icon: BarChart3, label: "JD Match Score" },
    { href: "/dashboard/optimize", icon: Zap, label: "AI Optimizer" },
    { href: "/dashboard/cover-letter", icon: Mail, label: "Cover Letter" },
    { href: "/dashboard/resumes", icon: FileText, label: "My Resumes" },
    { href: "/dashboard/tracker", icon: Briefcase, label: "Job Tracker" },
    { href: "/dashboard/pricing", icon: CreditCard, label: "Pricing" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
]

export default function DashboardSidebar({ onClose }: { onClose?: () => void } = {}) {
    const pathname = usePathname()
    const { user, isLoaded } = useUserSafe()
    const [plan, setPlan] = useState<string>("free")

    useEffect(() => {
        const fetchPlan = () => {
            if (isLoaded) {
                api.get("/api/subscriptions/status").then((r: any) => setPlan(r.data.plan)).catch(() => { })
            }
        }
        fetchPlan()
        window.addEventListener("planUpdated", fetchPlan)
        return () => window.removeEventListener("planUpdated", fetchPlan)
    }, [isLoaded])

    const displayName = HAS_REAL_CLERK
        ? (user?.firstName || user?.fullName?.split(" ")[0] || "User")
        : "Developer"

    const displaySub = HAS_REAL_CLERK
        ? (user?.primaryEmailAddress?.emailAddress || "Account")
        : "Local Mode"

    return (
        <aside className="w-60 h-screen flex flex-col border-r border-white/15 bg-[#0d0d14] shrink-0">
            {/* Logo */}
            <div className="p-6 pt-6 pb-5 border-b border-white/15 flex items-center justify-between">
                <Link href="/">
                    <div className="scale-[0.80] origin-left whitespace-nowrap">
                        <Logo />
                    </div>
                </Link>
                {onClose && (
                    <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white transition-colors" aria-label="Close menu">
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 px-6 pt-4 space-y-2 overflow-y-auto">
                {navItems.map(item => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={cn("sidebar-item overflow-hidden", isActive && "active")}
                        >
                            <item.icon size={20} />
                            <span className="text-[13px] font-medium truncate">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* User */}
            <div className="p-5 pb-5 border-t border-white/15">
                <div className="flex items-center gap-3">
                    {HAS_REAL_CLERK ? (
                        <UserButton afterSignOutUrl="/" appearance={{
                            elements: { avatarBox: "w-9 h-9" }
                        }} />
                    ) : (
                        <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white text-[10px] tracking-wider font-bold">
                            DEV
                        </div>
                    )}
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white truncate">{displayName}</span>
                            {plan !== "free" && (
                                <span className={`px-1.5 py-[1px] rounded text-[9px] font-bold uppercase tracking-wider ${plan === 'premium' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-violet-500/20 text-violet-400'}`}>
                                    {plan}
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-gray-500 truncate">{displaySub}</span>
                    </div>
                </div>
            </div>
        </aside>
    )
}
