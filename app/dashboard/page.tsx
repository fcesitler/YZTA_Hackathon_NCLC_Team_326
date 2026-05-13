import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import TaskList from '@/components/tasks/TaskList'
import { type Task } from '@/components/tasks/TaskCard'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminDb = createAdminClient()
  const { data: member } = await adminDb
    .from('team_members')
    .select('id, full_name, department_id')
    .eq('auth_user_id', user.id)
    .single()

  // Admin → go to admin panel
  if (!member || member.department_id === null) {
    redirect('/admin')
  }

  const { data: tasksRaw } = await adminDb
    .from('tasks')
    .select('id, mail_subject, summary, urgency, status, deadline, assignment_reason, departments(name)')
    .eq('assigned_to', member.id)
    .order('created_at', { ascending: false })

  const tasks = (tasksRaw ?? []) as unknown as Task[]

  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'completed').length
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length
  const pending = tasks.filter((t) => t.status === 'pending' || t.status === 'assigned').length

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back, {member.full_name?.split(' ')[0]}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Pending</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{pending}</p>
        </div>
        <div className="bg-violet-600 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-violet-200 font-medium uppercase tracking-wide">In Progress</p>
          <p className="text-2xl font-bold text-white mt-1">{inProgress}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Completed</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{done}</p>
        </div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col gap-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Overall progress</span>
            <span>{Math.round((done / total) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${(done / total) * 100}%` }}
            />
          </div>
        </div>
      )}

      <TaskList initialTasks={tasks} />
    </div>
  )
}
