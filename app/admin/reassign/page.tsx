import { createAdminClient } from '@/lib/supabase/server'
import AssignOverride from '@/components/admin/AssignOverride'

export default async function ReassignPage() {
  const supabase = createAdminClient()

  const { data: tasksRaw } = await supabase
    .from('tasks')
    .select('id, mail_subject, status, urgency, team_members(full_name), departments(name)')
    .neq('status', 'completed')
    .order('created_at', { ascending: false })

  const openTasks = (tasksRaw ?? []).map((t) => ({
    id: t.id,
    title: t.mail_subject,
    status: t.status,
    urgency: t.urgency,
    assignee: (t.team_members as unknown as { full_name: string } | null)?.full_name ?? null,
    department: (t.departments as unknown as { name: string } | null)?.name ?? null,
  }))

  const { data: membersRaw } = await supabase
    .from('team_members')
    .select('id, full_name, department_id, departments(name)')
    .not('department_id', 'is', null)
    .order('full_name')

  const { data: memberTasksRaw } = await supabase
    .from('tasks')
    .select('id, mail_subject, status, assigned_to')
    .neq('status', 'completed')

  const memberTasks = (memberTasksRaw ?? []) as {
    id: string; mail_subject: string; status: string; assigned_to: string | null
  }[]

  const members = (membersRaw ?? []).map((m) => {
    const raw = m as unknown as {
      id: string; full_name: string; department_id: string | null
      departments: { name: string } | null
    }
    return {
      id: raw.id,
      full_name: raw.full_name,
      department_id: raw.department_id,
      department_name: raw.departments?.name ?? null,
      tasks: memberTasks
        .filter((t) => t.assigned_to === raw.id)
        .map(({ id, mail_subject, status }) => ({ id, mail_subject, status })),
    }
  })

  return (
    <div className="flex flex-col gap-8 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manual Reassignment</h1>
        <p className="text-sm text-gray-500 mt-1">Reassign any open task to a different team member.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <AssignOverride tasks={openTasks} members={members} />
      </div>
    </div>
  )
}
