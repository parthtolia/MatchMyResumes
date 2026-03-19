"use client"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, Upload, Trash2, Tag, Loader2, CheckCircle2, AlertTriangle, Check, Copy, Download } from "lucide-react"
import AlertModal from "@/components/ui/AlertModal"
import { useDropzone } from "react-dropzone"
import api from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { useGlobalData } from "@/components/dashboard/GlobalDataProvider"
import { downloadTextAsPdf, downloadTextAsDocx, downloadElementAsPdf } from "@/lib/download"
import ResumePreview from "@/components/templates/ResumePreview"
import { templates } from "@/lib/templates"

// ── Custom delete confirmation modal ─────────────────────────────────────────
function DeleteModal({ count, onConfirm, onCancel }: {
    count: number
    onConfirm: () => void
    onCancel: () => void
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                className="relative glass border border-white/15 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center shrink-0">
                        <AlertTriangle size={18} className="text-red-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">
                            Delete {count > 1 ? `${count} Resumes` : "Resume"}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone</p>
                    </div>
                </div>
                <p className="text-sm text-gray-400 mb-6">
                    {count > 1
                        ? `Are you sure you want to permanently delete ${count} selected resumes?`
                        : "Are you sure you want to permanently delete this resume?"
                    }
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-sm font-medium transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 text-sm font-medium transition-all"
                    >
                        Delete{count > 1 ? " All" : ""}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ResumesPage() {
    const { resumes, loadingData: loading, refreshData } = useGlobalData()
    const [uploading, setUploading] = useState(false)
    const [selected, setSelected] = useState<any>(null)
    const [error, setError] = useState("")
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const [deleteSuccess, setDeleteSuccess] = useState(false)
    const [deleting, setDeleting] = useState(false) // instant feedback after confirm

    // Loading detail
    const [loadingDetail, setLoadingDetail] = useState(false)
    // Track which IDs are mid-delete (Set so multiple concurrent deletes work)
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
    // Ref persists across re-renders — keeps deleted IDs out of the list even after refreshData()
    const deletedRef = useRef<Set<string>>(new Set())
    const [localResumes, setLocalResumes] = useState<typeof resumes>([])

    // Multi-select
    const [selectMode, setSelectMode] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    // Delete modal
    const [deleteModal, setDeleteModal] = useState<string[] | null>(null)

    // Template selector
    const [selectedTemplateId, setSelectedTemplateId] = useState("executive-senior-manager")

    // Copy state
    const [copied, setCopied] = useState(false)
    // Alert modal
    const [alertMsg, setAlertMsg] = useState("")
    const resumeRef = useRef<HTMLDivElement>(null)

    const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0]

    const getLatestText = () => {
        if (resumeRef.current) {
            return resumeRef.current.innerText || selected?.raw_text || ""
        }
        return selected?.raw_text || ""
    }

    const copyText = () => {
        if (!selected?.raw_text) return
        navigator.clipboard.writeText(getLatestText())
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const downloadPdf = async () => {
        if (!selected?.raw_text) return
        try { 
            if (resumeRef.current) {
                await downloadElementAsPdf(resumeRef.current, `${currentTemplate.slug}.pdf`)
            } else {
                await downloadTextAsPdf(getLatestText(), `${currentTemplate.slug}.pdf`) 
            }
        }
        catch { setAlertMsg("Failed to generate PDF. Please try again.") }
    }

    const downloadDocx = async () => {
        if (!selected?.raw_text) return
        try { await downloadTextAsDocx(getLatestText(), currentTemplate.fileName) }
        catch { setAlertMsg("Failed to generate DOCX. Please try again.") }
    }

    // Keep local list in sync with global, always filtering out already-deleted IDs
    useEffect(() => {
        setLocalResumes(resumes.filter(r => !deletedRef.current.has(r.id)))
    }, [resumes])

    // ── Upload ──────────────────────────────────────────────────────────────
    const onDrop = async (files: File[]) => {
        const file = files[0]
        if (!file) return
        setUploading(true)
        setError("")
        setUploadSuccess(false)
        try {
            const formData = new FormData()
            formData.append("file", file)
            const uploadWithRetry = async () => {
                const config = { headers: { "Content-Type": "multipart/form-data" } }
                try {
                    return await api.post("/api/resumes", formData, config)
                } catch (err: any) {
                    if (err?.response?.status && err.response.status >= 500) {
                        await new Promise(r => setTimeout(r, 1500))
                        return await api.post("/api/resumes", formData, config)
                    }
                    throw err
                }
            }
            const res = await uploadWithRetry()
            setLocalResumes(prev => [res.data, ...prev])
            setUploadSuccess(true)
            setTimeout(() => setUploadSuccess(false), 3000)
            refreshData()
        } catch (e: any) {
            setError(e.response?.data?.detail || e.message)
        } finally {
            setUploading(false)
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        onDropRejected: (rejections) => {
            const msg = rejections[0]?.errors[0]?.message || "File rejected"
            setError(msg.includes("larger") ? "File size exceeds 10MB limit" : msg)
        },
    })

    // ── Delete logic ────────────────────────────────────────────────────────
    const requestDelete = (ids: string[]) => setDeleteModal(ids)

    const performDelete = async (ids: string[]) => {
        setError("")
        setDeleteSuccess(false)
        // Optimistically remove from UI + show instant "Deleting…" status
        ids.forEach(id => deletedRef.current.add(id))
        setDeletingIds(prev => new Set([...prev, ...ids]))
        setDeleting(true)
        setLocalResumes(prev => prev.filter(r => !ids.includes(r.id)))
        if (selected && ids.includes(selected.id)) setSelected(null)
        if (selectMode) {
            setSelectedIds(new Set())
            setSelectMode(false)
        }

        // Fire all deletes in parallel
        const results = await Promise.allSettled(ids.map(id => api.delete(`/api/resumes/${id}`)))

        const failed = ids.filter((_, i) => results[i].status === "rejected")
        setDeletingIds(new Set())
        setDeleting(false)

        if (failed.length > 0) {
            failed.forEach(id => deletedRef.current.delete(id))
            refreshData()
            setError(failed.length === ids.length
                ? "Failed to delete resume(s). Please try again."
                : `${failed.length} resume(s) could not be deleted.`
            )
        } else {
            setDeleteSuccess(true)
            setTimeout(() => setDeleteSuccess(false), 2500)
            setTimeout(() => refreshData(), 2000)
        }
    }

    const confirmDelete = () => {
        if (!deleteModal) return
        const ids = deleteModal
        setDeleteModal(null)
        performDelete(ids)
    }

    // ── Select mode ─────────────────────────────────────────────────────────
    const toggleSelectMode = () => {
        setSelectMode(s => !s)
        setSelectedIds(new Set())
    }

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    const selectAll = () => {
        setSelectedIds(new Set(localResumes.map(r => r.id)))
    }

    // ── View detail ─────────────────────────────────────────────────────────
    const viewDetail = async (id: string) => {
        if (selectMode) { toggleSelect(id); return }
        setLoadingDetail(true)
        try {
            const res = await api.get(`/api/resumes/${id}`)
            setSelected(res.data)
        } catch (e: any) {
            setError(e.message || "Failed to load resume")
        } finally {
            setLoadingDetail(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Resumes</h1>
                    <p className="text-gray-400 text-sm mt-1">{localResumes.length} resume versions stored</p>
                </div>
                {loading && resumes.length > 0 && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                        Syncing…
                    </span>
                )}
            </div>

            {/* Upload */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${isDragActive ? "border-violet-500 bg-violet-500/10" : "border-white/10 hover:border-violet-500/40"}`}
            >
                <input {...getInputProps()} />
                {uploading ? (
                    <div className="flex items-center justify-center gap-3 text-gray-400">
                        <Loader2 size={20} className="animate-spin" /> Uploading...
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-3 text-gray-400">
                        <Upload size={20} />
                        <span className="text-sm">{isDragActive ? "Drop to upload" : "Drop resume here or click to browse"}</span>
                    </div>
                )}
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            {uploadSuccess && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <CheckCircle2 size={16} /> Resume uploaded successfully
                </div>
            )}
            {deleting && (
                <div className="flex items-center gap-2 text-violet-400 text-sm">
                    <Loader2 size={14} className="animate-spin" /> Deleting…
                </div>
            )}
            {!deleting && deleteSuccess && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <CheckCircle2 size={16} /> Deleted successfully
                </div>
            )}

            {/* Resume Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: "calc(100vh - 320px)", minHeight: "400px" }}>
                <div className="lg:col-span-1 space-y-2 overflow-y-auto pr-1">
                    {/* Select controls — shown above the list */}
                    {localResumes.length > 0 && (
                        <div className="flex items-center gap-2 pb-1">
                            {selectMode && (
                                <button
                                    onClick={selectAll}
                                    className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white transition-all"
                                >
                                    Select All
                                </button>
                            )}
                            <button
                                onClick={toggleSelectMode}
                                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${selectMode
                                    ? "border-violet-500/50 bg-violet-500/10 text-violet-300"
                                    : "border-white/10 text-gray-400 hover:text-white"
                                    }`}
                            >
                                {selectMode ? "Cancel" : "Select"}
                            </button>
                            {selectMode && selectedIds.size > 0 && (
                                <button
                                    onClick={() => requestDelete(Array.from(selectedIds))}
                                    className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-1.5"
                                >
                                    <Trash2 size={12} /> Delete ({selectedIds.size})
                                </button>
                            )}
                        </div>
                    )}
                    {loading && localResumes.length === 0 ? (
                        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-violet-400" /></div>
                    ) : localResumes.length === 0 ? (
                        <div className="glass p-8 text-center">
                            <FileText size={40} className="text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No resumes uploaded yet</p>
                        </div>
                    ) : (
                        localResumes.map(resume => {
                            const isDeleting = deletingIds.has(resume.id)
                            const isChecked = selectedIds.has(resume.id)
                            const isActive = selectMode ? isChecked : selected?.id === resume.id
                            return (
                                <motion.div
                                    key={resume.id}
                                    layout
                                    onClick={() => !isDeleting && !loadingDetail && viewDetail(resume.id)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${isDeleting ? "opacity-40 pointer-events-none" : ""} ${isActive ? "border-violet-500/50 bg-violet-500/10" : "border-white/5 bg-[#111118] hover:border-white/10"}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2 min-w-0">
                                            {selectMode ? (
                                                <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${isChecked ? "border-violet-500 bg-violet-500" : "border-white/30 bg-transparent"}`}>
                                                    {isChecked && <Check size={10} className="text-white" strokeWidth={3} />}
                                                </div>
                                            ) : (
                                                <FileText size={16} className={resume.is_optimized ? "text-emerald-400" : "text-violet-400"} />
                                            )}
                                            <span className="text-sm text-white truncate">{resume.filename}</span>
                                        </div>
                                        {!selectMode && (
                                            <button
                                                onClick={e => { e.stopPropagation(); requestDelete([resume.id]) }}
                                                disabled={isDeleting}
                                                className="text-gray-600 hover:text-red-400 transition-colors ml-2 shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                {isDeleting
                                                    ? <Loader2 size={14} className="animate-spin text-red-400" />
                                                    : <Trash2 size={14} />
                                                }
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        {resume.version_tag && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Tag size={10} />
                                                <span>{resume.version_tag}</span>
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-600">{formatDate(resume.created_at)}</div>
                                        {resume.is_optimized && (
                                            <div className="text-[9px] uppercase tracking-wider font-bold text-emerald-400/80 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                                                AI Optimized
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })
                    )}
                </div>

                {/* Detail Panel */}
                <div className="lg:col-span-2">
                    {loadingDetail ? (
                        <div className="glass p-12 h-full flex flex-col items-center justify-center text-center">
                            <Loader2 size={36} className="text-violet-400 animate-spin mb-3" />
                            <p className="text-sm text-gray-300 font-medium">Loading resume...</p>
                        </div>
                    ) : selected && !selectMode ? (
                        <div className="glass p-6">
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h3 className="font-semibold text-white">{selected.filename}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{formatDate(selected.created_at)}</p>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <select
                                        value={selectedTemplateId}
                                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                                        className="bg-[#1a1a24] border border-white/10 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-violet-500 cursor-pointer"
                                    >
                                        <optgroup label="Choose Template" className="bg-[#1a1a24] text-white">
                                            {templates.map((t) => (
                                                <option key={t.id} value={t.id} className="bg-[#1a1a24] text-white py-1">
                                                    {t.name}
                                                </option>
                                            ))}
                                        </optgroup>
                                    </select>
                                    
                                    <div className="flex items-center gap-1.5 shrink-0 border-l border-white/10 pl-3">
                                        <button onClick={copyText} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs transition-colors" title="Copy text">
                                            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                            <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
                                        </button>
                                        <button onClick={downloadPdf} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs transition-colors" title="Download as PDF">
                                            <Download size={14} /> <span className="hidden sm:inline">PDF</span>
                                        </button>
                                        <button onClick={downloadDocx} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs transition-colors" title="Download as DOCX">
                                            <Download size={14} /> <span className="hidden sm:inline">DOCX</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-[#0f0f15] rounded-xl max-h-[750px] overflow-y-auto p-4 sm:p-8 lg:p-12 border border-white/10 ring-1 ring-white/5">
                                <div ref={resumeRef} className="w-full">
                                    {selected.structured_json ? (
                                        <ResumePreview
                                            structuredData={selected.structured_json as Record<string, string>}
                                            templateId={selectedTemplateId}
                                        />
                                    ) : (
                                        <div 
                                          className="bg-white p-8 sm:p-12 min-h-[1056px] shadow-2xl max-w-[816px] mx-auto text-gray-900 border-t-[16px] outline-none" 
                                          style={{ borderColor: currentTemplate.color }}
                                          contentEditable
                                          suppressContentEditableWarning
                                        >
                                            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{selected.raw_text}</pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass p-12 h-full flex flex-col items-center justify-center text-center">
                            <FileText size={48} className="text-gray-600 mb-3" />
                            <p className="text-gray-500">
                                {selectMode ? "Select resumes to delete, then click Delete" : "Select a resume to view details"}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Modal */}
            <AnimatePresence>
                {deleteModal && (
                    <DeleteModal
                        count={deleteModal.length}
                        onConfirm={confirmDelete}
                        onCancel={() => setDeleteModal(null)}
                    />
                )}
            </AnimatePresence>
            <AlertModal
                open={!!alertMsg}
                title="Download Failed"
                message={alertMsg}
                onClose={() => setAlertMsg("")}
            />
        </div>
    )
}
