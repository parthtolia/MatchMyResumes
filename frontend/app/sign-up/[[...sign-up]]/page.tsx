import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
            <div className="absolute inset-0 grid-bg opacity-30" />
            <div className="relative z-10">
                <SignUp appearance={{
                    variables: {
                        colorPrimary: "#6c5ce7",
                        colorBackground: "#111118",
                        colorText: "#f0f0f8",
                        colorInputBackground: "#1a1a24",
                        colorInputText: "#f0f0f8",
                    }
                }} />
            </div>
        </div>
    )
}
