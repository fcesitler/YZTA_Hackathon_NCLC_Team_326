'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateTaskStatus(taskId: string, newStatus: string): Promise<{ error: string | null }> {
  const adminDb = createAdminClient()
  const { error } = await adminDb
    .from('tasks')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', taskId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { error: null }
}
