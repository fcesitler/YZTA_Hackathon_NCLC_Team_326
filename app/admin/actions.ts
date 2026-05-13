'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function reassignTask(
  taskId: string,
  newAssigneeId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  // Verify caller is admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const adminDb = createAdminClient()
  const { data: caller } = await adminDb
    .from('team_members')
    .select('department_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!caller || caller.department_id !== null) {
    return { error: 'Forbidden' }
  }

  // Update task
  const { error: updateError } = await adminDb
    .from('tasks')
    .update({ assigned_to: newAssigneeId, updated_at: new Date().toISOString() })
    .eq('id', taskId)

  if (updateError) return { error: updateError.message }

  // Send Telegram notification if bot token is configured
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (token) {
    const { data: assignee } = await adminDb
      .from('team_members')
      .select('full_name, telegram_chat_id')
      .eq('id', newAssigneeId)
      .single()

    const { data: task } = await adminDb
      .from('tasks')
      .select('mail_subject, summary, deadline')
      .eq('id', taskId)
      .single()

    if (assignee?.telegram_chat_id && task) {
      const deadline = task.deadline
        ? new Date(task.deadline).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })
        : 'No deadline'

      const message = [
        `*Task Reassigned to You*`,
        ``,
        `*Task:* ${task.mail_subject}`,
        task.summary ? `*Summary:* ${task.summary}` : null,
        `*Deadline:* ${deadline}`,
      ]
        .filter(Boolean)
        .join('\n')

      await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: assignee.telegram_chat_id,
            text: message,
            parse_mode: 'Markdown',
          }),
        }
      ).catch(() => {
        // Telegram errors are non-fatal
      })
    }
  }

  return { error: null }
}
