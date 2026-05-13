'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function Logo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="23" fill="rgba(255,255,255,0.08)" />
      <circle cx="24" cy="24" r="21" fill="rgba(30,10,60,0.55)" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
      <rect x="19" y="12.5" width="14" height="3" rx="1.5" fill="rgba(255,255,255,0.85)" />
      <rect x="19" y="19" width="11" height="3" rx="1.5" fill="rgba(255,255,255,0.65)" />
      <rect x="19" y="25.5" width="12" height="3" rx="1.5" fill="rgba(255,255,255,0.65)" />
      <path d="M12.5 14 L14.8 16.5 L17.5 12.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 20.5 L14.8 23 L17.5 19" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Notification bubble types
const NOTIFICATIONS = [
  { icon: '✉️', title: 'Email received', sub: 'New message from Ahmet Y.', color: 'rgba(139,92,246,0.18)' },
  { icon: '✅', title: 'Task assigned', sub: 'Design review → Can Ö.', color: 'rgba(16,185,129,0.15)' },
  { icon: '🤖', title: 'AI suggestion', sub: 'Auto-assign 3 pending tasks', color: 'rgba(99,102,241,0.18)' },
  { icon: '🔔', title: 'Deadline alert', sub: 'Q4 Report due in 2 hours', color: 'rgba(245,158,11,0.15)' },
  { icon: '👤', title: 'Team update', sub: 'Elif joined Engineering', color: 'rgba(236,72,153,0.15)' },
  { icon: '📋', title: 'Task completed', sub: 'Backend API by Mert K.', color: 'rgba(16,185,129,0.15)' },
  { icon: '⚡', title: 'High priority', sub: 'Client demo prep overdue', color: 'rgba(239,68,68,0.15)' },
  { icon: '🔄', title: 'Reassigned', sub: 'Sprint planning → Ali R.', color: 'rgba(139,92,246,0.18)' },
  { icon: '📊', title: 'Report ready', sub: 'Weekly summary generated', color: 'rgba(99,102,241,0.18)' },
  { icon: '💬', title: 'Comment added', sub: 'Zeynep on UX mockup task', color: 'rgba(245,158,11,0.15)' },
]

// Slot positions — avoid center zone (logo + text lives there, roughly 30%-75% top, 15%-85% left)
// Bubbles appear in top corners and bottom strip only
const SLOTS = [
  { left: '4%',  topMin: 8,  topMax: 28 },   // top-left
  { left: '55%', topMin: 6,  topMax: 24 },   // top-right
  { left: '4%',  topMin: 76, topMax: 88 },   // bottom-left
  { left: '55%', topMin: 76, topMax: 88 },   // bottom-right
]

interface Bubble {
  id: number
  notif: typeof NOTIFICATIONS[0]
  top: number
  left: string
  phase: 'in' | 'hold' | 'out'
}

function NotificationBubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  useEffect(() => {
    let id = 0
    // Track which slot has an active bubble
    const slotActive = [false, false, false]

    function spawnBubble() {
      // Pick a free slot
      const freeSlots = SLOTS.map((_, i) => i).filter(i => !slotActive[i])
      if (freeSlots.length === 0) return

      const slotIdx = freeSlots[Math.floor(Math.random() * freeSlots.length)]
      const slot = SLOTS[slotIdx]
      const notif = NOTIFICATIONS[Math.floor(Math.random() * NOTIFICATIONS.length)]
      const top = slot.topMin + Math.random() * (slot.topMax - slot.topMin)
      const bubbleId = id++

      slotActive[slotIdx] = true

      setBubbles(prev => [...prev, { id: bubbleId, notif, top, left: slot.left, phase: 'in' }])

      // hold after 700ms (in animation)
      setTimeout(() => {
        setBubbles(prev => prev.map(b => b.id === bubbleId ? { ...b, phase: 'hold' } : b))
      }, 700)

      // out after 7s
      setTimeout(() => {
        setBubbles(prev => prev.map(b => b.id === bubbleId ? { ...b, phase: 'out' } : b))
        slotActive[slotIdx] = false
      }, 7000)

      // remove after out animation
      setTimeout(() => {
        setBubbles(prev => prev.filter(b => b.id !== bubbleId))
      }, 7800)
    }

    // Initial spawn staggered
    const timers: ReturnType<typeof setTimeout>[] = []
    timers.push(setTimeout(() => spawnBubble(), 500))
    timers.push(setTimeout(() => spawnBubble(), 2500))
    timers.push(setTimeout(() => spawnBubble(), 4500))

    // Recurring spawns
    const interval = setInterval(() => spawnBubble(), 3500)

    return () => {
      timers.forEach(clearTimeout)
      clearInterval(interval)
    }
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {bubbles.map(b => (
        <div
          key={b.id}
          style={{
            position: 'absolute',
            top: `${b.top}%`,
            left: b.left,
            width: '190px',
            background: 'rgba(255,255,255,0.10)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '14px',
            padding: '10px 13px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            transition: b.phase === 'in'
              ? 'opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)'
              : 'opacity 0.7s ease, transform 0.7s ease',
            opacity: b.phase === 'hold' ? 1 : 0,
            transform: b.phase === 'in'
              ? 'translateY(14px) scale(0.95)'
              : b.phase === 'hold'
              ? 'translateY(0) scale(1)'
              : 'translateY(-10px) scale(0.97)',
          }}
        >
          {/* Top row: icon + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
            <span style={{ fontSize: '14px', lineHeight: 1 }}>{b.notif.icon}</span>
            <span style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.95)',
              letterSpacing: '0.01em',
              whiteSpace: 'nowrap',
            }}>{b.notif.title}</span>
            {/* Live dot */}
            <span style={{
              marginLeft: 'auto',
              width: '6px', height: '6px',
              borderRadius: '50%',
              background: '#34d399',
              boxShadow: '0 0 6px #34d399',
              flexShrink: 0,
            }} />
          </div>
          {/* Subtitle */}
          <div style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.6)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>{b.notif.sub}</div>
          {/* Progress bar */}
          <div style={{
            marginTop: '8px',
            height: '2px',
            borderRadius: '2px',
            background: 'rgba(255,255,255,0.12)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: b.phase === 'hold' ? '0%' : '0%',
              background: 'rgba(167,139,250,0.7)',
              borderRadius: '2px',
              animation: b.phase === 'hold' ? 'drainBar 2.9s linear forwards' : 'none',
            }} />
          </div>
        </div>
      ))}

      <style>{`
        @keyframes drainBar {
          from { width: 100%; }
          to   { width: 0%; }
        }
        @keyframes orbA {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(8%,12%) scale(1.08); }
          66% { transform: translate(-5%,6%) scale(0.94); }
        }
        @keyframes orbB {
          0%,100% { transform: translate(0,0) scale(1); }
          40% { transform: translate(-10%,-8%) scale(1.1); }
          70% { transform: translate(6%,5%) scale(0.92); }
        }
        @keyframes orbC {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-12%,10%) scale(1.15); }
        }
        @keyframes particle {
          0%,100% { opacity: 0.15; transform: translateY(0) scale(1); }
          50% { opacity: 0.8; transform: translateY(-16px) scale(1.3); }
        }
        @keyframes logoPulse {
          0%, 100% { transform: scale(1) rotate(0deg); filter: drop-shadow(0 0 30px rgba(167,139,250,0.6)); }
          25% { transform: scale(1.04) rotate(1deg); filter: drop-shadow(0 0 50px rgba(167,139,250,0.9)); }
          75% { transform: scale(0.97) rotate(-1deg); filter: drop-shadow(0 0 20px rgba(167,139,250,0.4)); }
        }
      `}</style>
    </div>
  )
}

function AnimatedBackground() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* Orbs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%',
        width: '55%', height: '55%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, rgba(139,92,246,0) 70%)',
        animation: 'orbA 9s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', right: '-10%',
        width: '65%', height: '65%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,70,229,0.35) 0%, rgba(79,70,229,0) 70%)',
        animation: 'orbB 12s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', top: '35%', right: '5%',
        width: '40%', height: '40%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167,139,250,0.25) 0%, rgba(167,139,250,0) 70%)',
        animation: 'orbC 7s ease-in-out infinite',
      }} />

      {/* Subtle grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Floating particles */}
      {[
        { top: '8%',  left: '15%', size: 2.5, delay: '0s',   dur: '6s' },
        { top: '22%', left: '78%', size: 2,   delay: '1.5s', dur: '8s' },
        { top: '50%', left: '88%', size: 3,   delay: '0.8s', dur: '7s' },
        { top: '72%', left: '22%', size: 2,   delay: '2s',   dur: '9s' },
        { top: '88%', left: '60%', size: 2.5, delay: '3s',   dur: '6s' },
        { top: '35%', left: '5%',  size: 2,   delay: '1s',   dur: '10s' },
        { top: '60%', left: '92%', size: 3,   delay: '4s',   dur: '7s' },
      ].map((p, i) => (
        <div key={i} style={{
          position: 'absolute', top: p.top, left: p.left,
          width: `${p.size}px`, height: `${p.size}px`, borderRadius: '50%',
          background: 'rgba(216,180,254,0.7)',
          boxShadow: `0 0 ${p.size * 3}px rgba(216,180,254,0.4)`,
          animation: `particle ${p.dur} ease-in-out ${p.delay} infinite`,
        }} />
      ))}

      {/* Notification bubbles layer */}
      <NotificationBubbles />
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div
        className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #3b0764 0%, #5b21b6 50%, #312e81 100%)' }}
      >
        <AnimatedBackground />

        {/* Top logo */}
        <div className="relative z-10 flex items-center gap-3">
          <Logo size={36} />
          <span className="font-semibold text-white text-sm tracking-wide">TaskFlow AI</span>
        </div>

        {/* Center logo + text */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 gap-8 py-12">
          <div style={{
            animation: 'logoPulse 4s ease-in-out infinite',
            filter: 'drop-shadow(0 0 30px rgba(167,139,250,0.6))',
          }}>
            <Logo size={120} />
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white leading-snug">
              Manage your team's tasks<br />with AI-powered delegation.
            </h2>
            <p className="mt-4 text-purple-200 text-sm leading-relaxed max-w-sm">
              Real-time updates, smart assignment, and AI assistant — all in one place.
            </p>
          </div>
        </div>

        {/* Bottom tags */}
        <div className="relative z-10 flex gap-2">
          {['Tasks', 'Team', 'AI'].map((label) => (
            <span
              key={label}
              className="rounded-full text-white text-xs font-medium px-3 py-1 border border-white/20 backdrop-blur-sm"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm flex flex-col gap-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <Logo size={20} />
            </div>
            <span className="font-semibold text-gray-900 text-sm">TaskFlow AI</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@company.com"
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 transition-all"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
