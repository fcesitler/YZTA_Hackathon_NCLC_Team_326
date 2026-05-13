'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { reassignTask } from '@/app/admin/actions'

interface MemberTask {
  id: string
  mail_subject: string
  status: string
}

interface Task {
  id: string
  title: string
  assignee?: string | null
  department?: string | null
  urgency?: string
  status?: string
}

interface Member {
  id: string
  full_name: string
  department_id?: string | null
  department_name?: string | null
  tasks: MemberTask[]
}

const statusLabel: Record<string, string> = {
  assigned: 'Assigned',
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
}

function statusSummary(tasks: MemberTask[]): string {
  const counts = tasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1
    return acc
  }, {})
  return Object.entries(counts)
    .map(([s, n]) => `${statusLabel[s] ?? s} ×${n}`)
    .join(' · ')
}

export default function AssignOverride({ tasks, members }: { tasks: Task[]; members: Member[] }) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [isTaskOpen, setIsTaskOpen] = useState(false)
  const [isMemberOpen, setIsMemberOpen] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const [isPending, startTransition] = useTransition()
  const taskDropdownRef = useRef<HTMLDivElement>(null)
  const memberDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (taskDropdownRef.current && !taskDropdownRef.current.contains(e.target as Node)) {
        setIsTaskOpen(false)
      }
      if (memberDropdownRef.current && !memberDropdownRef.current.contains(e.target as Node)) {
        setIsMemberOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const groupedTasks = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    const dept = task.department ?? 'Other'
    if (!acc[dept]) acc[dept] = []
    acc[dept].push(task)
    return acc
  }, {})

  const groupedMembers = members.reduce<Record<string, Member[]>>((acc, m) => {
    const dept = m.department_name ?? 'Other'
    if (!acc[dept]) acc[dept] = []
    acc[dept].push(m)
    return acc
  }, {})

  const selectedMemberObj = members.find((m) => m.id === selectedMemberId) ?? null

  function handleReassign() {
    if (!selectedTask || !selectedMemberId) return
    setMessage(null)
    startTransition(async () => {
      const { error } = await reassignTask(selectedTask.id, selectedMemberId)
      if (error) {
        setMessage({ text: error, ok: false })
      } else {
        setMessage({ text: 'Task reassigned successfully.', ok: true })
        setSelectedTask(null)
        setSelectedMemberId('')
      }
    })
  }

  const btnCls = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-left transition-all focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100 flex items-center justify-between gap-2'
  const chevron = (open: boolean) => (
    <svg className={`shrink-0 w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
  const dropdownPanel = 'absolute z-50 mt-1 w-full rounded-xl border border-gray-100 bg-white shadow-lg max-h-72 overflow-y-auto'
  const groupHeader = 'sticky top-0 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100'
  const itemBtn = (selected: boolean) =>
    `w-full text-left px-3 py-2.5 border-b border-gray-50 last:border-0 transition-colors hover:bg-violet-50 ${selected ? 'bg-violet-50' : ''}`

  return (
    <div className="flex flex-col gap-4">
      {/* Task picker */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Task</label>
        <div className="relative" ref={taskDropdownRef}>
          <button type="button" onClick={() => setIsTaskOpen((o) => !o)} className={btnCls}>
            {selectedTask ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-gray-800">{selectedTask.title}</p>
                {selectedTask.assignee && (
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {selectedTask.assignee} · {statusLabel[selectedTask.status ?? ''] ?? selectedTask.status}
                  </p>
                )}
              </div>
            ) : (
              <span className="text-gray-400">Select a task…</span>
            )}
            {chevron(isTaskOpen)}
          </button>

          {isTaskOpen && (
            <div className={dropdownPanel}>
              {tasks.length === 0 ? (
                <p className="px-3 py-4 text-sm text-gray-400 text-center">No open tasks.</p>
              ) : (
                Object.entries(groupedTasks).map(([dept, deptTasks]) => (
                  <div key={dept}>
                    <p className={groupHeader}>{dept}</p>
                    {deptTasks.map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => { setSelectedTask(task); setIsTaskOpen(false) }}
                        className={itemBtn(selectedTask?.id === task.id)}
                      >
                        <p className="text-sm text-gray-800 truncate">{task.title}</p>
                        {task.assignee && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {task.assignee} · {statusLabel[task.status ?? ''] ?? task.status}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Member picker */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Assign to</label>
        <div className="relative" ref={memberDropdownRef}>
          <button type="button" onClick={() => setIsMemberOpen((o) => !o)} className={btnCls}>
            {selectedMemberObj ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-gray-800">{selectedMemberObj.full_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedMemberObj.tasks.length === 0
                    ? 'No active tasks'
                    : `${selectedMemberObj.tasks.length} task${selectedMemberObj.tasks.length !== 1 ? 's' : ''} · ${statusSummary(selectedMemberObj.tasks)}`}
                </p>
              </div>
            ) : (
              <span className="text-gray-400">Select a member…</span>
            )}
            {chevron(isMemberOpen)}
          </button>

          {isMemberOpen && (
            <div className={dropdownPanel}>
              {members.length === 0 ? (
                <p className="px-3 py-4 text-sm text-gray-400 text-center">No members.</p>
              ) : (
                Object.entries(groupedMembers).map(([dept, deptMembers]) => (
                  <div key={dept}>
                    <p className={groupHeader}>{dept}</p>
                    {deptMembers.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => { setSelectedMemberId(member.id); setIsMemberOpen(false) }}
                        className={itemBtn(selectedMemberId === member.id)}
                      >
                        <p className="text-sm text-gray-800">{member.full_name}</p>
                        {member.tasks.length > 0 ? (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {member.tasks.length} task{member.tasks.length !== 1 ? 's' : ''} · {statusSummary(member.tasks)}
                          </p>
                        ) : (
                          <p className="text-xs text-emerald-500 mt-0.5">No active tasks</p>
                        )}
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleReassign}
        disabled={!selectedTask || !selectedMemberId || isPending}
        className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
      >
        {isPending ? 'Reassigning…' : 'Reassign Task'}
      </button>

      {message && (
        <div className={`rounded-xl px-3 py-2.5 text-sm font-medium ${message.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}
    </div>
  )
}
