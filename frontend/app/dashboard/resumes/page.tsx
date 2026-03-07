"use client"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { FileText, Upload, Trash2, Tag, Loader2, Copy, CheckCircle2 } from "lucide-react"
import { useDropzone } from "react-dropzone"
import api from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { useUser as useClerkUser } from "@clerk/nextjs"

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

import { useGlobalData } from "@/components/dashboard/GlobalDataProvider"

export default function ResumesPage() {
    const { resumes, loadingData: loading, refreshData } = useGlobalData()
    const [uploading, setUploading] = useState(false)
    const [selected, setSelected] = useState<any>(null)
    const [error, setError] = useState("")
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [deleteSuccess, setDeleteSuccess] = useState(false)
    // useRef so deleted IDs survive all re-renders (state from GlobalDataProvider won't reset it)
    const deletedRef = useRef<Set<string>>(new Set())
    const [localResumes, setLocalResumes] = useState<typeof resumes>([])

    // Keep local list in sync with global, but always exclude deleted IDs
    useEffect(() => {
        setLocalResumes(resumes.filter(r => !deletedRef.current.has(r.id)))
    }, [resumes])

    const onDrop = async (files: File[]) => {
        const file = files[0]
        if (!file) return
        setUploading(true)
        setError("")
        try {
            const formData = new FormData()
            formData.append("file", file)
            await api.post("/api/resumes/upload", formData, { headers: { "Content-Type": "multipart/form-data" } })
            refreshData()
        } catch (e: any) {
            setError(e.message)
        } finally { setUploading(false) }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "application/pdf": [".pdf"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"] } })

    const deleteResume = async (id: string) => {
        // Mark as deleted in ref (persists forever) + immediately remove from local list
        deletedRef.current.add(id)
        setLocalResumes(prev => prev.filter(r => r.id !== id))
        if (selected?.id === id) setSelected(null)
        setDeleteSuccess(true)
        setTimeout(() => setDeleteSuccess(false), 2500)
        setDeletingId(id)
        try {
            await api.delete(`/api/resumes/${id}`)
            refreshData() // background sync
        } catch {
            // Revert: remove from ref and restore via refresh
            deletedRef.current.delete(id)
            refreshData()
            setDeleteSuccess(false)
            setError("Failed to delete resume. Please try again.")
        } finally {
            setDeletingId(null)
        }
    }

    const viewDetail = async (id: string) => {
        const res = await api.get(`/api/resumes/${id}`)
        setSelected(res.data)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
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
            <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${isDragActive ? "border-violet-500 bg-violet-500/10" : "border-white/10 hover:border-violet-500/40"}`}>
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
            {deleteSuccess && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <CheckCircle2 size={16} /> Resume deleted successfully
                </div>
            )}

            {/* Resume Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-2">
                    {loading ? (
                        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-violet-400" /></div>
                    ) : localResumes.length === 0 ? (
                        <div className="glass p-8 text-center">
                            <FileText size={40} className="text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No resumes uploaded yet</p>
                        </div>
                    ) : (
                        localResumes.map(resume => (
                            <motion.div key={resume.id} layout
                                onClick={() => viewDetail(resume.id)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${selected?.id === resume.id ? "border-violet-500/50 bg-violet-500/10" : "border-white/5 bg-[#111118] hover:border-white/10"}`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <FileText size={16} className={resume.is_optimized ? "text-emerald-400" : "text-violet-400"} />
                                        <span className="text-sm text-white truncate">{resume.filename}</span>
                                    </div>
                                    <button onClick={e => { e.stopPropagation(); deleteResume(resume.id) }} disabled={deletingId !== null} className="text-gray-600 hover:text-red-400 transition-colors ml-2 shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40">
                                        {deletingId === resume.id ? <Loader2 size={14} className="animate-spin text-red-400" /> : <Trash2 size={14} />}
                                    </button>
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
                        ))
                    )}
                </div>

                {/* Detail Panel */}
                <div className="lg:col-span-2">
                    {selected ? (
                        <div className="glass p-6 h-full">
                            <h3 className="font-semibold text-white mb-1">{selected.filename}</h3>
                            <p className="text-xs text-gray-500 mb-4">{formatDate(selected.created_at)}</p>
                            {selected.structured_json && (
                                <div className="space-y-3 mb-4">
                                    {Object.entries(selected.structured_json).filter(([, v]) => v).map(([k, v]) => (
                                        <div key={k}>
                                            <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">{k}</span>
                                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-3">{v as string}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <textarea className="input-styled resize-none text-xs font-mono" rows={16} readOnly value={selected.raw_text} />
                        </div>
                    ) : (
                        <div className="glass p-12 h-full flex flex-col items-center justify-center text-center">
                            <FileText size={48} className="text-gray-600 mb-3" />
                            <p className="text-gray-500">Select a resume to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
