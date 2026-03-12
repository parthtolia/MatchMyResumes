import { redirect } from "next/navigation"
import MobileDashboard from "@/components/dashboard/MobileDashboard"
import { ErrorBoundaryWrapper } from "./ErrorBoundaryWrapper"

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
        <GlobalDataProvider>
            <MobileDashboard>
                <ErrorBoundaryWrapper>
                    {children}
                </ErrorBoundaryWrapper>
            </MobileDashboard>
        </GlobalDataProvider>
    )
}
