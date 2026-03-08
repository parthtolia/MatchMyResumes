"use client"
import { useState, useEffect, Suspense, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Loader2, Copy, Check, Download, Edit3, Eye, Bold, Italic, List as ListIcon } from "lucide-react"
import api from "@/lib/api"
import { useUser as useClerkUser } from "@clerk/nextjs"
import ReactMarkdown from "react-markdown"
import { useGlobalData } from "@/components/dashboard/GlobalDataProvider"

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

const TONES = ["professional", "enthusiastic", "confident", "creative"]
const LENGTHS = [
    { value: "short", label: "Short (~200 words)" },
    { value: "medium", label: "Medium (~350 words)" },
    { value: "long", label: "Long (~500 words)" },
]

const LOADING_TEXTS = [
    "Analyzing Job Description...",
    "Extracting your key skills...",
    "Drafting cover letter...",
    "Polishing Tone..."
]

function CoverLetterContent() {
    const params = useSearchParams()
    const { resumes, jobs, loadingData, refreshData } = useGlobalData()
    const [resumeId, setResumeId] = useState(params.get("resume_id") || "")
    const [jdId, setJdId] = useState(params.get("jd_id") || "")
    const [jdInputType, setJdInputType] = useState<"saved" | "text">("saved")
    const [jdTitle, setJdTitle] = useState("")
    const [jdText, setJdText] = useState("")
    const [tone, setTone] = useState("professional")
    const [length, setLength] = useState("medium")
    const [companyName, setCompanyName] = useState("")
    const [jobTitle, setJobTitle] = useState("")
    const [content, setContent] = useState("")

    const [loading, setLoading] = useState(false)
    const [loadingStep, setLoadingStep] = useState(0)
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState("")

    const [viewMode, setViewMode] = useState<"edit" | "preview">("edit")
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const { isLoaded, isSignedIn } = useUserSafe()

    // Progressive loading states
    useEffect(() => {
        if (!loading) return;
        setLoadingStep(0)
        const interval = setInterval(() => {
            setLoadingStep(s => (s + 1) % LOADING_TEXTS.length)
        }, 2000)
        return () => clearInterval(interval)
    }, [loading])

    const generate = async () => {
        if (!resumeId) return;
        if (jdInputType === "saved" && !jdId) return;
        if (jdInputType === "text" && (!jdTitle.trim() || !jdText.trim())) return;

        setLoading(true)
        setError("")
        let interval: NodeJS.Timeout | undefined;

        try {
            let actualJdId = jdId
            if (jdInputType === "text") {
                const jdRes = await api.post("/api/jobs/", { raw_text: jdText, title: jdTitle })
                actualJdId = jdRes.data.id
                refreshData()
            }

            // Start progressive loading
            interval = setInterval(() => {
                setLoadingStep(s => {
                    if (s < LOADING_TEXTS.length - 1) return s + 1
                    return s
                })
            }, 1000)

            const payload = {
                resume_id: resumeId,
                jd_id: actualJdId,
                tone,
                length,
                company_name: companyName || undefined,
                job_title: jobTitle || jdTitle || undefined
            }

            const res = await api.post("/api/cover-letters/", payload)
            setContent(res.data.content)
            setViewMode("edit")
        } catch (e: any) {
            setError(e.response?.data?.detail || e.message)
        } finally {
            setLoading(false)
            if (interval) clearInterval(interval)
        }
    }

    const copy = () => {
        navigator.clipboard.writeText(content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const downloadPdf = async () => {
        if (!content) return;
        try {
            const { jsPDF } = await import("jspdf");
            const doc = new jsPDF({ format: 'letter' });
            doc.setFont("helvetica");
            doc.setFontSize(11);

            const margin = 20;
            const pageWidth = doc.internal.pageSize.getWidth();
            const maxLineWidth = pageWidth - margin * 2;

            // Very simple stripping of markdown for baseline PDF
            // A perfect implementation would parse MD or use html2canvas
            const cleanText = content.replace(/\*\*/g, "").replace(/\#/g, "");

            const textLines = doc.splitTextToSize(cleanText, maxLineWidth);
            doc.text(textLines, margin, margin);

            doc.save("Cover_Letter.pdf");
        } catch (e) {
            console.error(e);
            alert("Failed to generate PDF");
        }
    }

    const insertSyntax = (syntax: string) => {
        if (!textareaRef.current) return;
        const ta = textareaRef.current;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const text = ta.value;
        const newText = text.substring(0, start) + syntax + text.substring(end);
        setContent(newText);
        setTimeout(() => {
            ta.selectionStart = ta.selectionEnd = start + syntax.length;
            ta.focus();
        }, 0);
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Cover Letter Generator</h1>
                <p className="text-gray-400 text-sm mt-1">Generate a tailored, ATS-optimized cover letter in seconds</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.5fr] gap-6 xl:min-h-[680px]">
                {/* Config Panel */}
                <div className="flex flex-col">
                    <div className="glass p-6 space-y-4 flex-1">
                        <h2 className="font-semibold text-white mb-2">Configuration</h2>

                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Resume</label>
                            {loadingData ? (
                                <div className="flex items-center gap-2 text-violet-400 text-sm py-2">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Loading...</span>
                                </div>
                            ) : (
                                <select className="input-styled" value={resumeId} onChange={e => setResumeId(e.target.value)}>
                                    <option value="">Select a resume...</option>
                                    {resumes.map(r => <option key={r.id} value={r.id}>{r.filename}</option>)}
                                </select>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5">Job Description Source</label>
                            <div className="border border-white/10 rounded-xl overflow-hidden bg-[rgba(255,255,255,0.02)]">
                                {jobs.length > 0 && (
                                    <div className={`p-3 transition-colors border-b border-white/10 ${jdInputType === "saved" ? "bg-white/5" : "hover:bg-white/[0.04]"}`}>
                                        <label className="flex items-center gap-3 cursor-pointer max-w-full">
                                            <input type="radio" name="cl_jd_type" checked={jdInputType === "saved"} onChange={() => setJdInputType("saved")} className="accent-violet-500 w-4 h-4 flex-shrink-0 cursor-pointer" />
                                            <span className={`text-sm font-medium transition-colors ${jdInputType === "saved" ? "text-white" : "text-gray-400"}`}>Select Saved Job</span>
                                        </label>
                                        {jdInputType === "saved" && (
                                            <div className="pl-7 mt-2">
                                                <select className="input-styled w-full py-1.5 text-sm" value={jdId} onChange={e => setJdId(e.target.value)}>
                                                    <option value="">Select a job description...</option>
                                                    {jobs.map(j => <option key={j.id} value={j.id}>{j.title || j.id.slice(0, 8)}</option>)}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className={`p-3 transition-colors ${jdInputType === "text" || jobs.length === 0 ? "bg-white/5" : "hover:bg-white/[0.04]"}`}>
                                    <label className="flex items-center gap-3 cursor-pointer max-w-full">
                                        <input type="radio" name="cl_jd_type" checked={jdInputType === "text" || jobs.length === 0} onChange={() => setJdInputType("text")} className="accent-violet-500 w-4 h-4 flex-shrink-0 cursor-pointer" />
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

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Company <span className="text-gray-600">(opt)</span></label>
                                <input type="text" className="input-styled py-1.5 text-sm" placeholder="e.g. Google" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Job Title <span className="text-gray-600">(opt)</span></label>
                                <input type="text" className="input-styled py-1.5 text-sm" placeholder="e.g. SWE" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Tone</label>
                            <div className="grid grid-cols-2 gap-1.5">
                                {TONES.map(t => (
                                    <button key={t} onClick={() => setTone(t)}
                                        className={`py-1.5 px-3 rounded-lg text-xs font-medium capitalize transition-all ${tone === t ? "bg-violet-500/20 border border-violet-500/50 text-violet-300" : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Length</label>
                            <div className="grid grid-cols-3 gap-1.5">
                                {LENGTHS.map(l => (
                                    <button key={l.value} onClick={() => setLength(l.value)}
                                        className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${length === l.value ? "bg-violet-500/20 border border-violet-500/50 text-violet-300" : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"}`}>
                                        {l.label.split(" ")[0]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button onClick={generate} disabled={loading || !resumeId || (jdInputType === "saved" ? !jdId : (!jdText.trim() || !jdTitle.trim()))}
                            className="w-full btn-glow py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 mt-4">
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                            {loading ? "Generating..." : "Generate Cover Letter"}
                        </button>
                        {error && <p className="text-red-400 text-xs">{error}</p>}
                    </div>
                </div>

                {/* Output Panel */}
                <div className="h-full min-h-[600px]">
                    {loading ? (
                        <div className="glass p-12 h-full flex flex-col items-center justify-center text-center">
                            <Loader2 size={48} className="text-violet-400 animate-spin mb-4" />
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={loadingStep}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="text-gray-300 font-medium text-lg"
                                >
                                    {LOADING_TEXTS[loadingStep]}
                                </motion.p>
                            </AnimatePresence>
                            <p className="text-gray-500 text-sm mt-3">Using GPT-4o to write your personalized letter</p>
                        </div>
                    ) : content ? (
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass flex flex-col h-full overflow-hidden">
                            {/* Editor Header */}
                            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
                                <div className="flex bg-black/20 p-1 rounded-lg">
                                    <button
                                        onClick={() => setViewMode("edit")}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "edit" ? "bg-white/10 text-white" : "text-gray-400 hover:text-gray-200"}`}
                                    >
                                        <Edit3 size={14} /> Write
                                    </button>
                                    <button
                                        onClick={() => setViewMode("preview")}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "preview" ? "bg-white/10 text-white" : "text-gray-400 hover:text-gray-200"}`}
                                    >
                                        <Eye size={14} /> Preview
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={downloadPdf} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs transition-all">
                                        <Download size={14} /> PDF
                                    </button>
                                    <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs transition-all">
                                        {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
                                    </button>
                                </div>
                            </div>

                            {/* Toolbar */}
                            {viewMode === "edit" && (
                                <div className="flex gap-1 p-2 px-4 border-b border-white/5 bg-black/10">
                                    <button onClick={() => insertSyntax("**bold**")} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded"><Bold size={14} /></button>
                                    <button onClick={() => insertSyntax("_italic_")} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded"><Italic size={14} /></button>
                                    <button onClick={() => insertSyntax("\n- ")} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded"><ListIcon size={14} /></button>
                                </div>
                            )}

                            {/* Editor Body */}
                            <div className="flex-1 p-6 overflow-y-auto">
                                {viewMode === "edit" ? (
                                    <textarea
                                        ref={textareaRef}
                                        className="w-full h-full min-h-[400px] bg-transparent text-gray-300 text-sm leading-relaxed resize-none focus:outline-none placeholder-gray-600"
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                        placeholder="Your cover letter text..."
                                    />
                                ) : (
                                    <div className="prose prose-invert prose-violet max-w-none text-sm leading-relaxed text-gray-300">
                                        <ReactMarkdown>{content}</ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <div className="glass p-12 h-full flex flex-col items-center justify-center text-center">
                            <Mail size={48} className="text-gray-600 mb-4" />
                            <p className="text-gray-400 font-medium">Your cover letter will appear here</p>
                            <p className="text-gray-600 text-sm mt-1 max-w-xs">Select a resume and job description, then click generate to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function CoverLetterPage() {
    return (
        <Suspense fallback={<div className="animate-pulse text-gray-500">Loading...</div>}>
            <CoverLetterContent />
        </Suspense>
    )
}
