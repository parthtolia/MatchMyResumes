"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
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
        <div className="w-full max-w-[1400px] flex flex-col gap-8 pb-10">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1 border-b border-white/15 pb-4">
                <h1 className="text-3xl lg:text-4xl font-semibold text-white tracking-tight">
                    Welcome, {user?.firstName ? user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1).toLowerCase() : "Developer"}!
                </h1>
                <p className="text-gray-400">Here's your job search overview</p>
            </motion.div>

            {/* Stats */}
            <div className="flex items-center justify-between mb-1">
                <span />
                {refreshing && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                        Syncing latest data…
                    </span>
                )}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, i) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="stat-card flex flex-col justify-between p-8 shadow-md border border-white/15 border-opacity-100"
                        style={{ minHeight: "160px" }}
                    >
                        <card.icon size={32} className={`${card.color} mb-6`} />
                        <div className="flex flex-col gap-1">
                            <div className={`text-5xl font-extrabold tracking-tight transition-all ${refreshing ? "text-white/50" : "text-white"}`}>{card.value}</div>
                            <div className="text-lg text-gray-400 font-semibold">{card.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-8">
                <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    {quickActions.map((action, i) => (
                        <motion.div
                            key={action.href}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 + 0.3 }}
                            className="h-full flex flex-col"
                        >
                            <Link
                                href={action.href}
                                className="flex-1 flex flex-col justify-between p-8 rounded-2xl border border-white/15 bg-[#111118] hover:border-violet-500/50 hover:bg-[#111122] transition-all group shadow-md"
                                style={{ minHeight: "200px" }}
                            >
                                <div className="flex flex-col gap-6">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:-translate-y-1 transition-transform`}>
                                        <action.icon size={26} className="text-white" />
                                    </div>
                                    <h3 className="font-bold text-white text-xl">{action.label}</h3>
                                </div>
                                <p className="text-sm text-gray-400 leading-relaxed font-medium mt-auto pt-6">{action.desc}</p>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Tips Section */}
            <div className="glass p-8 lg:p-10 shadow-lg rounded-2xl border border-white/15 flex flex-col gap-6 mt-4">
                <div className="flex items-center gap-4">
                    <Target size={28} className="text-violet-400" />
                    <div>
                        <h2 className="text-xl lg:text-2xl font-bold text-white">How ATS Systems Work</h2>
                        <p className="text-sm text-gray-400 mt-1">Applicant Tracking Systems filter resumes before a human reads them. Here is how to beat them:</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white/5 border border-white/10 p-5 rounded-xl space-y-3 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                            <CheckCircle size={18} /> Keyword Matching
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">ATS bots scan for exact hard skill matches. Extract the top keywords from the JD and ensure they exist contextually in your resume.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-5 rounded-xl space-y-3 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2 text-blue-400 font-semibold">
                            <CheckCircle size={18} /> Standard Formatting
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">Keep it simple. Use standard headers like "Experience" and "Education". Avoid complex tables, columns, or unusual graphics.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-5 rounded-xl space-y-3 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2 text-purple-400 font-semibold">
                            <CheckCircle size={18} /> Quantifiable Impact
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">Don't just list responsibilities. Show results with metrics, percentages, and dollars. e.g., "Increased sales by 15%".</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-5 rounded-xl space-y-3 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2 text-orange-400 font-semibold">
                            <CheckCircle size={18} /> Section Completeness
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">Ensure you have a dedicated Skills section, a professional Summary, and complete contact info including your LinkedIn URL.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-5 rounded-xl space-y-3 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2 text-rose-400 font-semibold">
                            <CheckCircle size={18} /> Content Density
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">An ATS prefers resumes between 400-800 words detailing the depth of your experience. Extreme brevity can penalize your score.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-5 rounded-xl space-y-3 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2 text-teal-400 font-semibold">
                            <CheckCircle size={18} /> Tailor Every Application
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">A generic resume won't completely cut it. Use our AI Optimizer to quickly reshape your bullet points for every single job description.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

