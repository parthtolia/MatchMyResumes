"use client"
import { useUser as useClerkUser, useSession } from "@clerk/nextjs"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, CreditCard, Shield } from "lucide-react"
import api, { createPortalSession, verifySession } from "@/lib/api"
import Link from "next/link"

const HAS_REAL_CLERK =
    typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").startsWith("pk_") &&
    !(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").includes("_...")

// Custom hook to bypass useUser when ClerkProvider is disabled
function useUserSafe() {
    if (!HAS_REAL_CLERK) {
        return { user: { fullName: "Local Developer", emailAddresses: [{ emailAddress: "dev@localhost" }] }, isLoaded: true, isSignedIn: true }
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useClerkUser()
}

const PLAN_DISPLAY: Record<string, string> = {
    free: "Free",
    pro: "Pro",
    premium: "Premium",
}

export default function SettingsPage() {
    const { user } = useUserSafe()
    const { isLoaded, session } = useSession() // Get Clerk session
    const [subStatus, setSubStatus] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [managing, setManaging] = useState(false)

    useEffect(() => {
        if (!isLoaded) return

        api.get("/api/subscriptions/status")
            .then(r => setSubStatus(r.data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [isLoaded])

    const handleManage = async () => {
        try {
            setManaging(true)
            const token = await session?.getToken()
            const data = await createPortalSession(token)
            if (data?.portal_url) window.location.href = data.portal_url
        } catch (error: any) {
            alert(error.message || "Failed to open portal")
        } finally {
            setManaging(false)
        }
    }

    const plan = subStatus?.plan || "free"

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-gray-400 text-sm mt-1">Manage your account and subscription</p>
            </div>

            {/* Profile */}
            <div className="glass p-6">
                <div className="flex items-center gap-3 mb-4">
                    <User size={18} className="text-violet-400" />
                    <h2 className="font-semibold text-white">Profile</h2>
                </div>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Full Name</label>
                        <div className="input-styled opacity-60">{user?.fullName || "—"}</div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 block mb-1">Email</label>
                        <div className="input-styled opacity-60">{user?.emailAddresses[0]?.emailAddress || "—"}</div>
                    </div>
                    <p className="text-xs text-gray-500">To change your name or email, use the Clerk account portal.</p>
                    <button onClick={() => (window as any)?.Clerk?.openUserProfile()} className="text-sm text-violet-400 hover:text-violet-300 transition-colors underline">
                        Open Account Portal
                    </button>
                </div>
            </div>

            {/* Subscription */}
            <div className="glass p-6">
                <div className="flex items-center gap-3 mb-4">
                    <CreditCard size={18} className="text-violet-400" />
                    <h2 className="font-semibold text-white">Subscription</h2>
                </div>
                {loading ? (
                    <div className="animate-pulse h-20 bg-white/5 rounded-xl" />
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">{PLAN_DISPLAY[plan] || "Free"} Plan</span>
                                {subStatus?.status === "active" && (
                                    <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">Active</span>
                                )}
                            </div>
                        </div>
                        {plan === "free" && (
                            <Link href="/dashboard/pricing" className="block text-center btn-glow py-3 rounded-xl text-white font-semibold text-sm">
                                Upgrade to Pro — $10/month
                            </Link>
                        )}
                        {plan !== "free" && (
                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                <p className="text-xs text-gray-500">
                                    {subStatus?.current_period_end ? (
                                        <>
                                            Renews: {new Date(subStatus.current_period_end).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                                            {subStatus.cancel_at_period_end && " · Cancels at period end"}
                                        </>
                                    ) : (plan === "premium" ? "Premium Plan" : "Pro Plan")}
                                </p>
                                <button
                                    onClick={handleManage}
                                    disabled={managing}
                                    className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors bg-violet-500/10 hover:bg-violet-500/20 px-3 py-1.5 rounded-lg disabled:opacity-50"
                                >
                                    {managing ? "Opening Portal..." : "Manage Subscription"}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Security */}
            <div className="glass p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Shield size={18} className="text-violet-400" />
                    <h2 className="font-semibold text-white">Security</h2>
                </div>
                <div className="space-y-2 text-sm text-gray-400">
                    <p>Authentication powered by <strong className="text-white">Clerk</strong> — industry-standard security.</p>
                    <p>All data encrypted in transit (TLS) and at rest.</p>
                    <p>Resume files are processed server-side and not stored permanently.</p>
                </div>
            </div>
        </div>
    )
}
