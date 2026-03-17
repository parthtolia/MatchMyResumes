"use client"
import { useUser as useClerkUser } from "@clerk/nextjs"
import { User, Shield } from "lucide-react"

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

export default function SettingsPage() {
    const { user } = useUserSafe()

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-gray-400 text-sm mt-1">Manage your account</p>
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
