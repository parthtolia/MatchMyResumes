"use client"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDropzone } from "react-dropzone"
import {
    Upload, Loader2, CheckCircle, XCircle, AlertCircle, Lightbulb, ScanSearch
} from "lucide-react"
import api from "@/lib/api"
import ScoreCircle from "@/components/ScoreCircle"
import { useGlobalData } from "@/components/dashboard/GlobalDataProvider"

interface CVResult {
    resume_id: string
    filename: string
    total_score: number
    section_score: number
    formatting_score: number
    quantification_score: number
    content_density_score: number
    contact_score: number
    skills_detected: string[]
    missing_sections: string[]
    suggestions: Record<string, string[]>
    breakdown: any
}

function ScoreBar({ label, score, weight, delay = 0 }: { label: string; score: number; weight: string; delay?: number }) {
    const color = score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-yellow-500" : score >= 40 ? "bg-orange-500" : "bg-red-500"
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-sm">
                <span className="text-gray-300">{label}</span>
                <span className="text-gray-400">{weight} · <span className="text-white font-medium">{Math.round(score)}/100</span></span>
            </div>
            <div className="h-2 bg-white/5 rounded-full">
                <motion.div
                    initial={{ width: 0 }} animate={{ width: `${score}%` }}
                    transition={{ duration: 1, delay }}
                    className={`h-2 rounded-full ${color}`}
                />
            </div>
        </div>
    )
}

const breakdown = [
    { key: "section_score", label: "Section Completeness", weight: "30%" },
    { key: "formatting_score", label: "ATS Formatting", weight: "25%" },
    { key: "quantification_score", label: "Quantification", weight: "20%" },
    { key: "content_density_score", label: "Content Density", weight: "15%" },
    { key: "contact_score", label: "Contact Information", weight: "10%" },
]

export default function CVAnalysisPage() {
    const { resumes, loadingData, refreshData } = useGlobalData()
    const [selectedResumeId, setSelectedResumeId] = useState("")

    const [result, setResult] = useState<CVResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSelectExisting = async (id: string) => {
        if (!id) return;
        setLoading(true)
        setError("")
        setResult(null)
        try {
            const score = await api.post("/api/resumes/cv-score", { resume_id: id })
            setResult(score.data)
        } catch (e: any) {
            const msg = e.response?.data?.detail || e.message || "Failed to analyze resume"
            setError(msg)
            if (e.response?.status === 404) {
                setSelectedResumeId("")
                refreshData() // cache had a stale resume ID — force refresh
            }
        } finally {
            setLoading(false)
        }
    }

    const handleFile = async (file: File) => {
        setLoading(true)
        setError("")
        setResult(null)
        try {
            const formData = new FormData()
            formData.append("file", file)
            const upload = await api.post("/api/resumes/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            refreshData()
            const score = await api.post("/api/resumes/cv-score", { resume_id: upload.data.id })
            setResult(score.data)
        } catch (e: any) {
            setError(e?.response?.data?.detail || e.message)
        } finally {
            setLoading(false)
        }
    }

    const onDrop = useCallback((files: File[]) => { if (files[0]) handleFile(files[0]) }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] },
        maxFiles: 1,
        disabled: loading,
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <ScanSearch size={24} className="text-violet-400" />
                    Resume ATS Score
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                    Upload your resume to get an instant standalone ATS readiness score — no job description needed
                </p>
            </div>

            {/* Upload zone — always visible so user can rescan */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${isDragActive ? "border-violet-500 bg-violet-500/10" : "border-white/10 hover:border-violet-500/50 hover:bg-white/5"
                    }`}
            >
                <input {...getInputProps()} />
                {loading ? (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 size={40} className="text-violet-400 animate-spin" />
                        <p className="text-gray-400">Analysing your resume...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                            <Upload size={24} className="text-violet-400" />
                        </div>
                        <div>
                            <p className="text-white font-semibold mb-1">
                                {result ? "Drop another resume to rescan" : "Drop your resume here"}
                            </p>
                            <p className="text-gray-400 text-sm">Click to browse · PDF or DOCX · Max 10MB</p>
                        </div>
                    </div>
                )}
            </div>

            {loadingData ? (
                <div className="flex justify-center items-center gap-2 text-violet-400">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">Loading saved resumes...</span>
                </div>
            ) : resumes.length > 0 && (
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-300">Or select a saved resume</label>
                    <select
                        className="input-styled bg-white/5 border-white/10"
                        value={selectedResumeId}
                        onChange={(e) => {
                            setSelectedResumeId(e.target.value)
                            if (e.target.value) handleSelectExisting(e.target.value)
                        }}
                    >
                        <option value="">Choose a resume...</option>
                        {resumes.map(r => (
                            <option key={r.id} value={r.id}>{r.filename}</option>
                        ))}
                    </select>
                </div>
            )}

            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
            )}

            {/* Results */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-5"
                    >
                        {/* Score + breakdown */}
                        <div className="glass p-8">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <ScoreCircle score={result.total_score} size={180} />
                                <div className="flex-1 space-y-4 w-full">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">CV Readiness Score</h2>
                                        <p className="text-gray-400 text-sm mt-0.5">{result.filename}</p>
                                    </div>
                                    {breakdown.map((item, i) => (
                                        <ScoreBar
                                            key={item.key}
                                            label={item.label}
                                            score={result[item.key as keyof CVResult] as number}
                                            weight={item.weight}
                                            delay={0.2 + i * 0.1}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                            {/* Skills detected */}
                            {result.skills_detected.length > 0 && (
                                <div className="glass p-6">
                                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                                        <CheckCircle size={15} className="text-emerald-400" /> Skills Detected
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {result.skills_detected.map(skill => (
                                            <span key={skill} className="px-3 py-1 text-xs rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 capitalize">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Missing sections */}
                            {result.missing_sections.length > 0 && (
                                <div className="glass p-6">
                                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                                        <XCircle size={15} className="text-red-400" /> Missing Sections
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {result.missing_sections.map(s => (
                                            <span key={s} className="px-3 py-1 text-xs rounded-full bg-red-500/10 border border-red-500/20 text-red-300">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Improvement tips categorized */}
                        {(Array.isArray(result.suggestions) ? result.suggestions.length > 0 : Object.keys(result.suggestions).length > 0 && Object.values(result.suggestions).some((tips: any) => Array.isArray(tips) && tips.length > 0)) && (
                            <div className="glass p-6">
                                <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
                                    <Lightbulb size={16} className="text-yellow-400" /> Actionable Improvement Tips
                                </h3>
                                <div className="space-y-6">
                                    {Array.isArray(result.suggestions) ? (
                                        <ul className="space-y-2">
                                            {result.suggestions.map((tip, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                                    <AlertCircle size={14} className="text-yellow-400 mt-0.5 shrink-0" />
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        Object.entries(result.suggestions).map(([category, tips]) => {
                                            if (!Array.isArray(tips) || tips.length === 0) return null;
                                            return (
                                                <div key={category} className="space-y-2">
                                                    <h4 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">{category}</h4>
                                                    <ul className="space-y-2">
                                                        {tips.map((tip: string, i: number) => (
                                                            <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                                                <AlertCircle size={14} className="text-yellow-400 mt-0.5 shrink-0" />
                                                                {tip}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}

                        {/* CTA to JD matching */}
                        <div className="p-5 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-between gap-4 flex-wrap">
                            <div>
                                <p className="text-white font-medium text-sm">Want to match this resume against a job description?</p>
                                <p className="text-gray-400 text-xs mt-0.5">See your keyword match score, semantic fit, and missing skills for a specific role</p>
                            </div>
                            <a href="/dashboard/scan" className="btn-glow px-5 py-2.5 rounded-xl text-white text-sm font-semibold shrink-0">
                                ATS vs JD →
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
