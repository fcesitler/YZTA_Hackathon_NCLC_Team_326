import { createAdminClient } from '@/lib/supabase/server'
import AssignOverride from '@/components/admin/AssignOverride'

export default async function ReassignPage() {
  const supabase = createAdminClient()

  const { data: tasksRaw } = await supabase
    .from('tasks')
    .select('id, mail_subject, status, team_members(full_name)')
    .neq('status', 'completed')
    .order('created_at', { ascending: false })

  const openTasks = (tasksRaw ?? []).map((t) => ({
    id: t.id,
    title: t.mail_subject,
    assignee: (t.team_members as unknown as { full_name: string } | null)?.full_name ?? null,
  }))

  const { data: membersRaw } = await supabase
    .from('team_members')
    .select('id, full_name')
    .not('department_id', 'is', null)
    .order('full_name')

  const members = (membersRaw ?? []) as { id: string; full_name: string }[]

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
