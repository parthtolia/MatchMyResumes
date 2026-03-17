"use client"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, Loader2, AlertCircle } from "lucide-react"

interface PublicToolFormProps {
  onSubmit: (formData: FormData) => Promise<void>
  loading: boolean
  error: string
  submitLabel: string
  needsJd?: boolean
  children?: React.ReactNode
}

export default function PublicToolForm({
  onSubmit,
  loading,
  error,
  submitLabel,
  needsJd = true,
  children,
}: PublicToolFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [jdText, setJdText] = useState("")

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    const fd = new FormData()
    fd.append("file", file)
    if (needsJd) fd.append("jd_text", jdText)
    await onSubmit(fd)
  }

  const canSubmit = file && (!needsJd || jdText.trim().length >= 50) && !loading

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Upload Your Resume (PDF or DOCX)
        </label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-violet-400 bg-violet-500/10"
              : file
              ? "border-emerald-500/40 bg-emerald-500/5"
              : "border-white/10 hover:border-violet-400/40 hover:bg-white/[0.02]"
          }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText size={24} className="text-emerald-400" />
              <div className="text-left">
                <p className="text-white font-medium">{file.name}</p>
                <p className="text-gray-500 text-xs">
                  {(file.size / 1024).toFixed(0)} KB &middot; Click or drop to replace
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload size={32} className="mx-auto text-gray-500" />
              <p className="text-gray-400">
                {isDragActive ? "Drop your resume here" : "Drag & drop your resume, or click to browse"}
              </p>
              <p className="text-gray-600 text-xs">PDF or DOCX, up to 5 MB</p>
            </div>
          )}
        </div>
      </div>

      {/* JD textarea */}
      {needsJd && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Paste Job Description
          </label>
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the full job description here (minimum 50 characters)..."
            rows={8}
            className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-gray-600 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 resize-y"
          />
          <p className="text-gray-600 text-xs mt-1">
            {jdText.length < 50
              ? `${50 - jdText.length} more characters needed`
              : `${jdText.length.toLocaleString()} characters`}
          </p>
        </div>
      )}

      {/* Extra fields slot (e.g. cover letter options) */}
      {children}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="btn-glow w-full flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold text-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-opacity"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Analyzing...
          </>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  )
}
