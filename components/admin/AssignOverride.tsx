'use client'

import { useState, useTransition } from 'react'
import { reassignTask } from '@/app/admin/actions'

interface Task { id: string; title: string; assignee?: string | null }
interface Member { id: string; full_name: string }

const selectCls = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100 transition-all'

export default function AssignOverride({ tasks, members }: { tasks: Task[]; members: Member[] }) {
  const [selectedTask, setSelectedTask] = useState('')
  const [selectedMember, setSelectedMember] = useState('')
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleReassign() {
    if (!selectedTask || !selectedMember) return
    setMessage(null)
    startTransition(async () => {
      const { error } = await reassignTask(selectedTask, selectedMember)
      if (error) {
        setMessage({ text: error, ok: false })
      } else {
        setMessage({ text: 'Task reassigned successfully.', ok: true })
        setSelectedTask('')
        setSelectedMember('')
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Task</label>
        <select value={selectedTask} onChange={(e) => setSelectedTask(e.target.value)} className={selectCls}>
          <option value="">Select a task…</option>
          {tasks.map((t) => <option key={t.id} value={t.id}>{t.title}{t.assignee ? ` — ${t.assignee}` : ''}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Assign to</label>
        <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} className={selectCls}>
          <option value="">Select a member…</option>
          {members.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
        </select>
      </div>

      <button
        onClick={handleReassign}
        disabled={!selectedTask || !selectedMember || isPending}
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
