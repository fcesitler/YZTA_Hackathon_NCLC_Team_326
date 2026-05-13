'use client'

import { useState } from 'react'

interface AdminTask {
  id: string
  mail_subject: string
  summary: string | null
  urgency: string
  status: string
  deadline: string | null
  assignment_reason: string | null
  departments: { name: string } | null
  team_members: { full_name: string } | null
}

interface Department {
  id: string
  name: string
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
  if (!deadline) return '—'
  return new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const selectCls = 'rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 shadow-sm'

const PAGE_SIZE = 10

export default function AdminTaskList({ tasks, departments }: { tasks: AdminTask[]; departments: Department[] }) {
  const [filterDept, setFilterDept] = useState('')
  const [filterUrgency, setFilterUrgency] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)

  const filtered = tasks.filter((t) => {
    if (filterDept && t.departments?.name !== filterDept) return false
    if (filterUrgency && t.urgency !== filterUrgency) return false
    if (filterStatus && t.status !== filterStatus) return false
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handleFilterChange(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLSelectElement>) => {
      setter(e.target.value)
      setPage(1)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select value={filterDept} onChange={handleFilterChange(setFilterDept)} className={selectCls}>
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>
        <select value={filterUrgency} onChange={handleFilterChange(setFilterUrgency)} className={selectCls}>
          <option value="">All Urgencies</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select value={filterStatus} onChange={handleFilterChange(setFilterStatus)} className={selectCls}>
          <option value="">All Statuses</option>
          <option value="assigned">Assigned</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        {(filterDept || filterUrgency || filterStatus) && (
          <button
            onClick={() => { setFilterDept(''); setFilterUrgency(''); setFilterStatus(''); setPage(1) }}
            className="text-sm text-violet-600 hover:text-violet-800 font-medium transition-colors"
          >
            Clear filters
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {['Task', 'Assignee', 'Department', 'Urgency', 'Status'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400 text-sm">No tasks found.</td>
              </tr>
            ) : (
              paginated.map((task, i) => (
                <tr key={task.id} className={`border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/20'}`}>
                  <td className="px-4 py-3 max-w-xs">
                    <div className="font-medium text-gray-900 truncate">{task.mail_subject}</div>
                    {task.summary && <div className="text-xs text-gray-400 mt-0.5 truncate">{task.summary}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{task.team_members?.full_name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{task.departments?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${urgencyConfig[task.urgency]?.cls ?? 'bg-gray-100 text-gray-600 ring-gray-200'}`}>
                      {urgencyConfig[task.urgency]?.label ?? task.urgency}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[task.status]?.cls ?? 'bg-gray-100 text-gray-600'}`}>
                      {statusConfig[task.status]?.label ?? task.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
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
