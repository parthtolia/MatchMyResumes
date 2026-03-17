"use client"
import React, { createContext, useContext, useEffect, useState } from "react"
import { useUser as useClerkUser } from "@clerk/nextjs"
import api from "@/lib/api"

const HAS_REAL_CLERK =
    typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").startsWith("pk_") &&
    !(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").includes("_...")

function useUserSafe() {
    if (!HAS_REAL_CLERK) return { isLoaded: true, isSignedIn: true, userId: "dev-user" as string | null }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { isLoaded, isSignedIn, user } = useClerkUser()
    return { isLoaded, isSignedIn, userId: user?.id ?? null }
}

interface GlobalData {
    resumes: any[]
    jobs: any[]
    loadingData: boolean
    plan: string
    loadingPlan: boolean
    refreshData: () => Promise<void>
}

const GlobalDataContext = createContext<GlobalData>({
    resumes: [], jobs: [], loadingData: true, plan: "free", loadingPlan: true, refreshData: async () => { }
})

export const useGlobalData = () => useContext(GlobalDataContext)

function ssGet<T>(key: string): T | null {
    try { const v = sessionStorage.getItem(key); return v ? JSON.parse(v) : null } catch { return null }
}
function ssSet(key: string, value: unknown) {
    try { sessionStorage.setItem(key, JSON.stringify(value)) } catch { }
}

// Read from sessionStorage at call time (safe to call in useState initialisers)
function preloadFromCache() {
    try {
        const uid = sessionStorage.getItem("dash_user_id")
        if (!uid) return null
        const resumes = ssGet<any[]>(`dash_resumes_${uid}`)
        const jobs    = ssGet<any[]>(`dash_jobs_${uid}`)
        const plan    = sessionStorage.getItem(`user_plan_${uid}`)
        return { uid, resumes, jobs, plan }
    } catch { return null }
}

export function GlobalDataProvider({ children }: { children: React.ReactNode }) {
    const { isLoaded, isSignedIn, userId } = useUserSafe()

    // Pre-load from cache synchronously so data is visible before Clerk even initialises.
    // This eliminates the 1-2s Clerk startup gap from the user's perspective.
    const [resumes,     setResumes]     = useState<any[]>(() => preloadFromCache()?.resumes ?? [])
    const [jobs,        setJobs]        = useState<any[]>(() => preloadFromCache()?.jobs ?? [])
    const [loadingData, setLoadingData] = useState(() => !preloadFromCache()?.resumes)
    const [plan,        setPlan]        = useState<string>(() => preloadFromCache()?.plan ?? "premium")
    const [loadingPlan, setLoadingPlan] = useState(() => !preloadFromCache()?.plan)

    const refreshData = async () => {
        if (!isLoaded || !isSignedIn) return
        try {
            const res = await api.get("/api/dashboard/init")
            setResumes(res.data.resumes)
            setJobs(res.data.jobs)
            setPlan(res.data.plan)
            setLoadingPlan(false)
            // Store under user-keyed keys so account switches don't serve stale data
            if (userId) {
                ssSet(`dash_resumes_${userId}`, res.data.resumes)
                ssSet(`dash_jobs_${userId}`, res.data.jobs)
                sessionStorage.setItem(`user_plan_${userId}`, res.data.plan)
                sessionStorage.setItem("dash_user_id", userId)
            }
        } catch { } finally { setLoadingData(false); setLoadingPlan(false) }
    }

    useEffect(() => {
        if (!isLoaded) return  // wait for Clerk to finish initialising

        if (!isSignedIn || !userId) {
            setLoadingData(false)
            setLoadingPlan(false)
            return
        }

        const cachedUserId = sessionStorage.getItem("dash_user_id")

        if (cachedUserId !== userId) {
            // Different user (account switch) — clear stale cache and force fresh fetch
            if (cachedUserId) {
                sessionStorage.removeItem(`dash_resumes_${cachedUserId}`)
                sessionStorage.removeItem(`dash_jobs_${cachedUserId}`)
                sessionStorage.removeItem(`user_plan_${cachedUserId}`)
                sessionStorage.removeItem("dash_user_id")
            }
            setResumes([])
            setJobs([])
            setLoadingData(true)
            setLoadingPlan(true)
        }
        // Same user: data already pre-loaded from cache above — just refresh silently

        refreshData()
    }, [isLoaded, isSignedIn, userId])

    return (
        <GlobalDataContext.Provider value={{ resumes, jobs, loadingData, plan, loadingPlan, refreshData }}>
            {children}
        </GlobalDataContext.Provider>
    )
}
