"use client"

import React, { useState, useEffect } from "react"
import { Check, Zap, Sparkles } from "lucide-react"
import api, { createCheckoutSession, verifySession } from "@/lib/api"
import { useRouter } from "next/navigation"
import { useUser as useClerkUser, useSession } from "@clerk/nextjs"

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

const tiers = [
    {
        name: "Pro",
        id: "pro",
        icon: <Zap className="h-6 w-6 text-violet-400" />,
        price: "$10",
        description: "Everything you need to land your next job faster.",
        features: [
            "Unlimited Resumes",
            "Unlimited Job Descriptions",
            "Advanced ATS Scoring",
            "Priority Support",
        ],
        cta: "Upgrade to Pro",
        popular: false,
    },
    {
        name: "Premium",
        id: "premium",
        icon: <Sparkles className="h-6 w-6 text-yellow-400" />,
        price: "$25",
        description: "The ultimate edge in a competitive market.",
        features: [
            "Everything in Pro",
            "AI Cover Letter Generation",
            "Unlimited Application Tracking",
            "Exclusive Resume Templates",
        ],
        cta: "Go Premium",
        popular: true,
    },
]

export default function PricingPage() {
    const { isLoaded, isSignedIn, user } = useUserSafe();
    const { session } = useSession() // Get clerk session
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [subStatus, setSubStatus] = useState<any>(null)
    const router = useRouter()

    const planRank: Record<string, number> = { "free": 0, "pro": 1, "premium": 2 }
    const currentRank = planRank[subStatus?.plan || "free"] || 0

    useEffect(() => {
        const checkSession = async () => {
            if (!isLoaded) return;
            const urlParams = new URLSearchParams(window.location.search)
            const sessionId = urlParams.get('session_id')

            if (sessionId) {
                try {
                    const token = await session?.getToken()
                    await verifySession(sessionId, token)
                    window.history.replaceState({}, document.title, window.location.pathname)
                    window.dispatchEvent(new Event("planUpdated")) // Notify Sidebar to refetch Pro badge
                } catch (e) {
                    console.error("Failed to sync session", e)
                }
            }

            if (isSignedIn) {
                api.get("/api/subscriptions/status").then((r: any) => setSubStatus(r.data)).catch(() => { })
            }
        }

        checkSession()
    }, [isSignedIn, isLoaded, session])

    const handleSubscribe = async (priceId: string) => {
        if (isLoaded && !isSignedIn) {
            router.push("/sign-in?redirect_url=/pricing")
            return
        }

        try {
            setLoadingId(priceId)
            const token = await session?.getToken()
            const email = user?.primaryEmailAddress?.emailAddress || null
            const data = await createCheckoutSession(priceId, email, token)
            if (data?.checkout_url) {
                window.location.href = data.checkout_url
            }
        } catch (error: any) {
            console.error("Failed to start checkout:", error)
            alert(error.message || "Failed to start checkout process")
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <div className="w-full pb-12 flex flex-col items-center">
            <div className="text-center max-w-2xl mt-4 mb-12 space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-100">
                    Simple, transparent pricing
                </h1>
                <p className="text-lg text-zinc-400 leading-relaxed">
                    Invest in your career with powerful AI tools designed to help you stand out.
                </p>
            </div>

            {subStatus?.plan && subStatus.plan !== "free" && (
                <div className="w-full max-w-2xl mb-12 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 text-center flex flex-col items-center">
                    <p className="text-violet-300">You are currently on the <strong className="capitalize">{subStatus.plan}</strong> plan.</p>
                </div>
            )}

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {tiers.map((tier) => (
                    <div
                        key={tier.id}
                        className={`relative rounded-2xl border p-8 bg-zinc-900/40 backdrop-blur-sm flex flex-col ${tier.popular ? "border-violet-500 shadow-2xl shadow-violet-500/10" : "border-white/10"
                            }`}
                    >
                        {tier.popular && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-violet-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                                Most Popular
                            </div>
                        )}

                        <div className="flex items-center gap-3 mb-4">
                            {tier.icon}
                            <h3 className="text-2xl font-bold text-zinc-100">{tier.name}</h3>
                        </div>

                        <p className="text-zinc-400 text-sm mb-6 h-10">{tier.description}</p>

                        <div className="mb-8 flex items-baseline gap-1">
                            <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                            <span className="text-zinc-400">/month</span>
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            {tier.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <Check className="h-5 w-5 text-violet-500 shrink-0" />
                                    <span className="text-zinc-300">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            className={`w-full py-4 rounded-xl transition-all text-base font-semibold ${tier.popular
                                ? "bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20"
                                : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                                } disabled:opacity-50`}
                            onClick={() => handleSubscribe(tier.id)}
                            disabled={loadingId !== null || currentRank >= (planRank[tier.id] || 0)}
                        >
                            {loadingId === tier.id ? "Redirecting..." :
                                subStatus?.plan === tier.id ? "Current Plan" :
                                    currentRank > (planRank[tier.id] || 0) ? `Included` : tier.cta}
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-16 text-center text-sm text-zinc-500">
                <p>Not ready to upgrade? <button onClick={() => router.push('/dashboard')} className="text-violet-400 hover:underline">Return to Dashboard</button></p>
            </div>
        </div>
    )
}
