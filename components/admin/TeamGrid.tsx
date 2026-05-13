'use client'

import { useState } from 'react'
import MemberTasksModal from './MemberTasksModal'

interface Task {
  id: string
  mail_subject: string
  urgency: string
  status: string
  deadline: string | null
}

export interface MemberWithTasks {
  id: string
  full_name: string
  email: string
  department_id: string | null
  skills: string[]
  is_active: boolean
  tasks: Task[]
}

export default function TeamGrid({
  members,
  maxTasks,
}: {
  members: MemberWithTasks[]
  maxTasks: number
}) {
  const [selected, setSelected] = useState<MemberWithTasks | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m) => {
          const initials = m.full_name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
          const taskCount = m.tasks.length
          const activeTasks = m.tasks.filter((t) => t.status !== 'completed').length
          const workloadPct = Math.min((activeTasks / maxTasks) * 100, 100)
          const barColor = workloadPct > 70 ? 'bg-red-400' : workloadPct > 40 ? 'bg-amber-400' : 'bg-violet-400'

          return (
            <button
              key={m.id}
              onClick={() => setSelected(m)}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-violet-200 transition-all flex flex-col gap-4 text-left w-full"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-700 text-sm font-bold flex items-center justify-center shrink-0 select-none">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate hover:text-violet-700 transition-colors">{m.full_name}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{m.email}</p>
                </div>
                <span className={`ml-auto shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${m.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                  {m.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {m.skills && m.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {m.skills.map((skill) => (
                    <span key={skill} className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Active Tasks</span>
                  <span className="font-semibold text-gray-600">{activeTasks} tasks</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${workloadPct}%` }} />
                </div>
              </div>

              {taskCount > 0 && (
                <p className="text-xs text-violet-500 font-medium -mt-1">View {taskCount} task{taskCount !== 1 ? 's' : ''} →</p>
              )}
            </button>
          )
        })}
      </div>

      {selected && (
        <MemberTasksModal member={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
