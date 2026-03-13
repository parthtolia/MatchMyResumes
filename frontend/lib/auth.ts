import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const HAS_REAL_CLERK =
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").startsWith("pk_") &&
  !(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").includes("_...");

export async function getAuthUserId(): Promise<string> {
  if (!HAS_REAL_CLERK || process.env.APP_ENV === "development") {
    return "dev-user-001";
  }
  const { userId } = await auth();
  if (!userId) {
    throw new AuthError("Unauthorized");
  }
  return userId;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export function handleAuthError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json({ detail: error.message }, { status: 401 });
  }
  throw error;
}
