import AssistantChat from '@/components/admin/AssistantChat'

export default function AssistantPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ask me to list tasks, assign team members, trigger flows, or show workload summaries.
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <AssistantChat />
      </div>
    </div>
  )
}
