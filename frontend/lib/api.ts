import axios from "axios"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

const api = axios.create({
    baseURL: API_BASE,
    timeout: 60000, // 60 seconds to allow for slow LLM generations
    headers: { "Content-Type": "application/json" },
})

// Determine if Clerk is properly configured (not a placeholder key)
const hasRealClerk =
    typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").startsWith("pk_") &&
    !(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").includes("_...")

// Attach auth token to every request
api.interceptors.request.use(async (config) => {
    try {
        if (typeof window !== "undefined") {
            if (hasRealClerk) {
                // Production: get real Clerk JWT
                console.time('Clerk.getToken()')
                const session = await (window as any).Clerk?.session?.getToken()
                console.timeEnd('Clerk.getToken()')

                if (session) {
                    config.headers.Authorization = `Bearer ${session}`
                }
            } else {
                // Development: use dev bypass token (backend accepts this when APP_ENV=development)
                config.headers.Authorization = "Bearer dev-token"
            }
        }
    } catch {
        // Silently fall back — request will get a 401 if auth is truly required
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const msg = error?.response?.data?.detail ||
            (error.message === "Network Error" ? "Cannot connect to server. Please ensure the backend is running." : error.message) ||
            "An unexpected error occurred"
        return Promise.reject(new Error(msg))
    }
)

export const createCheckoutSession = async (priceId: string, email?: string | null, token?: string | null) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const res = await api.post("/api/stripe/create-checkout-session", { price_id: priceId, email }, { headers })
    return res.data
}

export const createPortalSession = async (token?: string | null) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const res = await api.post("/api/stripe/create-portal-session", {}, { headers })
    return res.data
}

export const verifySession = async (sessionId: string, token?: string | null) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const res = await api.post("/api/stripe/verify-session", { session_id: sessionId }, { headers })
    return res.data
}

// --- Client-Side Generic Cache for Seamless Navigation ---
if (typeof window !== "undefined") {
    const cache = new Map<string, { data: any; timestamp: number; promise?: Promise<any> }>();
    const CACHE_TTL = 30 * 1000; // 30 seconds

    const originalGet = api.get;

    (api as any).get = async function (url: string, config?: any) {
        const paramStr = config?.params ? new URLSearchParams(config.params).toString() : "";
        const key = url + (paramStr ? `?${paramStr}` : "");

        const cached = cache.get(key);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            if (cached.promise) return cached.promise;
            return Promise.resolve({ data: cached.data } as any);
        }

        const promise = originalGet.call(this, url, config)
            .then((res: any) => {
                cache.set(key, { data: res.data, timestamp: Date.now() });
                return res;
            })
            .catch((err) => {
                cache.delete(key);
                throw err;
            });

        cache.set(key, { data: null, timestamp: Date.now(), promise });
        return promise;
    };

    // Auto-invalidate cache on mutations
    const mutateMethods = ['post', 'put', 'patch', 'delete'] as const;
    mutateMethods.forEach(method => {
        const original = api[method];
        (api as any)[method] = async function (...args: any[]) {
            cache.clear();
            return (original as any).apply(this, args);
        };
    });
}

export default api
