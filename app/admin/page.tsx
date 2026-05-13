import { createAdminClient } from '@/lib/supabase/server'
import AdminTaskList from '@/components/admin/AdminTaskList'
import TeamWorkload from '@/components/admin/TeamWorkload'
import DepartmentChart from '@/components/admin/DepartmentChart'

export default async function AdminPage() {
  const supabase = createAdminClient()

  const { data: tasksRaw } = await supabase
    .from('tasks')
    .select('id, mail_subject, summary, urgency, status, deadline, assignment_reason, departments(name), team_members(full_name)')
    .order('created_at', { ascending: false })

  const tasks = (tasksRaw ?? []) as unknown as Array<{
    id: string
    mail_subject: string
    summary: string | null
    urgency: string
    status: string
    deadline: string | null
    assignment_reason: string | null
    departments: { name: string } | null
    team_members: { full_name: string } | null
  }>

  const { data: departmentsRaw } = await supabase.from('departments').select('id, name').order('name')
  const departments = (departmentsRaw ?? []) as { id: string; name: string }[]

  const { data: membersRaw } = await supabase
    .from('team_members').select('id, full_name').not('department_id', 'is', null).order('full_name')
  const members = (membersRaw ?? []) as { id: string; full_name: string }[]

  const workload = members.map((m) => ({
    full_name: m.full_name,
    open_tasks: tasks.filter((t) => t.team_members?.full_name === m.full_name && t.status !== 'completed').length,
  }))

  const deptChart = departments.map((d) => ({
    department: d.name,
    count: tasks.filter((t) => t.departments?.name === d.name).length,
  }))

  const totalTasks = tasks.length
  const completed = tasks.filter((t) => t.status === 'completed').length
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length
  const pending = tasks.filter((t) => t.status === 'pending' || t.status === 'assigned').length

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor tasks, team workload and department distribution.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Total Tasks</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalTasks}</p>
        </div>
        <div className="bg-violet-600 rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-violet-200 font-semibold uppercase tracking-wide">In Progress</p>
          <p className="text-3xl font-bold text-white mt-1">{inProgress}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Pending</p>
          <p className="text-3xl font-bold text-amber-500 mt-1">{pending}</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-5 shadow-sm border border-emerald-100">
          <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Completed</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{completed}</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-5">Team Workload</h2>
          <TeamWorkload data={workload} />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-5">Tasks by Department</h2>
          <DepartmentChart data={deptChart} />
        </div>
      </div>

      {/* Task list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-5">All Tasks</h2>
        <AdminTaskList tasks={tasks} departments={departments} />
      </div>

    </div>
  )
}
