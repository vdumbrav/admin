import { z } from 'zod'
import type { Task } from '@/types/tasks'
import type {
  AdminWaitlistTasksResponseDto,
  AdminWaitlistTasksResponseDtoTypeItem,
  AdminWaitlistTasksResponseDtoProvider,
  AdminWaitlistTasksResponseDtoGroup,
  AdminWaitlistTasksResponseDtoStatus,
  AdminWaitlistTasksResponseDtoResources,
  AdminWaitlistTasksResponseDtoIterator,
} from '@/lib/api/generated'

// Extended type with additional UI fields
export type Quest = AdminWaitlistTasksResponseDto & {
  visible?: boolean // UI-only field for visibility toggle
}

// Schema for validation (compatible with AdminWaitlistTasksResponseDto)
export const questSchema = z.object({
  id: z.number(),
  title: z.string(),
  type: z.array(z.string()),
  iterable: z.boolean(),
  description: z.string(),
  child: z.array(z.any()),
  provider: z.string().optional(),
  uri: z.string().optional(),
  blocking_task: z.number(),
  reward: z.number(),
  level: z.number(),
  group: z.string(),
  order_by: z.number(),
  status: z.string().optional(),
  error: z.string().optional(),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
  resources: z.any().optional(),
  iterator: z.any().optional(),
  next_tick: z.string().optional(),
  visible: z.boolean().optional(),
})

// Adapter function to convert API response to UI format
export function adaptAdminTaskToQuest(
  task: AdminWaitlistTasksResponseDto
): Quest {
  return {
    ...task,
    visible: true, // Default to visible for admin view
  }
}

// Adapter function to convert Quest to Task for form compatibility
export function adaptQuestToTask(quest: Quest): Task {
  return {
    id: quest.id,
    type: Array.isArray(quest.type)
      ? (quest.type[0] as Task['type'])
      : 'external',
    title: quest.title,
    description: quest.description ?? null,
    blocking_task: quest.blocking_task ?? null,
    reward: quest.reward ?? undefined,
    level: quest.level ?? undefined,
    group: quest.group as Task['group'],
    order_by: quest.order_by,
    provider: quest.provider as Task['provider'],
    uri: quest.uri ?? null,
    status: quest.status as Task['status'],
    error: quest.error ?? null,
    started_at: quest.started_at ?? null,
    completed_at: quest.completed_at ?? null,
    next_tick: quest.next_tick ?? null,
    resources: quest.resources as Task['resources'],
    child: quest.child ? quest.child.map(adaptQuestToTask) : null,
    iterable: quest.iterable ?? null,
    iterator: quest.iterator as Task['iterator'],
    visible: quest.visible,
  }
}

// Adapter function to convert Task to Quest for API compatibility
export function adaptTaskToQuest(task: Partial<Task>): Partial<Quest> {
  // Filter out task types that don't exist in AdminWaitlistTasksResponseDtoTypeItem
  const validTypes = [
    'referral',
    'connect',
    'join',
    'share',
    'like',
    'comment',
    'multiple',
    'repeatable',
    'dummy',
    'external',
  ]
  const questType =
    task.type && validTypes.includes(task.type) ? task.type : 'external'

  return {
    id: task.id,
    type: questType
      ? [questType as AdminWaitlistTasksResponseDtoTypeItem]
      : undefined,
    iterable: task.iterable ?? false,
    title: task.title ?? '',
    description: task.description ?? '',
    child: [], // Simplified for now to avoid deep mapping issues
    provider: task.provider as AdminWaitlistTasksResponseDtoProvider,
    uri: task.uri ?? undefined,
    blocking_task: task.blocking_task ?? 0,
    reward: task.reward ?? 0,
    level: task.level ?? 0,
    group: task.group as AdminWaitlistTasksResponseDtoGroup,
    order_by: task.order_by ?? 0,
    status: task.status as AdminWaitlistTasksResponseDtoStatus,
    error: task.error ?? undefined,
    started_at: task.started_at ?? undefined,
    completed_at: task.completed_at ?? undefined,
    resources: task.resources as AdminWaitlistTasksResponseDtoResources,
    iterator: task.iterator as unknown as AdminWaitlistTasksResponseDtoIterator,
    next_tick: task.next_tick ?? undefined,
    visible: task.visible,
  }
}
