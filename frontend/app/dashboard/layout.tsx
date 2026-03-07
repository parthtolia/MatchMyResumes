import { redirect } from "next/navigation"
import DashboardSidebar from "@/components/dashboard/Sidebar"

const hasRealClerk =
    (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").startsWith("pk_") &&
    !(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").includes("_...")

import { GlobalDataProvider } from "@/components/dashboard/GlobalDataProvider"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    if (hasRealClerk) {
        // Production: enforce Clerk auth
        const { auth } = await import("@clerk/nextjs/server")
        const { userId } = await auth()
        if (!userId) redirect("/sign-in")
    }
    // Dev mode (placeholder Clerk keys): skip auth, allow through

    return (
        <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
            <DashboardSidebar />
            <main className="flex-1 overflow-y-auto w-full">
                <div className="px-8 md:px-12 lg:px-16 pt-6 pb-12 w-full max-w-[1600px]">
                    <GlobalDataProvider>
                        {children}
                    </GlobalDataProvider>
                </div>
            </main>
        </div>
    )
}
