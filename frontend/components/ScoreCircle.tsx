"use client"
import { motion } from "framer-motion"
import { getScoreGradient, getScoreLabel, getScoreColor } from "@/lib/utils"

interface ScoreCircleProps {
    score: number
    size?: number
}

export default function ScoreCircle({ score, size = 160 }: ScoreCircleProps) {
    const radius = 54
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 100) * circumference
    const label = getScoreLabel(score)
    const colorClass = getScoreColor(score)

    return (
        <div className="flex flex-col items-center gap-2">
            <svg width={size} height={size} viewBox="0 0 120 120">
                {/* Background circle */}
                <circle cx="60" cy="60" r={radius} fill="none" stroke="#2a2a38" strokeWidth="10" />
                {/* Progress circle */}
                <motion.circle
                    cx="60" cy="60" r={radius}
                    fill="none"
                    stroke={score >= 80 ? "#00b894" : score >= 60 ? "#fdcb6e" : score >= 40 ? "#e17055" : "#d63031"}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference}
                    transform="rotate(-90 60 60)"
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
                />
                {/* Score text */}
                <text x="60" y="56" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">
                    {Math.round(score)}
                </text>
                <text x="60" y="72" textAnchor="middle" fill="#8888aa" fontSize="10">
                    / 100
                </text>
            </svg>
            <span className={`text-sm font-semibold ${colorClass}`}>{label}</span>
        </div>
    )
}
