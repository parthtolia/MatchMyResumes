import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/pricing",
    "/api/subscriptions/webhook",
])

// Detect placeholder Clerk keys — if not real keys, bypass auth for local dev
const CLERK_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ""
const hasRealClerk = CLERK_KEY.startsWith("pk_") && !CLERK_KEY.includes("_...")

export default hasRealClerk
    ? clerkMiddleware(async (auth, req) => {
        if (!isPublicRoute(req)) {
            await auth.protect()
        }
    })
    : function devMiddleware(_req: NextRequest) {
        // Dev mode: Clerk not configured, allow all routes through
        return NextResponse.next()
    }

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
}
