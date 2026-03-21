"use client"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Zap, Loader2, Copy, Check, ArrowRight, Download } from "lucide-react"
import AlertModal from "@/components/ui/AlertModal"
import api from "@/lib/api"
import { useGlobalData } from "@/components/dashboard/GlobalDataProvider"
import { downloadElementAsPdf, downloadTextAsDocx } from "@/lib/download"
import { ResumeEditor } from "@/components/editor/ResumeEditor"
import { ResumeData, ResumeTemplateId, ResumeTheme } from "@/lib/types/resume"
import type { StructuredResume } from "@/lib/types/structured-resume"
import { parseRawTextToResumeData, resumeDataToRawText, resumeSectionsToResumeData, structuredResumeToResumeData } from "@/lib/resume-utils"

import { UserButton, useUser as useClerkUser } from "@clerk/nextjs"

const HAS_REAL_CLERK =
    typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").startsWith("pk_") &&
    !(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "").includes("_...")

function useUserSafe() {
    if (!HAS_REAL_CLERK) {
        return { user: { firstName: "Developer" }, isLoaded: true, isSignedIn: true }
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useClerkUser()
}

function OptimizeContent() {
    const params = useSearchParams()
    const { isLoaded, isSignedIn } = useUserSafe()
    const { resumes, jobs, loadingData, loadingPlan, refreshData } = useGlobalData()
    const [resumeId, setResumeId] = useState(params.get("resume_id") || "")
    const [jdId, setJdId] = useState(params.get("jd_id") || "")
    const [jdInputType, setJdInputType] = useState<"saved" | "text">("saved")
    const [jdTitle, setJdTitle] = useState("")
    const [jdText, setJdText] = useState("")

    const [originalText, setOriginalText] = useState("")
    const [result, setResult] = useState<any>(null)
    const [resumeData, setResumeData] = useState<ResumeData | null>(null)
    const [templateId, setTemplateId] = useState<ResumeTemplateId>("classic")
    const [theme, setTheme] = useState<ResumeTheme>({
        primaryColor: "#7c3aed",
        headingColor: "#1a1a1a",
        textColor: "#333333",
        fontFamily: "Inter, sans-serif"
    })

    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState("")
    const [alertMsg, setAlertMsg] = useState("")

    useEffect(() => {
        if (resumeId && isLoaded && isSignedIn) {
            api.get(`/api/resumes/${resumeId}`).then(r => setOriginalText(r.data.raw_text)).catch(() => setOriginalText(""))
        } else if (!resumeId) {
            setOriginalText("")
        }
    }, [resumeId, isLoaded, isSignedIn])

    const optimize = async () => {
        if (!resumeId) return
        if (jdInputType === "saved" && !jdId) return
        if (jdInputType === "text" && (!jdText.trim() || !jdTitle.trim())) return

        setLoading(true)
        setError("")
        setResult(null)
        try {
            let actualJdId = jdId
            if (jdInputType === "text") {
                const jdRes = await api.post("/api/jobs/", { raw_text: jdText, title: jdTitle })
                actualJdId = jdRes.data.id
                refreshData()
            }

            const payload = { resume_id: resumeId, jd_id: actualJdId, save_as_version: true }

            const res = await api.post("/api/resumes/optimize", payload)
            refreshData()
            setResult(res.data)

            // Use the new extraction pipeline response format
            const data = res.data

            if (data.structured_resume) {
              // Prefer structured_resume (new pipeline format)
              console.log("✨ Using structured_resume from new extraction pipeline")
              setResumeData(structuredResumeToResumeData(data.structured_resume))
            } else if (data.optimized_sections && Object.keys(data.optimized_sections).length > 0) {
              // Fallback to optimized_sections (backward compat)
              console.log("🔄 Using optimized_sections (backward compat)")
              setResumeData(resumeSectionsToResumeData(data.optimized_sections, undefined, data.contact_info))
            } else if (data.optimized_text) {
              // Final fallback to raw text
              console.log("⚠️ Using fallback parseRawTextToResumeData")
              setResumeData(parseRawTextToResumeData(data.optimized_text))
            }
        } catch (e: any) {
            setError(e.response?.data?.detail || e.message)
        } finally {
            setLoading(false)
        }
    }

    const copy = () => {
        const textToCopy = resumeData ? resumeDataToRawText(resumeData) : (result?.optimized_text || "")
        navigator.clipboard.writeText(textToCopy)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const downloadOptimizedPdf = async () => {
        const element = document.getElementById("resume-canvas-content")
        if (!element) {
            setAlertMsg("Could not find resume content to export.")
            return
        }
        
        const selectedResume = resumes.find(r => r.id === resumeId)
        const name = selectedResume?.filename?.replace(/\.[^.]+$/, "") || "resume"
        
        try { 
            await downloadElementAsPdf(element, `${name}_optimized.pdf`) 
        } catch (err) { 
            console.error("PDF Export Error:", err)
            setAlertMsg("Failed to generate PDF. Please try again.") 
        }
    }

    const downloadOptimizedDocx = async () => {
        const textToExport = resumeData ? resumeDataToRawText(resumeData) : (result?.optimized_text || "")
        if (!textToExport) return
        
        const selectedResume = resumes.find(r => r.id === resumeId)
        const name = selectedResume?.filename?.replace(/\.[^.]+$/, "") || "resume"
        try { 
            await downloadTextAsDocx(textToExport, `${name}_optimized.docx`, theme.headingColor) 
        } catch { 
            setAlertMsg("Failed to generate DOCX. Please try again.") 
        }
    }

    // Auto-optimize if navigating from JD Match
    useEffect(() => {
        if (isLoaded && isSignedIn && params.get("resume_id") && params.get("jd_id") && !result && !loading && !error) {
            optimize()
        }
    }, [isLoaded, isSignedIn, params.get("resume_id"), params.get("jd_id")])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">AI Resume Optimizer</h1>
                <p className="text-gray-400 text-sm mt-1">GPT-4o rewrites your resume to maximize ATS compatibility without fabricating experience</p>
            </div>

            <div className="glass p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Select Resume</label>
                        <select className="input-styled py-1.5 text-sm" value={resumeId} onChange={e => setResumeId(e.target.value)}>
                            <option value="">Choose resume...</option>
                            {resumes.map((r: any) => <option key={r.id} value={r.id}>{r.filename}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5">Job Description Source</label>
                        <div className="border border-white/10 rounded-xl overflow-hidden bg-[rgba(255,255,255,0.02)]">
                            {jobs.length > 0 && (
                                <div className={`p-3 transition-colors border-b border-white/10 ${jdInputType === "saved" ? "bg-white/5" : "hover:bg-white/[0.04]"}`}>
                                    <label className="flex items-center gap-3 cursor-pointer max-w-full">
                                        <input type="radio" name="opt_jd_type" checked={jdInputType === "saved"} onChange={() => setJdInputType("saved")} className="accent-violet-500 w-4 h-4 flex-shrink-0 cursor-pointer" />
                                        <span className={`text-sm font-medium transition-colors ${jdInputType === "saved" ? "text-white" : "text-gray-400"}`}>Select Saved Job</span>
                                    </label>
                                    {jdInputType === "saved" && (
                                        <div className="pl-7 mt-2">
                                            <select className="input-styled w-full py-1.5 text-sm" value={jdId} onChange={e => setJdId(e.target.value)}>
                                                <option value="">Select a job description...</option>
                                                {jobs.map((j: any) => <option key={j.id} value={j.id}>{j.title || j.id.slice(0, 8)}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className={`p-3 transition-colors ${jdInputType === "text" || jobs.length === 0 ? "bg-white/5" : "hover:bg-white/[0.04]"}`}>
                                <label className="flex items-center gap-3 cursor-pointer max-w-full">
                                    <input type="radio" name="opt_jd_type" checked={jdInputType === "text" || jobs.length === 0} onChange={() => setJdInputType("text")} className="accent-violet-500 w-4 h-4 flex-shrink-0 cursor-pointer" />
                                    <span className={`text-sm font-medium transition-colors ${jdInputType === "text" || jobs.length === 0 ? "text-white" : "text-gray-400"}`}>Paste New Requirements</span>
                                </label>

                                {(jdInputType === "text" || jobs.length === 0) && (
                                    <div className="space-y-3 mt-3 pl-7 pr-2">
                                        <input
                                            type="text"
                                            className="input-styled text-sm py-1.5"
                                            placeholder="Job Title (e.g. Frontend Engineer) *"
                                            value={jdTitle}
                                            onChange={e => setJdTitle(e.target.value)}
                                        />
                                        <textarea
                                            className="input-styled text-sm resize-none py-1.5"
                                            rows={3}
                                            placeholder="Paste full job description here... *"
                                            value={jdText}
                                            onChange={e => setJdText(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
                    <p className="text-xs text-violet-300">
                        <strong>AI Rules:</strong> The optimizer will improve clarity, add measurable impact where implied, and integrate missing keywords — without fabricating any experience.
                    </p>
                </div>

                {loadingPlan ? (
                    <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-center flex items-center justify-center">
                        <Loader2 size={20} className="text-violet-400 animate-spin mr-2" />
                        <span className="text-gray-400 text-sm">Loading...</span>
                    </div>
                ) : (
                    <>
                        <button onClick={optimize} disabled={loading || !resumeId || (jdInputType === "saved" ? !jdId : (!jdText.trim() || !jdTitle.trim()))}
                            className="btn-glow px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 disabled:opacity-50">
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                            {loading ? "Optimizing with GPT-4o..." : "Optimize My Resume"}
                        </button>
                        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    </>
                )}
            </div>

            {loading && (
                <div className="glass p-12 text-center space-y-4">
                    <Loader2 size={40} className="text-violet-400 animate-spin mx-auto" />
                    <p className="text-gray-300 font-medium">GPT-4o is optimizing your resume...</p>
                    <p className="text-gray-500 text-sm">This takes 15-30 seconds</p>
                </div>
            )}

            {result && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {/* Changes */}
                    {result.changes_summary?.length > 0 && (
                        <div className="glass p-6">
                            <h3 className="font-semibold text-white mb-3">Changes Made</h3>
                            <ul className="space-y-2">
                                {result.changes_summary.map((change: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                        <ArrowRight size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                                        {change}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* AI Editor / Preview */}
                    {resumeData && (
                        <ResumeEditor 
                            initialData={resumeData}
                            onDataChange={(newData) => setResumeData(newData)}
                            templateId={templateId}
                            onTemplateChange={(id) => setTemplateId(id)}
                            theme={theme}
                            onThemeChange={(newTheme) => setTheme({ ...theme, ...newTheme })}
                            onDownloadPdf={downloadOptimizedPdf}
                            onDownloadDocx={downloadOptimizedDocx}
                            onCopyText={copy}
                        />
                    )}
                    {result.new_resume_id && (
                        <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <p className="text-sm text-emerald-300 font-medium mb-1">
                                ✓ Successfully saved as a new optimized resume version!
                            </p>
                            <p className="text-xs text-emerald-400/80 mb-3">
                                Your optimized resume has been saved to your account. You can download the text or view it in your dashboard.
                            </p>
                            <a href="/dashboard/resumes" className="inline-flex items-center gap-1 text-xs text-white bg-emerald-500/20 hover:bg-emerald-500/30 px-3 py-1.5 rounded-lg transition-colors">
                                View in My Resumes <ArrowRight size={12} />
                            </a>
                        </div>
                    )}
                </motion.div>
            )}
            <AlertModal
                open={!!alertMsg}
                title="Download Failed"
                message={alertMsg}
                onClose={() => setAlertMsg("")}
            />
        </div>
    )
}

export default function OptimizePage() {
    return (
        <Suspense fallback={<div className="animate-pulse text-gray-500 p-8">Loading...</div>}>
            <OptimizeContent />
        </Suspense>
    )
}
