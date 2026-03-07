"use client"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Briefcase, Calendar, ExternalLink, X, Loader2, ChevronDown, ChevronUp, Edit3, Check } from "lucide-react"
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

type Status = "saved" | "applied" | "interview" | "offer" | "rejected" | "withdrawn"

const COLUMNS: { id: Status; label: string; color: string; bg: string; dot: string }[] = [
    { id: "saved", label: "Saved", color: "border-gray-500", bg: "bg-gray-500/10", dot: "bg-gray-400" },
    { id: "applied", label: "Applied", color: "border-blue-500", bg: "bg-blue-500/10", dot: "bg-blue-400" },
    { id: "interview", label: "Interview", color: "border-yellow-500", bg: "bg-yellow-500/10", dot: "bg-yellow-400" },
    { id: "offer", label: "Offer", color: "border-emerald-500", bg: "bg-emerald-500/10", dot: "bg-emerald-400" },
    { id: "rejected", label: "Rejected", color: "border-red-500", bg: "bg-red-500/10", dot: "bg-red-400" },
]

const STATUS_BORDER: Record<Status, string> = {
    saved: "border-l-gray-500",
    applied: "border-l-blue-500",
    interview: "border-l-yellow-500",
    offer: "border-l-emerald-500",
    rejected: "border-l-red-500",
    withdrawn: "border-l-gray-500",
}

interface Application {
    id: string
    company_name: string
    job_title: string
    status: Status
    notes?: string
    job_url?: string
    date_applied?: string
    created_at: string
}

function ApplicationCard({
    app,
    onMove,
    onDelete,
    onUpdateNotes,
}: {
    app: Application
    onMove: (id: string, status: Status) => void
    onDelete: (id: string) => void
    onUpdateNotes: (id: string, notes: string) => void
}) {
    const [expanded, setExpanded] = useState(false)
    const [editingNotes, setEditingNotes] = useState(false)
    const [notes, setNotes] = useState(app.notes || "")
    const [saving, setSaving] = useState(false)

    const saveNotes = async () => {
        setSaving(true)
        try {
            await api.patch(`/api/applications/${app.id}`, { notes })
            onUpdateNotes(app.id, notes)
            setEditingNotes(false)
        } catch { } finally { setSaving(false) }
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            draggable
            onDragStart={(e) => {
                (e as any).dataTransfer.setData("applicationId", app.id)
                    ; (e as any).dataTransfer.setData("currentStatus", app.status)
            }}
            className={`bg-[#1a1a2e] border border-white/10 border-l-4 ${STATUS_BORDER[app.status]} rounded-xl p-3 cursor-grab active:cursor-grabbing shadow-sm hover:border-white/20 transition-all`}
        >
            {/* Card Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm truncate">{app.company_name}</div>
                    <div className="text-xs text-gray-400 truncate mt-0.5">{app.job_title}</div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {app.job_url && (
                        <a href={app.job_url} target="_blank" rel="noopener noreferrer"
                            className="p-1 rounded text-gray-500 hover:text-blue-400 transition-colors"
                            onClick={e => e.stopPropagation()} title="Open job listing">
                            <ExternalLink size={12} />
                        </a>
                    )}
                    <button onClick={() => setExpanded(!expanded)}
                        className="p-1 rounded text-gray-500 hover:text-white transition-colors">
                        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                    <button onClick={() => onDelete(app.id)}
                        className="p-1 rounded text-gray-600 hover:text-red-400 transition-colors">
                        <X size={12} />
                    </button>
                </div>
            </div>

            {/* Date */}
            {app.date_applied && (
                <div className="flex items-center gap-1 text-[10px] text-gray-600 mt-1.5">
                    <Calendar size={9} />
                    {formatDate(app.date_applied)}
                </div>
            )}

            {/* Expanded section */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                            {/* Notes */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wide">Notes</span>
                                    {!editingNotes ? (
                                        <button onClick={() => setEditingNotes(true)}
                                            className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-1">
                                            <Edit3 size={9} /> Edit
                                        </button>
                                    ) : (
                                        <button onClick={saveNotes} disabled={saving}
                                            className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                                            {saving ? <Loader2 size={9} className="animate-spin" /> : <Check size={9} />} Save
                                        </button>
                                    )}
                                </div>
                                {editingNotes ? (
                                    <textarea
                                        className="w-full text-xs bg-white/5 rounded-lg p-2 text-gray-300 resize-none border border-white/10 focus:border-violet-500/50 outline-none"
                                        rows={3}
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        autoFocus
                                        placeholder="Add notes..."
                                    />
                                ) : (
                                    <p className="text-xs text-gray-400 italic">
                                        {notes || "No notes yet. Click Edit to add."}
                                    </p>
                                )}
                            </div>

                            {/* Move to actions */}
                            <div>
                                <span className="text-[10px] text-gray-500 uppercase tracking-wide">Move to</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {COLUMNS.filter(c => c.id !== app.status).map(col => (
                                        <button key={col.id} onClick={() => onMove(app.id, col.id)}
                                            className={`text-[10px] px-2 py-0.5 rounded-full ${col.bg} border border-white/10 text-gray-300 hover:text-white transition-all`}>
                                            {col.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default function TrackerPage() {
    const { isLoaded, isSignedIn } = useUserSafe()

    const CACHE_KEY = "tracker_apps_cache"
    const getCached = (): Application[] => {
        if (typeof window === "undefined") return []
        try { const c = localStorage.getItem(CACHE_KEY); return c ? JSON.parse(c) : [] } catch { return [] }
    }

    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(true)

    useEffect(() => {
        const cached = getCached()
        if (cached.length > 0) {
            setApplications(cached)
            setLoading(false)
        }
    }, [])
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ company_name: "", job_title: "", job_url: "", status: "applied" as Status, notes: "", date_applied: "" })
    const [saving, setSaving] = useState(false)
    const [dragOverCol, setDragOverCol] = useState<Status | null>(null)

    const fetchApps = async () => {
        if (!isLoaded || !isSignedIn) return
        try {
            const res = await api.get("/api/applications/")
            setApplications(res.data)
            localStorage.setItem(CACHE_KEY, JSON.stringify(res.data))
        } catch { } finally { setLoading(false); setRefreshing(false) }
    }

    useEffect(() => { fetchApps() }, [isLoaded, isSignedIn])

    const addApplication = async () => {
        if (!form.company_name || !form.job_title) return
        setSaving(true)
        try {
            const res = await api.post("/api/applications/", {
                ...form,
                date_applied: form.date_applied || undefined,
            })
            // Optimistically add to list immediately
            setApplications(prev => [...prev, res.data])
            setShowForm(false)
            setForm({ company_name: "", job_title: "", job_url: "", status: "applied", notes: "", date_applied: "" })
            fetchApps() // background refresh to sync
        } catch { } finally { setSaving(false) }
    }

    const moveStatus = async (id: string, newStatus: Status) => {
        // Optimistic update
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
        try {
            await api.patch(`/api/applications/${id}`, { status: newStatus })
        } catch {
            fetchApps() // revert on failure
        }
    }

    const deleteApp = async (id: string) => {
        setApplications(prev => prev.filter(a => a.id !== id))
        try {
            await api.delete(`/api/applications/${id}`)
        } catch {
            fetchApps()
        }
    }

    const updateNotes = (id: string, notes: string) => {
        setApplications(prev => prev.map(a => a.id === id ? { ...a, notes } : a))
    }

    const byStatus = (status: Status) => applications.filter(a => a.status === status)

    const handleDrop = (e: React.DragEvent, targetStatus: Status) => {
        e.preventDefault()
        const appId = e.dataTransfer.getData("applicationId")
        const currentStatus = e.dataTransfer.getData("currentStatus") as Status
        if (appId && currentStatus !== targetStatus) {
            moveStatus(appId, targetStatus)
        }
        setDragOverCol(null)
    }

    const totalActive = applications.filter(a => !["rejected", "withdrawn"].includes(a.status)).length

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Application Tracker</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {applications.length} total · {totalActive} active
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {refreshing && (
                        <span className="flex items-center gap-1.5 text-xs text-gray-500">
                            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                            Syncing…
                        </span>
                    )}
                    <button onClick={() => setShowForm(true)}
                        className="btn-glow px-4 py-2 rounded-xl text-white text-sm font-medium flex items-center gap-2">
                        <Plus size={16} /> Add Application
                    </button>
                </div>
            </div>



            {/* Add Application Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                        className="glass p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white">New Application</h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input type="text" placeholder="Company Name *" className="input-styled"
                                value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} />
                            <input type="text" placeholder="Job Title *" className="input-styled"
                                value={form.job_title} onChange={e => setForm({ ...form, job_title: e.target.value })} />
                            <input type="url" placeholder="Job URL (optional)" className="input-styled"
                                value={form.job_url} onChange={e => setForm({ ...form, job_url: e.target.value })} />
                            <input type="date" className="input-styled" title="Date Applied"
                                value={form.date_applied} onChange={e => setForm({ ...form, date_applied: e.target.value })} />
                            <select className="input-styled" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Status })}>
                                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                            </select>
                            <textarea placeholder="Notes..." className="input-styled resize-none sm:col-span-2" rows={2}
                                value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={addApplication} disabled={saving || !form.company_name || !form.job_title}
                                className="btn-glow px-5 py-2 rounded-xl text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50">
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add Application
                            </button>
                            <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl text-gray-400 text-sm hover:text-white transition-colors">
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kanban Board */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-violet-400" />
                </div>
            ) : applications.length === 0 && !showForm ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                        <Briefcase size={28} className="text-violet-400" />
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-1">No applications yet</h3>
                    <p className="text-gray-500 text-sm mb-5">Start tracking your job applications in one place.</p>
                    <button onClick={() => setShowForm(true)}
                        className="btn-glow px-5 py-2.5 rounded-xl text-white text-sm font-medium flex items-center gap-2">
                        <Plus size={15} /> Add Your First Application
                    </button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 pb-4 mt-2">
                    {COLUMNS.map(col => (
                        <div key={col.id} className="flex flex-col gap-4 min-w-0">
                            {/* Stat block */}
                            <div className={`text-center p-3 rounded-xl ${col.bg} border border-white/10`}>
                                <div className="text-2xl font-bold text-white">{byStatus(col.id).length}</div>
                                <div className="text-xs text-gray-400 mt-0.5 flex items-center justify-center gap-1">
                                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${col.dot}`} />
                                    {col.label}
                                </div>
                            </div>

                            {/* List block */}
                            <div
                                className={`rounded-xl border-t-2 ${col.color} bg-white/[0.02] p-3 transition-all min-h-[150px] ${dragOverCol === col.id ? "ring-2 ring-violet-500/40 bg-violet-500/5" : ""}`}
                                onDragOver={e => { e.preventDefault(); setDragOverCol(col.id) }}
                                onDragLeave={() => setDragOverCol(null)}
                                onDrop={e => handleDrop(e, col.id)}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                                        <h3 className="text-sm font-semibold text-white">{col.label}</h3>
                                    </div>
                                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                                        {byStatus(col.id).length}
                                    </span>
                                </div>
                                <div className="space-y-2 min-h-[80px]">
                                    <AnimatePresence>
                                        {byStatus(col.id).map(app => (
                                            <ApplicationCard
                                                key={app.id}
                                                app={app}
                                                onMove={moveStatus}
                                                onDelete={deleteApp}
                                                onUpdateNotes={updateNotes}
                                            />
                                        ))}
                                    </AnimatePresence>
                                    {byStatus(col.id).length === 0 && (
                                        <div className={`border-2 border-dashed border-white/5 rounded-xl h-16 flex items-center justify-center text-xs text-gray-700 ${dragOverCol === col.id ? "border-violet-500/30 text-violet-500" : ""}`}>
                                            {dragOverCol === col.id ? "Drop here" : "Empty"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
