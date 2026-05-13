'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const ENDPOINT = process.env.NEXT_PUBLIC_CLAUDE_MCP_ENDPOINT!

const SUGGESTIONS = [
  "List tasks with today's deadline",
  'Show team workload summary',
  'Trigger the mail analysis flow',
]

export default function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const visibleMessages = messages.slice(-10)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isPending])

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isPending) return
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
    setInput('')
    setError(null)

    startTransition(async () => {
      try {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed }),
        })

        let reply: string
        if (!res.ok) {
          reply = `Error ${res.status}: ${res.statusText}`
        } else {
          const ct = res.headers.get('content-type') ?? ''
          if (ct.includes('application/json')) {
            const json = await res.json()
            reply = json.reply ?? json.response ?? json.message ?? json.text ?? JSON.stringify(json, null, 2)
          } else {
            reply = await res.text()
          }
        }
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
      } catch {
        setError('Failed to reach the assistant. Check your MCP endpoint configuration.')
      }
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {visibleMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-5 py-10">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 text-center">Ask me anything about your tasks or team.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} disabled={isPending}
                  className="rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm text-gray-600 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 transition-colors disabled:opacity-40">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {visibleMessages.map((msg, i) => (
          <div key={i} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              {msg.role === 'user' ? 'You' : 'Assistant'}
            </span>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-violet-600 text-white'
                : 'bg-gray-50 text-gray-800 border border-gray-100'
            }`}>
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {isPending && (
          <div className="flex flex-col gap-1 items-start">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Assistant</span>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 flex gap-1 items-center">
              {[0, 1, 2].map((n) => (
                <span key={n} className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${n * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-sm text-center py-2">{error}</p>}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions row (after first message) */}
      {visibleMessages.length > 0 && (
        <div className="px-6 pt-3 pb-1 flex flex-wrap gap-2 border-t border-gray-50">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => send(s)} disabled={isPending}
              className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-500 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 transition-colors disabled:opacity-40">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 flex gap-3 items-end border-t border-gray-100">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          disabled={isPending}
          className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100 disabled:opacity-40 max-h-36 overflow-y-auto transition-all"
          onInput={(e) => {
            const el = e.currentTarget
            el.style.height = 'auto'
            el.style.height = `${Math.min(el.scrollHeight, 144)}px`
          }}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || isPending}
          className="shrink-0 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          Send
        </button>
      </div>
    </div>
  )
}
