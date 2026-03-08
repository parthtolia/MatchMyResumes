"use client"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import DashboardSidebar from "./Sidebar"
import { Logo } from "@/components/ui/Logo"
import { UserButton } from "@clerk/nextjs"
import Link from "next/link"

const HAS_REAL_CLERK =
    (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").startsWith("pk_") &&
    !(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").includes("_...")

export default function MobileDashboard({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex h-screen bg-[#0a0a0f] overflow-hidden relative">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar — absolute drawer on mobile, static on desktop */}
            <div className={`absolute md:static inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 shrink-0`}>
                <DashboardSidebar onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto w-full min-w-0">
                {/* Mobile top bar — hamburger toggles to X when open */}
                <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0d0d14] sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(prev => !prev)}
                            className="text-gray-400 hover:text-white transition-colors"
                            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
                        >
                            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                        <Link href="/dashboard">
                            <div style={{ zoom: "0.52" }} className="whitespace-nowrap">
                                <Logo />
                            </div>
                        </Link>
                    </div>
                    {HAS_REAL_CLERK ? (
                        <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0">DEV</div>
                    )}
                </div>
                <div className="px-4 md:px-8 lg:px-12 pt-4 pb-6 w-full max-w-[1600px]">
                    {children}
                </div>
            </main>
        </div>
    )
}
