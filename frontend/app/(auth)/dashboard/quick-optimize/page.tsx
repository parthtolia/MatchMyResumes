"use client"
import { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { Sparkles, Loader2, Copy, Check, ArrowRight, Download } from "lucide-react"
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

function QuickOptimizeContent() {
    const { isLoaded, isSignedIn } = useUserSafe()
    const { resumes, loadingData, loadingPlan, refreshData } = useGlobalData()
    const [resumeId, setResumeId] = useState("")
    const [resumeInputType, setResumeInputType] = useState<"select" | "upload">("select")

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
    const [uploading, setUploading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState("")
    const [uploadError, setUploadError] = useState("")
    const [alertMsg, setAlertMsg] = useState("")
    const [uploadedResumeName, setUploadedResumeName] = useState("")

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        setUploadError("")
        setUploadedResumeName("")
        try {
            const formData = new FormData()
            formData.append("file", file)
            const config = { headers: { "Content-Type": "multipart/form-data" } }
            const uploadWithRetry = async () => {
                try {
                    const res = await api.post("/api/resumes", formData, config)
                    return res
                } catch (e: any) {
                    if (e?.response?.status >= 500) {
                        await new Promise(r => setTimeout(r, 1500))
                        return await api.post("/api/resumes", formData, config)
                    }
                    throw e
                }
            }
            const res = await uploadWithRetry()
            setResumeId(res.data.id)
            setUploadedResumeName(res.data.filename)
            refreshData()
            setResumeInputType("select")
        } catch (e: any) {
            setUploadError(e?.response?.data?.detail || e?.message || "Upload failed")
        } finally {
            setUploading(false)
            ;(e.target as HTMLInputElement).value = ""
        }
    }

    useEffect(() => {
        if (resumeId && isLoaded && isSignedIn) {
            api.get(`/api/resumes/${resumeId}`).then(r => setOriginalText(r.data.raw_text)).catch(() => setOriginalText(""))
        } else if (!resumeId) {
            setOriginalText("")
        }
    }, [resumeId, isLoaded, isSignedIn])

    const polish = async () => {
        if (!resumeId) return

        setLoading(true)
        setError("")
        setResult(null)
        try {
            const payload = { resume_id: resumeId, save_as_version: true }
            const res = await api.post("/api/resumes/quick-optimize", payload)
            refreshData()
            setResult(res.data)

            const data = res.data

            if (data.structured_resume) {
              console.log("✨ Using structured_resume from extraction pipeline")
              setResumeData(structuredResumeToResumeData(data.structured_resume))
            } else if (data.optimized_sections && Object.keys(data.optimized_sections).length > 0) {
              console.log("🔄 Using optimized_sections (backward compat)")
              setResumeData(resumeSectionsToResumeData(data.optimized_sections, undefined, data.contact_info))
            } else if (data.optimized_text) {
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

    const downloadPolishedPdf = async () => {
        const element = document.getElementById("resume-canvas-content")
        if (!element) {
            setAlertMsg("Could not find resume content to export.")
            return
        }

        const selectedResume = resumes.find(r => r.id === resumeId)
        const name = selectedResume?.filename?.replace(/\.[^.]+$/, "") || "resume"

        try {
            await downloadElementAsPdf(element, `${name}_polished.pdf`)
        } catch (err) {
            console.error("PDF Export Error:", err)
            setAlertMsg("Failed to generate PDF. Please try again.")
        }
    }

    const downloadPolishedDocx = async () => {
        const textToExport = resumeData ? resumeDataToRawText(resumeData) : (result?.optimized_text || "")
        if (!textToExport) return

        const selectedResume = resumes.find(r => r.id === resumeId)
        const name = selectedResume?.filename?.replace(/\.[^.]+$/, "") || "resume"
        try {
            await downloadTextAsDocx(textToExport, `${name}_polished.docx`, theme.headingColor)
        } catch {
            setAlertMsg("Failed to generate DOCX. Please try again.")
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-2">
                    <Sparkles className="text-violet-400" size={28} />
                    <div>
                        <h1 className="text-2xl font-bold text-white">Resume Polish</h1>
                        <p className="text-gray-400 text-sm mt-1">Improve your resume's structure, language, and impact — no job description needed</p>
                    </div>
                </div>
            </div>

            <div className="glass p-6 space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Resume</label>
                    <div className="border border-white/10 rounded-xl overflow-hidden bg-[rgba(255,255,255,0.02)]">
                        {resumes.length > 0 && (
                            <div className={`p-3 transition-colors border-b border-white/10 ${resumeInputType === "select" ? "bg-white/5" : "hover:bg-white/[0.04]"}`}>
                                <label className="flex items-center gap-3 cursor-pointer max-w-full">
                                    <input type="radio" name="resume_type" checked={resumeInputType === "select"} onChange={() => setResumeInputType("select")} className="accent-violet-500 w-4 h-4 flex-shrink-0 cursor-pointer" />
                                    <span className={`text-sm font-medium transition-colors ${resumeInputType === "select" ? "text-white" : "text-gray-400"}`}>Select Saved Resume</span>
                                </label>
                                {resumeInputType === "select" && (
                                    <div className="pl-7 mt-2">
                                        <select className="input-styled w-full py-1.5 text-sm" value={resumeId} onChange={e => setResumeId(e.target.value)}>
                                            <option value="">Choose resume...</option>
                                            {resumes.map((r: any) => <option key={r.id} value={r.id}>{r.filename}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className={`p-3 transition-colors ${resumeInputType === "upload" || resumes.length === 0 ? "bg-white/5" : "hover:bg-white/[0.04]"}`}>
                            <label className="flex items-center gap-3 cursor-pointer max-w-full">
                                <input type="radio" name="resume_type" checked={resumeInputType === "upload" || resumes.length === 0} onChange={() => setResumeInputType("upload")} className="accent-violet-500 w-4 h-4 flex-shrink-0 cursor-pointer" />
                                <span className={`text-sm font-medium transition-colors ${resumeInputType === "upload" || resumes.length === 0 ? "text-white" : "text-gray-400"}`}>Upload Resume</span>
                            </label>

                            {(resumeInputType === "upload" || resumes.length === 0) && (
                                <div className="pl-7 mt-2 space-y-2">
                                    <input
                                        type="file"
                                        accept=".pdf,.docx"
                                        onChange={handleResumeUpload}
                                        disabled={uploading}
                                        className="input-styled text-sm py-1.5 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-violet-500/20 file:text-violet-300 hover:file:bg-violet-500/30 cursor-pointer disabled:opacity-50"
                                    />
                                    {uploadedResumeName && (
                                        <p className="text-xs text-emerald-400">✓ Uploaded: {uploadedResumeName}</p>
                                    )}
                                    {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
                                    {uploading && (
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            <Loader2 size={12} className="animate-spin" />
                                            Uploading...
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
                    <p className="text-xs text-violet-300">
                        <strong>Smart Polish:</strong> Our AI improves clarity, consistency, and professionalism across all sections — making your resume stronger for any job.
                    </p>
                </div>

                {loadingPlan ? (
                    <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-center flex items-center justify-center">
                        <Loader2 size={20} className="text-violet-400 animate-spin mr-2" />
                        <span className="text-gray-400 text-sm">Loading...</span>
                    </div>
                ) : (
                    <>
                        <button onClick={polish} disabled={loading || !resumeId}
                            className="btn-glow px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 disabled:opacity-50">
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                            {loading ? "Polishing your resume..." : "Polish My Resume"}
                        </button>
                        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    </>
                )}
            </div>

            {loading && (
                <div className="glass p-12 text-center space-y-4">
                    <Loader2 size={40} className="text-violet-400 animate-spin mx-auto" />
                    <p className="text-gray-300 font-medium">Polishing your resume...</p>
                    <p className="text-gray-500 text-sm">This takes 15-30 seconds</p>
                </div>
            )}

            {result && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {/* Changes */}
                    {result.changes_summary?.length > 0 && (
                        <div className="glass p-6">
                            <h3 className="font-semibold text-white mb-3">Improvements Made</h3>
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
                            onDownloadPdf={downloadPolishedPdf}
                            onDownloadDocx={downloadPolishedDocx}
                            onCopyText={copy}
                        />
                    )}
                    {result.new_resume_id && (
                        <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <p className="text-sm text-emerald-300 font-medium mb-1">
                                ✓ Successfully saved as a polished resume version!
                            </p>
                            <p className="text-xs text-emerald-400/80 mb-3">
                                Your polished resume has been saved to your account. You can download it or view it in your dashboard.
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

export default function QuickOptimizePage() {
    return (
        <Suspense fallback={<div className="animate-pulse text-gray-500 p-8">Loading...</div>}>
            <QuickOptimizeContent />
        </Suspense>
    )
}
