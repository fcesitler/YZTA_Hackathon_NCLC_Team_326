'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function getContext(): Promise<string> {
  const supabase = createAdminClient()

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, mail_subject, summary, urgency, status, deadline, departments(name), team_members(full_name)')
    .order('created_at', { ascending: false })

  const { data: members } = await supabase
    .from('team_members')
    .select('id, full_name, departments(name)')
    .not('department_id', 'is', null)
    .order('full_name')

  const taskLines = (tasks ?? []).map((t) => {
    const dept = (t.departments as { name: string } | null)?.name ?? 'N/A'
    const assignee = (t.team_members as { full_name: string } | null)?.full_name ?? 'Unassigned'
    const deadline = t.deadline ? new Date(t.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline'
    return `- [${t.status.toUpperCase()}] "${t.mail_subject}" | Priority: ${t.urgency} | Dept: ${dept} | Assignee: ${assignee} | Deadline: ${deadline}`
  }).join('\n')

  const memberLines = (members ?? []).map((m) => {
    const dept = (m.departments as { name: string } | null)?.name ?? 'N/A'
    const openCount = (tasks ?? []).filter(
      (t) => (t.team_members as { full_name: string } | null)?.full_name === m.full_name && t.status !== 'completed'
    ).length
    return `- ${m.full_name} (${dept}) — ${openCount} open task(s)`
  }).join('\n')

  return `TASKS:\n${taskLines || 'No tasks found.'}\n\nTEAM MEMBERS:\n${memberLines || 'No members found.'}`
}

export async function askAssistant(
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<{ reply: string; error?: string }> {
  try {
    const context = await getContext()

    const system = `You are TaskFlow AI, a concise assistant for a task management dashboard.
You have access to live data from the system (tasks and team members) provided below.
Today's date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.

RESPONSE RULES:
- Be brief and direct. No long introductions.
- Never use markdown tables. Use simple bullet lists instead.
- Each task in a list: one line, format: "• Task title — Assignee (Status)"
- Group by department only if it helps clarity.
- No emojis unless the user uses them first.
- Max 15 items in a list; summarize the rest as "+ N more".

LIVE DATA:
${context}`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system,
      messages,
    })

    const text = response.content.find((b) => b.type === 'text')?.text ?? 'No response.'
    return { reply: text }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return { reply: '', error: msg }
  }
}
