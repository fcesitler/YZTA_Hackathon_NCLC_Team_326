'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  isAdmin: boolean
}

const LayoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
)
const TaskIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
)
const TeamIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const ReassignIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
)

export default function Sidebar({ isAdmin }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href

  const linkClass = (href: string) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive(href)
        ? 'bg-violet-600 text-white shadow-sm shadow-violet-200'
        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
    }`

  return (
    <aside className="w-60 shrink-0 border-r border-gray-100 bg-white min-h-screen px-4 py-6 flex flex-col gap-8">
      {/* Logo */}
      <div className="px-2 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <span className="font-semibold text-gray-900 text-sm">TaskFlow AI</span>
      </div>

      <nav className="flex flex-col gap-1">
        {!isAdmin && (
          <>
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
              Employee
            </p>
            <Link href="/dashboard" className={linkClass('/dashboard')}>
              <TaskIcon />
              My Tasks
            </Link>
          </>
        )}

        {isAdmin && (
          <>
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
              Admin
            </p>
            <Link href="/admin" className={linkClass('/admin')}>
              <LayoutIcon />
              Overview
            </Link>
            <Link href="/admin/team" className={linkClass('/admin/team')}>
              <TeamIcon />
              Team
            </Link>
            <Link href="/admin/reassign" className={linkClass('/admin/reassign')}>
              <ReassignIcon />
              Reassign
            </Link>
          </>
        )}
      </nav>
    </aside>
  )
}
