"use client"

import React, { useState, useEffect } from "react"
import { Check, X, Zap, Sparkles, FileText } from "lucide-react"
import api, { createCheckoutSession, verifySession } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useUser as useClerkUser, useSession } from "@clerk/nextjs"
import { useGlobalData } from "@/components/dashboard/GlobalDataProvider"

const HAS_REAL_CLERK =
    typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").startsWith("pk_") &&
    !(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").includes("_...")

function useUserSafe() {
    if (!HAS_REAL_CLERK) {
        return { isLoaded: true, isSignedIn: true, user: null }
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useClerkUser()
}

function useSessionSafe() {
    if (!HAS_REAL_CLERK) return { session: null }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSession()
}

const PLANS = [
    {
        id: "free",
        name: "Free",
        price: "$0",
        description: "Get started and explore the basics.",
        icon: <FileText className="h-5 w-5 text-gray-400" />,
        cta: "Current Plan",
        popular: false,
        borderClass: "border-white/10",
    },
    {
        id: "pro",
        name: "Pro",
        price: "$10",
        description: "Everything you need to land your next job faster.",
        icon: <Zap className="h-5 w-5 text-violet-400" />,
        cta: "Upgrade to Pro",
        popular: false,
        borderClass: "border-white/10",
    },
    {
        id: "premium",
        name: "Premium",
        price: "$25",
        description: "The ultimate edge in a competitive market.",
        icon: <Sparkles className="h-5 w-5 text-yellow-400" />,
        cta: "Go Premium",
        popular: true,
        borderClass: "border-violet-500",
    },
]

const FEATURES: { label: string; free: string; pro: string; premium: string }[] = [
    { label: "ATS Resume Score",       free: "5 / mo",   pro: "Unlimited", premium: "Unlimited" },
    { label: "Resume vs JD Match",     free: "5 / mo",   pro: "Unlimited", premium: "Unlimited" },
    { label: "Keyword Gap Analysis",   free: "✓",         pro: "✓",          premium: "✓" },
    { label: "AI Resume Optimization", free: "—",         pro: "10 / mo",   premium: "Unlimited" },
    { label: "AI Cover Letter",        free: "1 / mo",   pro: "10 / mo",   premium: "Unlimited" },
    { label: "Job Tracker",            free: "20 jobs",  pro: "200 jobs",  premium: "Unlimited" },
]

function CellValue({ value }: { value: string }) {
    if (value === "✓") return <Check className="h-4 w-4 text-emerald-400 mx-auto" />
    if (value === "—") return <X className="h-4 w-4 text-gray-600 mx-auto" />
    return <span className="text-sm text-zinc-300">{value}</span>
}

export default function PricingPage() {
    const { isLoaded, isSignedIn, user } = useUserSafe()
    const { session } = useSessionSafe()
    const { plan: globalPlan, refreshData } = useGlobalData()
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [checkoutError, setCheckoutError] = useState("")
    const router = useRouter()

    const planRank: Record<string, number> = { free: 0, pro: 1, premium: 2 }
    const currentPlan: string = globalPlan || "free"
    const currentRank = planRank[currentPlan] ?? 0

    useEffect(() => {
        const checkSession = async () => {
            if (!isLoaded) return
            const urlParams = new URLSearchParams(window.location.search)
            const sessionId = urlParams.get("session_id")
            if (sessionId) {
                try {
                    const token = await session?.getToken()
                    await verifySession(sessionId, token)
                    window.history.replaceState({}, document.title, window.location.pathname)
                    // Trigger GlobalDataProvider to re-fetch plan from /api/dashboard/init
                    window.dispatchEvent(new Event("planUpdated"))
                } catch (e) {
                    console.error("Failed to sync session", e)
                }
            }
        }
        checkSession()
    }, [isSignedIn, isLoaded, session])

    const handleSubscribe = async (planId: string) => {
        if (planId === "free") return
        if (isLoaded && !isSignedIn) {
            router.push("/sign-in?redirect_url=/dashboard/pricing")
            return
        }
        try {
            setLoadingId(planId)
            const token = await session?.getToken()
            const email = (user as any)?.primaryEmailAddress?.emailAddress || null
            const data = await createCheckoutSession(planId, email, token)
            if (data?.checkout_url) window.location.href = data.checkout_url
        } catch (error: any) {
            console.error("Failed to start checkout:", error)
            setCheckoutError(error.message || "Failed to start checkout. Please try again.")
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <div className="w-full pb-12 flex flex-col items-center">
            <div className="text-center max-w-2xl mt-4 mb-10 space-y-3">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-100">
                    Simple, transparent pricing
                </h1>
                <p className="text-lg text-zinc-400 leading-relaxed">
                    Invest in your career with powerful AI tools designed to help you stand out.
                </p>
            </div>

            {/* Plan cards */}
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                {PLANS.map((plan) => {
                    const rank = planRank[plan.id] ?? 0
                    const isCurrent = currentPlan === plan.id
                    const isOwned = currentRank > rank
                    const isLoading = loadingId === plan.id

                    let btnLabel = plan.cta
                    if (plan.id === "free") btnLabel = isCurrent ? "Current Plan" : "Included"
                    else if (isCurrent) btnLabel = "Current Plan"
                    else if (isOwned) btnLabel = "Included"

                    const btnDisabled = loadingId !== null || plan.id === "free" || isCurrent || isOwned

                    return (
                        <div
                            key={plan.id}
                            className={`relative rounded-2xl border p-6 bg-zinc-900/40 backdrop-blur-sm flex flex-col ${plan.borderClass} ${plan.popular ? "shadow-2xl shadow-violet-500/10" : ""}`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-violet-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                                    Most Popular
                                </div>
                            )}
                            <div className="flex items-center gap-2 mb-2">
                                {plan.icon}
                                <h3 className="text-lg font-bold text-zinc-100">{plan.name}</h3>
                                {isCurrent && (
                                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-semibold uppercase tracking-wider">
                                        Active
                                    </span>
                                )}
                            </div>
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                                <span className="text-zinc-400 text-sm">/month</span>
                            </div>
                            <p className="text-zinc-400 text-xs mb-5 flex-1">{plan.description}</p>
                            <button
                                className={`w-full py-3 rounded-xl transition-all text-sm font-semibold ${
                                    plan.popular && !isCurrent && !isOwned
                                        ? "bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20"
                                        : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                                } disabled:opacity-40 disabled:cursor-not-allowed`}
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={btnDisabled}
                            >
                                {isLoading ? "Redirecting…" : btnLabel}
                            </button>
                        </div>
                    )
                })}
            </div>

            {/* Checkout error */}
            {checkoutError && (
                <div className="w-full max-w-4xl p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center mb-2">
                    {checkoutError}
                </div>
            )}

            {/* Feature comparison table */}
            <div className="w-full max-w-4xl rounded-2xl border border-white/10 overflow-hidden">
                <div className="grid grid-cols-4 bg-white/5 border-b border-white/10">
                    <div className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Feature</div>
                    {PLANS.map(p => (
                        <div key={p.id} className="p-4 text-center text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                            {p.name}
                        </div>
                    ))}
                </div>
                {FEATURES.map((f, i) => (
                    <div
                        key={f.label}
                        className={`grid grid-cols-4 border-b border-white/5 last:border-0 ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}
                    >
                        <div className="p-4 text-sm text-zinc-300">{f.label}</div>
                        <div className="p-4 flex items-center justify-center"><CellValue value={f.free} /></div>
                        <div className="p-4 flex items-center justify-center"><CellValue value={f.pro} /></div>
                        <div className="p-4 flex items-center justify-center"><CellValue value={f.premium} /></div>
                    </div>
                ))}
            </div>

            <div className="mt-10 text-center text-sm text-zinc-500">
                <p>Not ready to upgrade?{" "}
                    <button onClick={() => router.push("/dashboard")} className="text-violet-400 hover:underline">
                        Return to Dashboard
                    </button>
                </p>
            </div>
        </div>
    )
}
