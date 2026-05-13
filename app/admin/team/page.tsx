import { createAdminClient } from '@/lib/supabase/server'
import TeamGrid, { type MemberWithTasks } from '@/components/admin/TeamGrid'

export default async function TeamPage() {
  const supabase = createAdminClient()

  const { data: departmentsRaw } = await supabase.from('departments').select('id, name').order('name')
  const { data: membersRaw } = await supabase
    .from('team_members')
    .select('id, full_name, email, department_id, skills, is_active')
    .order('full_name')

  const { data: tasksRaw } = await supabase
    .from('tasks')
    .select('id, mail_subject, urgency, status, deadline, assigned_to')
    .order('created_at', { ascending: false })

  const departments = (departmentsRaw ?? []) as { id: string; name: string }[]
  const rawMembers = (membersRaw ?? []) as {
    id: string; full_name: string; email: string
    department_id: string | null; skills: string[]; is_active: boolean
  }[]
  const tasks = (tasksRaw ?? []) as {
    id: string; mail_subject: string; urgency: string; status: string; deadline: string | null; assigned_to: string | null
  }[]

  const members: MemberWithTasks[] = rawMembers.map((m) => ({
    ...m,
    tasks: tasks
      .filter((t) => t.assigned_to === m.id)
      .map(({ assigned_to: _, ...t }) => t),
  }))

  const maxActiveTasks = Math.max(
    ...members.map((m) => m.tasks.filter((t) => t.status !== 'completed').length),
    1
  )

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team</h1>
        <p className="text-sm text-gray-500 mt-1">
          {members.filter((m) => m.department_id).length} members across {departments.length} departments.
        </p>
      </div>

      {departments.map((dept) => {
        const deptMembers = members.filter((m) => m.department_id === dept.id)
        return (
          <section key={dept.id}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-semibold text-gray-700">{dept.name}</h2>
              <span className="rounded-full bg-gray-100 text-gray-500 text-xs font-medium px-2.5 py-0.5">
                {deptMembers.length}
              </span>
            </div>

            {deptMembers.length === 0 ? (
              <p className="text-gray-400 text-sm">No members.</p>
            ) : (
              <TeamGrid members={deptMembers} maxTasks={maxActiveTasks} />
            )}
          </section>
        )
      })}
    </div>
  )
}
