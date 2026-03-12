"use client"
import { useState, useEffect } from "react"
import { LazyMotion, domAnimation, m } from "framer-motion"
import {
    FileText, BarChart3, Mail, Briefcase,
    TrendingUp, Clock, CheckCircle, Target
} from "lucide-react"
import Link from "next/link"
import { useUser as useClerkUser } from "@clerk/nextjs"
import api from "@/lib/api"

const HAS_REAL_CLERK =
    typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").startsWith("pk_") &&
    !(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").includes("_...")

// Custom hook to bypass useUser when ClerkProvider is disabled
function useUserSafe() {
    if (!HAS_REAL_CLERK) {
        return { user: { firstName: "Developer" }, isLoaded: true, isSignedIn: true }
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useClerkUser()
}

interface DashboardStats {
    resumes: number
    scans: number
    cover_letters: number
    applications: number
}

export default function DashboardPage() {
    const { user, isLoaded, isSignedIn } = useUserSafe()

    const CACHE_KEY = "dashboard_stats_cache"
    const [stats, setStats] = useState<DashboardStats>({ resumes: 0, scans: 0, cover_letters: 0, applications: 0 })
    const [refreshing, setRefreshing] = useState(true) // true until fresh data arrives

    useEffect(() => {
        try {
            const cached = localStorage.getItem(CACHE_KEY)
            if (cached) setStats(JSON.parse(cached))
        } catch { }

        const fetchStats = async () => {
            if (!isLoaded || !isSignedIn) return
            try {
                const res = await api.get("/api/dashboard/stats")
                setStats(res.data)
                localStorage.setItem(CACHE_KEY, JSON.stringify(res.data))
            } catch (error) {
                console.error("Failed to load dashboard statistics", error)
            } finally {
                setRefreshing(false)
            }
        }
        fetchStats()
    }, [isLoaded, isSignedIn])

    const quickActions = [
        { href: "/dashboard/cv-analysis", icon: Target, label: "Resume ATS Score", desc: "Get an instant standalone ATS readiness score", color: "from-emerald-500 to-teal-500" },
        { href: "/dashboard/scan", icon: BarChart3, label: "JD Match Score", desc: "Score your resume against a specific job description", color: "from-violet-500 to-purple-600" },
        { href: "/dashboard/optimize", icon: Briefcase, label: "AI Optimizer", desc: "Enhance your resume using AI", color: "from-blue-500 to-cyan-500" },
        { href: "/dashboard/cover-letter", icon: Mail, label: "Cover Letter", desc: "Create a tailored cover letter", color: "from-orange-500 to-amber-500" },
    ]

    const statCards = [
        { icon: FileText, label: "Resumes Stored", value: stats.resumes, color: "text-violet-400" },
        { icon: BarChart3, label: "ATS Scans", value: stats.scans, color: "text-blue-400" },
        { icon: Mail, label: "Cover Letters", value: stats.cover_letters, color: "text-emerald-400" },
        { icon: Briefcase, label: "Applications", value: stats.applications, color: "text-orange-400" },
    ]

    return (
        <LazyMotion features={domAnimation}>
        <div className="w-full max-w-[1400px] flex flex-col gap-10 pb-4 min-h-[80vh]">
            {/* Header */}
            <m.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between border-b border-white/15 pb-3">
                <h1 className="text-2xl font-semibold text-white tracking-tight">
                    Welcome, {user?.firstName ? user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1).toLowerCase() : "Developer"}!
                </h1>
                {refreshing && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                        Syncing…
                    </span>
                )}
            </m.div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {statCards.map((card, i) => (
                    <m.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="stat-card flex flex-col justify-between p-6 shadow-md border border-white/15 border-opacity-100"
                        style={{ minHeight: "130px" }}
                    >
                        <card.icon size={24} className={`${card.color} mb-3`} />
                        <div className="flex flex-col gap-1">
                            <div className={`text-4xl font-extrabold tracking-tight transition-all ${refreshing ? "text-white/50" : "text-white"}`}>{card.value}</div>
                            <div className="text-sm text-gray-400 font-semibold">{card.label}</div>
                        </div>
                    </m.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-5">
                <h2 className="text-base font-semibold text-gray-300">Quick Actions</h2>
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
                    {quickActions.map((action, i) => (
                        <m.div
                            key={action.href}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 + 0.3 }}
                            className="h-full flex flex-col"
                        >
                            <Link
                                href={action.href}
                                className="flex-1 flex flex-col justify-between p-5 rounded-xl border border-white/15 bg-[#111118] hover:border-violet-500/50 hover:bg-[#111122] transition-all group shadow-md"
                                style={{ minHeight: "150px" }}
                            >
                                <div className="flex flex-col gap-2">
                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:-translate-y-0.5 transition-transform shrink-0`}>
                                        <action.icon size={18} className="text-white" />
                                    </div>
                                    <h3 className="font-bold text-white text-sm">{action.label}</h3>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed mt-1">{action.desc}</p>
                            </Link>
                        </m.div>
                    ))}
                </div>
            </div>

            {/* Tips Section */}
            <div className="glass p-5 shadow-lg rounded-xl border border-white/15 flex flex-col gap-4 -mt-4 flex-1">
                <div className="flex items-center gap-3">
                    <Target size={20} className="text-violet-400 shrink-0" />
                    <h2 className="text-sm font-bold text-white">How ATS Systems Work</h2>
                    <p className="text-xs text-gray-500 hidden lg:block">Filter resumes before a human reads them — here's how to beat them:</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 flex-1">
                    {[
                        { color: "text-emerald-400", title: "Keyword Match", tip: "Include exact hard skills from the JD contextually in your resume." },
                        { color: "text-blue-400", title: "Formatting", tip: "Use standard headers. Avoid tables, columns, or graphics." },
                        { color: "text-purple-400", title: "Quantification", tip: "Show results with metrics. e.g. \"Increased sales by 15%\"." },
                        { color: "text-orange-400", title: "Section Score", tip: "Include Skills, Summary, and LinkedIn URL sections." },
                        { color: "text-rose-400", title: "Content Density", tip: "Target 400–800 words for optimal ATS scoring." },
                        { color: "text-teal-400", title: "Tailor Each App", tip: "Use the AI Optimizer to reshape bullets for each job description." },
                    ].map(t => (
                        <div key={t.title} className="bg-white/5 border border-white/10 p-4 rounded-lg hover:bg-white/10 transition-colors flex flex-col gap-2">
                            <div className={`flex items-center gap-1.5 ${t.color} font-semibold text-xs`}>
                                <CheckCircle size={12} /> {t.title}
                            </div>
                            <p className="text-[11px] text-gray-400 leading-relaxed">{t.tip}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        </LazyMotion>
    )
}

