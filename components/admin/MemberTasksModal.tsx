'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface Task {
  id: string
  mail_subject: string
  urgency: string
  status: string
  deadline: string | null
}

interface Member {
  id: string
  full_name: string
  email: string
  is_active: boolean
  skills: string[]
  tasks: Task[]
}

const urgencyConfig: Record<string, { label: string; cls: string }> = {
  low: { label: 'Low', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  medium: { label: 'Medium', cls: 'bg-amber-50 text-amber-700 ring-amber-200' },
  high: { label: 'High', cls: 'bg-orange-50 text-orange-700 ring-orange-200' },
  critical: { label: 'Critical', cls: 'bg-red-50 text-red-700 ring-red-200' },
}

const statusConfig: Record<string, { label: string; cls: string }> = {
  assigned: { label: 'Assigned', cls: 'bg-blue-50 text-blue-700' },
  pending: { label: 'Pending', cls: 'bg-gray-100 text-gray-600' },
  in_progress: { label: 'In Progress', cls: 'bg-violet-100 text-violet-700' },
  completed: { label: 'Completed', cls: 'bg-emerald-100 text-emerald-700' },
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'No deadline'
  const d = new Date(deadline)
  const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (diff < 0) return `${formatted} · overdue`
  if (diff === 0) return `${formatted} · today`
  if (diff === 1) return `${formatted} · tomorrow`
  return `${formatted} · ${diff}d left`
}

export default function MemberTasksModal({ member, onClose }: { member: Member; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const initials = member.full_name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
  const active = member.tasks.filter((t) => t.status !== 'completed')
  const completed = member.tasks.filter((t) => t.status === 'completed')

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-700 text-sm font-bold flex items-center justify-center select-none shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">{member.full_name}</p>
            <p className="text-xs text-gray-400">{member.email}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-gray-400">{member.tasks.length} task{member.tasks.length !== 1 ? 's' : ''}</span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-4">
          {member.tasks.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No tasks assigned.</p>
          ) : (
            <>
              {active.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Active ({active.length})</p>
                  {active.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </div>
              )}
              {completed.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Completed ({completed.length})</p>
                  {completed.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

function TaskRow({ task }: { task: Task }) {
  const urgency = urgencyConfig[task.urgency] ?? urgencyConfig.low
  const status = statusConfig[task.status] ?? statusConfig.assigned
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 font-medium leading-snug">{task.mail_subject}</p>
        <p className="text-xs text-gray-400 mt-0.5">{formatDeadline(task.deadline)}</p>
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${urgency.cls}`}>
          {urgency.label}
        </span>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${status.cls}`}>
          {status.label}
        </span>
      </div>
    </div>
  )
}
