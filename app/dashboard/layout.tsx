import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default async function DashboardLayout({
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

  const isAdmin = member?.department_id === null
  const userName = member?.full_name ?? user.email ?? 'User'

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex flex-col flex-1 min-w-0">
        <Header userName={userName} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
