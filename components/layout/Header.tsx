'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
interface HeaderProps {
  userName: string
  showAssistant?: boolean
}

export default function Header({ userName, showAssistant }: HeaderProps) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = userName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="h-14 border-b border-gray-100 bg-white px-6 flex items-center justify-end gap-3 shrink-0">
      <span className="text-sm text-gray-500">{userName}</span>
      <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center select-none">
        {initials}
      </div>
      <button
        onClick={handleSignOut}
        className="text-xs text-gray-400 hover:text-gray-700 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
      >
        Sign out
      </button>
    </header>
  )
}
