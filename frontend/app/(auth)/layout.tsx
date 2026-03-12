import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"

const HAS_REAL_CLERK =
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").startsWith("pk_") &&
  !(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").includes("_...")

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  if (!HAS_REAL_CLERK) return <>{children}</>

  return (
    <ClerkProvider
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#8b5cf6",
          colorBackground: "#0a0a0f",
          colorInputBackground: "rgba(255,255,255,0.05)",
        }
      }}
    >
      {children}
    </ClerkProvider>
  )
}
