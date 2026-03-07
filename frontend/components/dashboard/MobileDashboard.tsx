"use client"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import DashboardSidebar from "./Sidebar"

export default function MobileDashboard({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar — fixed drawer on mobile, static on desktop */}
            <div className={`fixed md:static inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 shrink-0`}>
                <DashboardSidebar onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto w-full min-w-0">
                {/* Mobile top bar */}
                <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#0d0d14] sticky top-0 z-10">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-400 hover:text-white transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu size={22} />
                    </button>
                    <span className="text-white font-semibold text-sm">MatchMyResumes</span>
                </div>
                <div className="px-4 md:px-8 lg:px-12 pt-4 pb-6 w-full max-w-[1600px]">
                    {children}
                </div>
            </main>
        </div>
    )
}
