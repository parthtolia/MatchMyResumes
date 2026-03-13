import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// Only initialize if Upstash env vars are present (skip in dev)
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

export const generalLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      analytics: true,
      prefix: "ratelimit:general",
    })
  : null;

export const aiLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      analytics: true,
      prefix: "ratelimit:ai",
    })
  : null;

export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<NextResponse | null> {
  if (!limiter) return null; // No rate limiting in dev
  const { success } = await limiter.limit(identifier);
  if (!success) {
    return NextResponse.json(
      { detail: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }
  return null;
}
