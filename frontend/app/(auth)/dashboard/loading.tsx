export default function DashboardLoading() {
  return (
    <div className="w-full max-w-[1400px] flex flex-col gap-10 pb-4 min-h-[80vh] animate-pulse">
      <div className="h-8 w-48 bg-white/5 rounded-lg" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="stat-card p-6 border border-white/15" style={{ minHeight: 130 }}>
            <div className="w-6 h-6 bg-white/5 rounded mb-3" />
            <div className="h-10 w-16 bg-white/5 rounded mb-1" />
            <div className="h-4 w-24 bg-white/5 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 rounded-xl border border-white/15 bg-[#111118]" style={{ minHeight: 150 }}>
            <div className="w-9 h-9 bg-white/5 rounded-xl mb-3" />
            <div className="h-4 w-20 bg-white/5 rounded mb-2" />
            <div className="h-3 w-full bg-white/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
