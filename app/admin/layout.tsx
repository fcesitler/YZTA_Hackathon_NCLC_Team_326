import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import AssistantWidget from '@/components/admin/AssistantWidget'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminDb = createAdminClient()
  const { data: member } = await adminDb
    .from('team_members')
    .select('full_name, department_id')
    .eq('auth_user_id', user.id)
    .single()

  // Non-admin users (have a department) cannot access /admin
  if (!member || member.department_id !== null) {
    redirect('/dashboard')
  }

  const userName = member.full_name ?? user.email ?? 'Admin'

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isAdmin={true} />
      <div className="flex flex-col flex-1 min-w-0">
        <Header userName={userName} />
        <main className="flex-1 p-6">{children}</main>
      </div>
      <AssistantWidget />
    </div>
  )
}
