'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import TaskCard, { type Task } from './TaskCard'

const selectCls = 'rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 shadow-sm'

const PAGE_SIZE = 5

export default function TaskList({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterUrgency, setFilterUrgency] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, async () => {
        const { data } = await supabase
          .from('tasks')
          .select('id, mail_subject, summary, urgency, status, deadline, assignment_reason, departments(name)')
          .order('created_at', { ascending: false })
        if (data) setTasks(data as unknown as Task[])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  let filtered = tasks.filter((t) => {
    if (filterStatus && t.status !== filterStatus) return false
    if (filterUrgency && t.urgency !== filterUrgency) return false
    return true
  })

  const active = filtered.filter((t) => t.status !== 'completed')
  const completed = filtered.filter((t) => t.status === 'completed')
  filtered = [...active, ...completed]

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const hasFilters = filterStatus || filterUrgency

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-700">All caught up!</p>
        <p className="text-xs text-gray-400 mt-1">No tasks assigned to you yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }} className={selectCls}>
          <option value="">All Statuses</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select value={filterUrgency} onChange={(e) => { setFilterUrgency(e.target.value); setPage(1) }} className={selectCls}>
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        {hasFilters && (
          <button
            onClick={() => { setFilterStatus(''); setFilterUrgency(''); setPage(1) }}
            className="text-sm text-violet-600 hover:text-violet-800 font-medium transition-colors"
          >
            Clear filters
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {paginated.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No tasks match the selected filters.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {paginated.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-400">Page {currentPage} of {totalPages}</span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  p === currentPage
                    ? 'border-violet-600 bg-violet-600 text-white'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
