import { Lightbulb, FileText } from "lucide-react"

export function Logo({ className = "" }: { className?: string }) {
    return (
        <div className={`flex items-center gap-2 select-none ${className}`}>
            <span className="font-extrabold text-2xl text-white tracking-tight">Match</span>

            {/* The "My" Document Icon */}
            <div className="relative shrink-0 min-w-[54px] flex items-center justify-center w-[54px] h-[64px] bg-[#111118] border-2 border-violet-500/50 rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.3)] mx-1">
                {/* Folded corner effect (optional sleek detail) */}
                <div className="absolute top-0 right-0 w-3.5 h-3.5 border-b-2 border-l-2 border-violet-500/50 bg-[#0a0a0f] rounded-bl-sm" />

                {/* The glowing lightbulb badge */}
                <div className="absolute -top-3.5 -right-3 bg-gradient-to-br from-yellow-300 to-amber-500 w-6 h-6 rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(252,211,77,0.8)] border border-yellow-200">
                    <Lightbulb size={14} className="text-amber-900 fill-amber-900" />
                </div>

                <span className="font-black text-xl text-violet-400 mt-1">My</span>
            </div>

            <span className="font-extrabold text-2xl text-white tracking-tight">Resumes</span>
        </div>
    )
}
