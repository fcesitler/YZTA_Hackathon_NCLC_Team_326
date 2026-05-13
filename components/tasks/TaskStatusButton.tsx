'use client'

import { useState, useTransition } from 'react'
import { updateTaskStatus } from '@/app/dashboard/actions'

type Status = 'assigned' | 'pending' | 'in_progress' | 'completed'

const nextStatus: Record<Status, Status> = {
  assigned: 'in_progress',
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'completed',
}

const config: Record<Status, { label: string; cls: string }> = {
  assigned: {
    label: 'Start Task',
    cls: 'bg-violet-50 text-violet-700 hover:bg-violet-100 ring-violet-200',
  },
  pending: {
    label: 'Start Task',
    cls: 'bg-violet-50 text-violet-700 hover:bg-violet-100 ring-violet-200',
  },
  in_progress: {
    label: 'Mark Complete',
    cls: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-emerald-200',
  },
  completed: {
    label: 'Completed',
    cls: 'bg-gray-50 text-gray-400 ring-gray-100 cursor-not-allowed',
  },
}

export default function TaskStatusButton({
  taskId,
  currentStatus,
}: {
  taskId: string
  currentStatus: string
}) {
  const [status, setStatus] = useState<Status>((currentStatus as Status) ?? 'assigned')
  const [isPending, startTransition] = useTransition()
  const { label, cls } = config[status] ?? config.assigned

  function handleClick() {
    if (status === 'completed') return
    const target = nextStatus[status]
    startTransition(async () => {
      const { error } = await updateTaskStatus(taskId, target)
      if (!error) setStatus(target)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={status === 'completed' || isPending}
      className={`rounded-full px-3.5 py-1.5 text-xs font-medium ring-1 ring-inset transition-colors disabled:opacity-60 ${cls}`}
    >
      {isPending ? 'Updating…' : label}
    </button>
  )
}
