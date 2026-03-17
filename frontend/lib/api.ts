import axios from "axios"

// API routes are now co-located in Next.js — use relative URLs (same origin)
const api = axios.create({
    baseURL: "",
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
                const session = await (window as any).Clerk?.session?.getToken()
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

// Retry logic for timeout and network errors (up to 2 retries = 3 total attempts)
const MAX_RETRIES = 2
const RETRY_DELAY = 1500 // ms

function isRetryable(error: any): boolean {
    if (!error) return false
    // Network error (server unreachable)
    if (error.message === "Network Error") return true
    // Timeout
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") return true
    // Server errors (502, 503, 504)
    const status = error.response?.status
    if (status && [502, 503, 504].includes(status)) return true
    return false
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config
        if (!config) return Promise.reject(error)

        config.__retryCount = config.__retryCount || 0

        if (isRetryable(error) && config.__retryCount < MAX_RETRIES) {
            config.__retryCount += 1
            await new Promise(r => setTimeout(r, RETRY_DELAY * config.__retryCount))
            return api.request(config)
        }

        const msg = error?.response?.data?.detail ||
            (error.message === "Network Error" ? "Network error. Please check your connection." : error.message) ||
            "An unexpected error occurred"
        return Promise.reject(new Error(msg))
    }
)

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
