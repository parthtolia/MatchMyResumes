"use client"
import React from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface Props {
    children: React.ReactNode
    fallback?: React.ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught:", error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback

            return (
                <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-8">
                    <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/20 flex items-center justify-center">
                        <AlertTriangle size={24} className="text-red-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">Something went wrong</h2>
                    <p className="text-sm text-gray-400 text-center max-w-md">
                        An unexpected error occurred. Please try refreshing the page.
                    </p>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false, error: undefined })
                            window.location.reload()
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 hover:bg-violet-600/30 text-sm font-medium transition-all"
                    >
                        <RefreshCw size={14} />
                        Reload Page
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}
