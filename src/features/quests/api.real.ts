import { useMutation } from '@tanstack/react-query'
import type { Task, TaskGroup, IteratorDaily } from '@/types/tasks'
import { toast } from 'sonner'
import {
  useAdminControllerGetWaitlistTasks,
  type AdminWaitlistTasksResponseDto,
} from '@/lib/api/generated'

interface QuestsResponse {
  items: Task[]
  total: number
}

const transformAdminTask = (task: AdminWaitlistTasksResponseDto): Task => ({
  id: task.id,
  title: task.title,
  description: task.description,
  type: task.type?.[0] || 'external',
  provider: task.provider,
  group: task.group,
  reward: task.reward,
  order_by: task.order_by,
  status: task.status,
  visible: true, // Assume all fetched tasks are visible
  level: task.level,
  uri: task.uri,
  error: task.error,
  started_at: task.started_at,
  completed_at: task.completed_at,
  next_tick: task.next_tick,
  blocking_task: task.blocking_task,
  child: task.child?.map(transformAdminTask) || [],
  iterable: task.iterable,
  resources: task.resources,
  iterator: task.iterator as unknown as IteratorDaily | null,
})

export const useQuests = (query: {
  search?: string
  group?: TaskGroup | 'all'
  type?: string
  provider?: string
  visible?: string
  page?: number
  limit?: number
  sort?: string
}) => {
  // Use the generated API hook for admin access to waitlist tasks
  const {
    data: adminTasks,
    isLoading,
    isFetching,
    error,
  } = useAdminControllerGetWaitlistTasks()

  // Transform admin tasks to match expected Quest format
  const transformedData: QuestsResponse | undefined = adminTasks
    ? {
        items: adminTasks.map(transformAdminTask),
        total: adminTasks.length,
      }
    : undefined

  // Apply client-side filtering since API doesn't support all filter options
  const filteredData = transformedData
    ? {
        ...transformedData,
        items: transformedData.items.filter((item) => {
          const matchesSearch =
            !query.search ||
            item.title.toLowerCase().includes(query.search.toLowerCase()) ||
            item.description?.toLowerCase().includes(query.search.toLowerCase())

          const matchesGroup =
            !query.group || query.group === 'all' || item.group === query.group
          const matchesType = !query.type || item.type === query.type
          const matchesProvider =
            !query.provider || item.provider === query.provider

          return matchesSearch && matchesGroup && matchesType && matchesProvider
        }),
      }
    : undefined

  // Apply client-side pagination
  const paginatedData =
    filteredData && query.page && query.limit
      ? {
          ...filteredData,
          items: filteredData.items.slice(
            (query.page - 1) * query.limit,
            query.page * query.limit
          ),
          total: filteredData.items.length,
        }
      : filteredData

  return {
    data: paginatedData,
    isLoading,
    isFetching,
    error,
    refetch: () => {}, // Read-only, no refetch needed
  }
}

export const useQuest = (id: number) => {
  // Get task from admin tasks list instead of separate endpoint
  const {
    data: adminTasks,
    isLoading,
    error,
  } = useAdminControllerGetWaitlistTasks()

  // Find specific task by ID
  const task = adminTasks?.find((task) => task.id === id)

  // Transform single task to match expected Quest format using the same transformation
  const transformedTask = task ? transformAdminTask(task) : undefined

  return {
    data: transformedTask,
    isLoading,
    error,
    isFetching: false,
    isSuccess: !!transformedTask,
  }
}

// Admin readonly mode - mutation operations are disabled for admin tasks view
export const useCreateQuest = () => {
  return useMutation({
    mutationFn: (_data: Partial<Task>) => {
      throw new Error(
        'Create operation not available for admin tasks (readonly mode)'
      )
    },
    onError: () =>
      toast.error('Create operation not available for admin tasks'),
  })
}

export const useUpdateQuest = (_id: number) => {
  return useMutation({
    mutationFn: (_data: Partial<Task>) => {
      throw new Error(
        'Update operation not available for admin tasks (readonly mode)'
      )
    },
    onError: () =>
      toast.error('Update operation not available for admin tasks'),
  })
}

export const useDeleteQuest = () => {
  return useMutation({
    mutationFn: (_id: number) => {
      throw new Error(
        'Delete operation not available for admin tasks (readonly mode)'
      )
    },
    onError: () =>
      toast.error('Delete operation not available for admin tasks'),
  })
}

export const useToggleVisibility = () => {
  return useMutation({
    mutationFn: (_data: { id: number; visible: boolean }) => {
      throw new Error(
        'Toggle visibility not available for admin tasks (readonly mode)'
      )
    },
    onError: () =>
      toast.error('Toggle visibility not available for admin tasks'),
  })
}

export const uploadMedia = (_file: File, _token: string | undefined) => {
  throw new Error('Upload media not available for admin tasks (readonly mode)')
}
