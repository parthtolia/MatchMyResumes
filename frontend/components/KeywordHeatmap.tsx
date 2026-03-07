"use client"
import { motion } from "framer-motion"

interface KeywordHeatmapProps {
    matched: string[]
    missing: string[]
}

export default function KeywordHeatmap({ matched, missing }: KeywordHeatmapProps) {
    return (
        <div className="space-y-4">
            <div>
                <h4 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    Matched Keywords ({matched.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                    {matched.map((kw, i) => (
                        <motion.span
                            key={kw}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.03 }}
                            className="keyword-match px-3 py-1 rounded-full text-xs font-medium"
                        >
                            ✓ {kw}
                        </motion.span>
                    ))}
                    {matched.length === 0 && (
                        <span className="text-gray-500 text-sm">No matched keywords yet</span>
                    )}
                </div>
            </div>

            <div>
                <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                    Missing Keywords ({missing.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                    {missing.map((kw, i) => (
                        <motion.span
                            key={kw}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.03 }}
                            className="keyword-missing px-3 py-1 rounded-full text-xs font-medium"
                        >
                            ✗ {kw}
                        </motion.span>
                    ))}
                    {missing.length === 0 && (
                        <span className="text-gray-500 text-sm">All keywords matched! 🎉</span>
                    )}
                </div>
            </div>
        </div>
    )
}
