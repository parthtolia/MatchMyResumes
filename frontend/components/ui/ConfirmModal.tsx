"use client"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Info } from "lucide-react"

interface ConfirmModalProps {
    open: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: "danger" | "info"
    onConfirm: () => void
    onCancel: () => void
}

export default function ConfirmModal({
    open,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "danger",
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const isDanger = variant === "danger"
    const Icon = isDanger ? AlertTriangle : Info
    const iconBg = isDanger ? "bg-red-500/15 border-red-500/20" : "bg-violet-500/15 border-violet-500/20"
    const iconColor = isDanger ? "text-red-400" : "text-violet-400"
    const confirmBg = isDanger
        ? "bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
        : "bg-violet-500/20 border-violet-500/30 text-violet-400 hover:bg-violet-500/30"

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
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
                        <div className="flex gap-3">
                            <button
                                onClick={onCancel}
                                className="flex-1 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-sm font-medium transition-all"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${confirmBg}`}
                            >
                                {confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
