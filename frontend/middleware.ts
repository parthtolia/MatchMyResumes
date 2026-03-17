import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/health",
    "/api/tools(.*)",
])

export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
        await auth.protect()
    }
})

export const config = {
    matcher: [
        // Only run middleware on auth-required routes (dashboard, sign-in, sign-up, api)
        // Skip marketing pages (/, /privacy, /terms) to avoid loading Clerk server-side
        "/dashboard(.*)",
        "/sign-in(.*)",
        "/sign-up(.*)",
        "/(api|trpc)(.*)",
    ],
}
