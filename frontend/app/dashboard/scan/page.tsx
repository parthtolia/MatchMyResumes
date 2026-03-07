"use client"
import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, BarChart3, Loader2, Zap } from "lucide-react"
import api from "@/lib/api"
import ScoreCircle from "@/components/ScoreCircle"
import KeywordHeatmap from "@/components/KeywordHeatmap"
import { useGlobalData } from "@/components/dashboard/GlobalDataProvider"
import { Lightbulb, Info } from "lucide-react"

interface ATSResult {
    id: string
    total_score: number
    breakdown: {
        keyword_score: number
        semantic_score: number
        formatting_score: number
        section_score: number
        quantification_score: number
        details: any
    }
    matched_keywords: string[]
    missing_keywords: string[]
    resume_id: string
    jd_id: string
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

const breakdownItems = [
    { key: "keyword_score", label: "Keyword Match", weight: "40%" },
    { key: "semantic_score", label: "Semantic Similarity", weight: "25%" },
    { key: "formatting_score", label: "ATS Formatting", weight: "15%" },
    { key: "section_score", label: "Section Completeness", weight: "10%" },
    { key: "quantification_score", label: "Quantification", weight: "10%" },
]

type Step = "upload" | "jd" | "result"

export default function ScanPage() {
    const [resumeId, setResumeId] = useState<string | null>(null)
    const [resumeName, setResumeName] = useState("")
    const [step, setStep] = useState<Step>("upload")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [jdTitle, setJdTitle] = useState("")
    const [jdText, setJdText] = useState("")
    const [result, setResult] = useState<ATSResult | null>(null)
    const { resumes, jobs, loadingData, refreshData } = useGlobalData()
    const [selectedResumeId, setSelectedResumeId] = useState("")
    const [jdInputType, setJdInputType] = useState<"saved" | "text">("saved")
    const [selectedJdId, setSelectedJdId] = useState("")

    // When no saved JDs exist, force text mode so the button isn't perpetually disabled
    useEffect(() => {
        if (!loadingData && jobs.length === 0) {
            setJdInputType("text")
        }
    }, [loadingData, jobs.length])

    const handleSelectExistingResume = (id: string) => {
        if (!id) return
        const r = resumes.find(x => x.id === id)
        if (r) {
            setResumeId(r.id)
            setResumeName(r.filename)
            setStep("jd")
        }
    }

    const onDrop = useCallback(async (files: File[]) => {
        const file = files[0]
        if (!file) return
        setLoading(true)
        setError("")
        try {
            const formData = new FormData()
            formData.append("file", file)
            const res = await api.post("/api/resumes/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            refreshData()
            setResumeId(res.data.id)
            setResumeName(res.data.filename)
            setStep("jd")
        } catch (e: any) {
            setError(e?.response?.data?.detail || e.message)
        } finally { setLoading(false) }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
        },
        maxFiles: 1,
        disabled: loading,
    })

    const handleScore = async () => {
        if (!resumeId) return
        if (jdInputType === "text" && (!jdText.trim() || !jdTitle.trim())) return
        if (jdInputType === "saved" && !selectedJdId) return

        setLoading(true)
        setError("")
        try {
            let actualJdId = selectedJdId
            if (jdInputType === "text") {
                const jdRes = await api.post("/api/jobs/", { raw_text: jdText, title: jdTitle })
                actualJdId = jdRes.data.id
                refreshData()
            }
            const scoreRes = await api.post("/api/resumes/score", { resume_id: resumeId, jd_id: actualJdId })
            setResult(scoreRes.data)
            setStep("result")
        } catch (e: any) {
            setError(e?.response?.data?.detail || e.message)
        } finally { setLoading(false) }
    }

    const steps: Step[] = ["upload", "jd", "result"]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <BarChart3 size={24} className="text-violet-400" />
                    JD Match Score
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                    Upload your resume and paste a job description to see your ATS match score and keyword gaps
                </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2">
                {steps.map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === s ? "bg-violet-500 text-white"
                            : steps.indexOf(step) > i ? "bg-emerald-500 text-white"
                                : "bg-white/10 text-gray-400"
                            }`}>{i + 1}</div>
                        <span className="text-xs text-gray-500 hidden sm:block capitalize">
                            {s === "jd" ? "Job Description" : s}
                        </span>
                        {i < 2 && <div className="w-8 h-px bg-white/10" />}
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* Step 1: Upload */}
                {step === "upload" && (
                    <motion.div key="upload" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${isDragActive ? "border-violet-500 bg-violet-500/10" : "border-white/10 hover:border-violet-500/50 hover:bg-white/5"
                                }`}
                        >
                            <input {...getInputProps()} />
                            {loading ? (
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 size={48} className="text-violet-400 animate-spin" />
                                    <p className="text-gray-400">Parsing your resume...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                        <Upload size={28} className="text-violet-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold mb-1">Drop your resume here</p>
                                        <p className="text-gray-400 text-sm">or click to browse · PDF or DOCX · Max 10MB</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {loadingData ? (
                            <div className="mt-6 flex justify-center items-center gap-2 text-violet-400">
                                <Loader2 size={16} className="animate-spin" />
                                <span className="text-sm">Loading saved resumes...</span>
                            </div>
                        ) : resumes.length > 0 && (
                            <div className="mt-6 flex flex-col gap-2 relative z-10">
                                <label className="text-sm font-medium text-gray-300 text-center">Or select a saved resume</label>
                                <select
                                    className="input-styled bg-white/5 border-white/10"
                                    value={selectedResumeId}
                                    onChange={(e) => {
                                        setSelectedResumeId(e.target.value)
                                        handleSelectExistingResume(e.target.value)
                                    }}
                                >
                                    <option value="">Choose a resume...</option>
                                    {resumes.map(r => (
                                        <option key={r.id} value={r.id}>{r.filename}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Step 2: JD */}
                {step === "jd" && (
                    <motion.div key="jd" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <FileText size={18} className="text-emerald-400" />
                            <span className="text-sm text-emerald-300 font-medium">Resume uploaded: {resumeName}</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-300">Target Job Description</label>
                        </div>

                        <div className="flex flex-col gap-4">
                            {jobs.length > 0 && (
                                <div className={`p-4 rounded-xl border transition-all ${jdInputType === "saved" ? "bg-white/5 border-white/10" : "border-white/5 opacity-60 hover:opacity-100"}`}>
                                    <label className="flex items-center gap-3 cursor-pointer mb-3">
                                        <input type="radio" name="jd_type" checked={jdInputType === "saved"} onChange={() => setJdInputType("saved")} className="accent-violet-500 w-4 h-4 cursor-pointer" />
                                        <span className="text-sm font-medium text-white select-none">Select a Saved Job Description</span>
                                    </label>
                                    {jdInputType === "saved" && (
                                        <select className="input-styled ml-7 w-[calc(100%-1.75rem)]" value={selectedJdId} onChange={e => setSelectedJdId(e.target.value)}>
                                            <option value="">Choose a job...</option>
                                            {jobs.map(j => <option key={j.id} value={j.id}>{j.title || `JD ${j.id.slice(0, 8)}`}</option>)}
                                        </select>
                                    )}
                                </div>
                            )}

                            <div className={`p-4 rounded-xl border transition-all ${jdInputType === "text" || jobs.length === 0 ? "bg-white/5 border-white/10" : "border-white/5 opacity-60 hover:opacity-100"}`}>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="radio" name="jd_type" checked={jdInputType === "text" || jobs.length === 0} onChange={() => setJdInputType("text")} className="accent-violet-500 w-4 h-4 cursor-pointer" />
                                    <span className="text-sm font-medium text-white select-none">Paste New Job Description</span>
                                </label>

                                {(jdInputType === "text" || jobs.length === 0) && (
                                    <div className="space-y-4 mt-4 ml-7 w-[calc(100%-1.75rem)]">
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Job Title (Required)</label>
                                            <input
                                                className="input-styled"
                                                placeholder="e.g. Senior Frontend Engineer"
                                                value={jdTitle}
                                                onChange={e => setJdTitle(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1">Job Description Text</label>
                                            <textarea
                                                className="input-styled resize-y"
                                                rows={5}
                                                placeholder="Paste the full job description here..."
                                                value={jdText}
                                                onChange={e => setJdText(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <button
                                onClick={() => setStep("upload")}
                                className="px-6 py-3 rounded-xl text-gray-400 font-medium hover:text-white transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleScore}
                                disabled={loading || (jdInputType === "text" ? (!jdText.trim() || !jdTitle.trim()) : !selectedJdId)}
                                className="btn-glow flex-1 md:flex-none px-8 py-3 rounded-xl text-white font-semibold flex justify-center items-center gap-2 disabled:opacity-50 transition-all"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <BarChart3 size={18} />}
                                {loading ? "Analyzing..." : "Analyze ATS Score"}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Result */}
                {step === "result" && result && (
                    <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="glass p-8">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <ScoreCircle score={result.total_score} size={180} />
                                <div className="flex-1 space-y-4 w-full">
                                    <h2 className="text-xl font-bold text-white">ATS Match Score</h2>
                                    {breakdownItems.map((item, i) => (
                                        <ScoreBar
                                            key={item.key}
                                            label={item.label}
                                            score={result.breakdown[item.key as keyof typeof result.breakdown] as number}
                                            weight={item.weight}
                                            delay={0.2 + i * 0.1}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="glass p-6">
                            <h3 className="font-semibold text-white mb-4">Keyword Analysis</h3>
                            <KeywordHeatmap matched={result.matched_keywords} missing={result.missing_keywords} />
                        </div>

                        {/* Category-wise Improvement Tips */}
                        <div className="glass p-6">
                            <h3 className="flex items-center gap-2 font-semibold text-white mb-4">
                                <Lightbulb size={18} className="text-yellow-400" />
                                Improvement Tips
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Semantic Similarity Tips */}
                                {result.breakdown.semantic_score < 100 && (
                                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                        <h4 className="font-medium text-blue-300 text-sm mb-2">Semantic Similarity ({Math.round(result.breakdown.semantic_score)}/100)</h4>
                                        <ul className="text-xs text-gray-400 space-y-1.5 list-disc pl-4">
                                            {result.breakdown.semantic_score < 50 ? (
                                                <li>Your resume&apos;s language is quite different from the job description. Rewrite key sections — especially your summary and top bullet points — to mirror the JD&apos;s phrasing and vocabulary.</li>
                                            ) : result.breakdown.semantic_score < 75 ? (
                                                <li>Good conceptual overlap, but you can improve it. Align your summary and experience bullets more closely with the JD&apos;s core themes and terminology.</li>
                                            ) : result.breakdown.semantic_score < 90 ? (
                                                <li>Strong semantic match. Refine 1–2 bullet points in your most recent role to echo the JD&apos;s specific language more precisely.</li>
                                            ) : (
                                                <li>Excellent semantic alignment. Minor phrasing tweaks in your skills section can close the final gap.</li>
                                            )}
                                        </ul>
                                    </div>
                                )}

                                {/* Keyword Tips — full chip grid spanning both columns */}
                                {result.missing_keywords.length > 0 && (
                                    <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 md:col-span-2">
                                        <h4 className="font-medium text-violet-300 text-sm mb-1">
                                            Keyword Match ({Math.round(result.breakdown.keyword_score)}/100)
                                        </h4>
                                        <p className="text-xs text-gray-400 mb-3">
                                            <span className="text-emerald-400 font-medium">{result.matched_keywords.length} matched</span>
                                            {" · "}
                                            <span className="text-red-400 font-medium">{result.missing_keywords.length} missing</span>
                                            {" from the job description"}
                                        </p>
                                        <p className="text-xs text-gray-500 mb-2">Add these to your resume naturally where you genuinely have the skill:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {result.missing_keywords.map(kw => (
                                                <span key={kw} className="keyword-missing px-2 py-0.5 rounded-md text-xs">✗ {kw}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Formatting Tips — renders on score alone; details used for specifics */}
                                {result.breakdown.formatting_score < 100 && (
                                    <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                        <h4 className="font-medium text-orange-300 text-sm mb-2">ATS Formatting ({Math.round(result.breakdown.formatting_score)}/100)</h4>
                                        <ul className="text-xs text-gray-400 space-y-1.5 list-disc pl-4">
                                            {result.breakdown.details?.formatting?.checks ? (
                                                <>
                                                    {result.breakdown.details.formatting.checks.no_tables === false && <li>Remove tables, columns, or complex layouts — ATS systems cannot parse them reliably.</li>}
                                                    {result.breakdown.details.formatting.checks.minimal_special_chars === false && <li>Avoid heavy use of non-standard icons and special characters (stick to plain bullet points).</li>}
                                                    {result.breakdown.details.formatting.checks.standard_headings === false && <li>Use standard section headings: &quot;Experience&quot;, &quot;Education&quot;, and &quot;Skills&quot;.</li>}
                                                    {result.breakdown.details.formatting.checks.appropriate_length === false && <li>Adjust resume length — aim for 300–1500 words (too short or too long both hurt ATS parsing).</li>}
                                                    {result.breakdown.details.formatting.checks.has_contact_info === false && <li>Ensure a valid email address is present at the top of your resume.</li>}
                                                </>
                                            ) : (
                                                <li>Review ATS formatting: remove tables and columns, use standard section headers (Experience, Education, Skills), avoid excessive special characters, and ensure your email is present.</li>
                                            )}
                                        </ul>
                                    </div>
                                )}

                                {/* Section Completeness Tips — renders on score alone; details used for specifics */}
                                {result.breakdown.section_score < 100 && (
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                        <h4 className="font-medium text-red-300 text-sm mb-2">Section Completeness ({Math.round(result.breakdown.section_score)}/100)</h4>
                                        <ul className="text-xs text-gray-400 space-y-1.5 list-disc pl-4">
                                            {result.breakdown.details?.section?.sections ? (
                                                Object.entries(result.breakdown.details.section.sections).map(([sec, isPresent]) => (
                                                    !isPresent
                                                        ? <li key={sec} className="capitalize">Missing or thin section: <strong>{sec}</strong>. Add meaningful content here.</li>
                                                        : null
                                                ))
                                            ) : (
                                                <li>Ensure your resume has all required sections: Experience, Education, and Skills — each with substantial content (not just headers).</li>
                                            )}
                                        </ul>
                                    </div>
                                )}

                                {/* Quantification Tips — renders on score alone; details used for specifics */}
                                {result.breakdown.quantification_score < 100 && (
                                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                        <h4 className="font-medium text-emerald-300 text-sm mb-2">Quantification ({Math.round(result.breakdown.quantification_score)}/100)</h4>
                                        <ul className="text-xs text-gray-400 space-y-1.5 list-disc pl-4">
                                            {result.breakdown.details?.quantification?.found ? (
                                                <>
                                                    {result.breakdown.details.quantification.found.percentages === 0 && <li>Add percentage improvements to your bullets (e.g. &quot;increased conversion by 20%&quot;).</li>}
                                                    {result.breakdown.details.quantification.found.dollar_amounts === 0 && <li>Add monetary scope where applicable (e.g. &quot;managed $1M budget&quot;).</li>}
                                                    {result.breakdown.details.quantification.found.metrics_x === 0 && <li>Use multiplier metrics where applicable (e.g. &quot;improved throughput 3x&quot;).</li>}
                                                </>
                                            ) : (
                                                <li>Add quantifiable achievements: percentages (20% improvement), dollar amounts ($1M budget), team sizes, or multiplier gains (3x faster).</li>
                                            )}
                                            <li className="mt-1 text-emerald-400/80 italic flex items-center gap-1"><Info size={12} /> Recruiters prefer measurable impact over generic responsibilities.</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <a
                                href={`/dashboard/optimize?resume_id=${result.resume_id}&jd_id=${result.jd_id}`}
                                className="btn-glow px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 text-sm"
                            >
                                <Zap size={16} /> Optimize Resume with AI
                            </a>
                            <a
                                href={`/dashboard/cover-letter?resume_id=${result.resume_id}&jd_id=${result.jd_id}`}
                                className="px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 text-sm border border-white/10 hover:bg-white/5 transition-all"
                            >
                                Generate Cover Letter
                            </a>
                            <button
                                onClick={() => setStep("jd")}
                                className="px-6 py-3 rounded-xl text-gray-400 font-medium text-sm hover:text-white transition-colors"
                            >
                                Change Job Description
                            </button>
                            <button
                                onClick={() => { setStep("upload"); setResult(null); setResumeId(null); setJdText(""); setJdTitle("") }}
                                className="px-6 py-3 rounded-xl text-gray-400 font-medium text-sm hover:text-white transition-colors"
                            >
                                Scan Another Resume
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {
                error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
                )
            }
        </div >
    )
}
