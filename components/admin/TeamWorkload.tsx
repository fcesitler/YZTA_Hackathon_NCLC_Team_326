interface WorkloadEntry {
  full_name: string
  open_tasks: number
}

export default function TeamWorkload({ data }: { data: WorkloadEntry[] }) {
  const max = Math.max(...data.map((d) => d.open_tasks), 1)

  if (data.length === 0) {
    return <p className="text-gray-400 text-sm">No data.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((entry) => {
        const pct = (entry.open_tasks / max) * 100
        const barColor = pct > 80 ? 'bg-red-400' : pct > 50 ? 'bg-amber-400' : 'bg-violet-400'
        return (
          <div key={entry.full_name} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-50 text-violet-700 text-xs font-bold flex items-center justify-center shrink-0 select-none">
              {entry.full_name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm text-gray-700 font-medium truncate block">{entry.full_name}</span>
              <div className="mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
            <span className="w-6 text-right text-sm font-bold text-gray-700">{entry.open_tasks}</span>
          </div>
        )
      })}
    </div>
  )
}
