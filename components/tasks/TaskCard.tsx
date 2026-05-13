import TaskStatusButton from './TaskStatusButton'

export interface Task {
  id: string
  mail_subject: string
  summary: string | null
  urgency: string
  status: string
  deadline: string | null
  assignment_reason: string | null
  departments: { name: string } | null
}

const urgencyConfig: Record<string, { label: string; cls: string }> = {
  low: { label: 'Low', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  medium: { label: 'Medium', cls: 'bg-amber-50 text-amber-700 ring-amber-200' },
  high: { label: 'High', cls: 'bg-orange-50 text-orange-700 ring-orange-200' },
  critical: { label: 'Critical', cls: 'bg-red-50 text-red-700 ring-red-200' },
}

function formatDeadline(deadline: string | null): string | null {
  if (!deadline) return null
  const d = new Date(deadline)
  const now = new Date()
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (diff < 0) return `${formatted} · overdue`
  if (diff === 0) return `${formatted} · today`
  if (diff === 1) return `${formatted} · tomorrow`
  return `${formatted} · ${diff}d left`
}

export default function TaskCard({ task }: { task: Task }) {
  const isCompleted = task.status === 'completed'
  const urgency = urgencyConfig[task.urgency] ?? urgencyConfig.low

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4 shadow-sm transition-all hover:shadow-md ${isCompleted ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2 items-center">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${urgency.cls}`}>
            {urgency.label}
          </span>
          {task.departments?.name && (
            <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-0.5 rounded-full">
              {task.departments.name}
            </span>
          )}
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Done
            </span>
          )}
        </div>
        {formatDeadline(task.deadline) && (
          <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">
            {formatDeadline(task.deadline)}
          </span>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 leading-snug">{task.mail_subject}</h3>
        {task.summary && (
          <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{task.summary}</p>
        )}
      </div>

      {task.assignment_reason && (
        <p className="text-xs text-gray-400 italic border-l-2 border-gray-100 pl-3">{task.assignment_reason}</p>
      )}

      <div className="pt-1 border-t border-gray-50">
        <TaskStatusButton taskId={task.id} currentStatus={task.status} />
      </div>
    </div>
  )
}
