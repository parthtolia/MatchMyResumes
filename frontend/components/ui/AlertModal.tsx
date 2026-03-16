"use client"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Info } from "lucide-react"

interface AlertModalProps {
    open: boolean
    title: string
    message: string
    buttonLabel?: string
    variant?: "error" | "info"
    onClose: () => void
}

export default function AlertModal({
    open,
    title,
    message,
    buttonLabel = "OK",
    variant = "error",
    onClose,
}: AlertModalProps) {
    const isError = variant === "error"
    const Icon = isError ? AlertTriangle : Info
    const iconBg = isError ? "bg-red-500/15 border-red-500/20" : "bg-violet-500/15 border-violet-500/20"
    const iconColor = isError ? "text-red-400" : "text-violet-400"

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 8 }}
                        className="relative glass border border-white/15 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-xl ${iconBg} border flex items-center justify-center shrink-0`}>
                                <Icon size={18} className={iconColor} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">{title}</h3>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-6">{message}</p>
                        <button
                            onClick={onClose}
                            className="w-full py-2 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:border-white/20 text-sm font-medium transition-all"
                        >
                            {buttonLabel}
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
