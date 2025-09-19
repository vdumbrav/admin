import type {
  AdminWaitlistTasksResponseDto,
  AdminWaitlistTasksResponseDtoTypeItem,
  AdminWaitlistTasksResponseDtoProvider,
  AdminWaitlistTasksResponseDtoGroup,
  AdminWaitlistTasksResponseDtoStatus,
  AdminWaitlistTasksResponseDtoResources,
  AdminWaitlistTasksResponseDtoIterator,
} from '@/lib/api/generated'
import {
  AdminWaitlistTasksResponseDtoTypeItem as ApiTypeItem,
  AdminWaitlistTasksResponseDtoProvider as ApiProvider,
  AdminWaitlistTasksResponseDtoGroup as ApiGroup,
  AdminWaitlistTasksResponseDtoStatus as ApiStatus,
} from '@/lib/api/generated'
import type { Quest, Task, Resources, IteratorDaily } from './types'

// ============================================================================
// Type Guards
// ============================================================================

function isValidApiTaskType(
  type: string
): type is AdminWaitlistTasksResponseDtoTypeItem {
  return Object.values(ApiTypeItem).includes(
    type as AdminWaitlistTasksResponseDtoTypeItem
  )
}

function isValidApiProvider(
  provider: string
): provider is AdminWaitlistTasksResponseDtoProvider {
  return Object.values(ApiProvider).includes(
    provider as AdminWaitlistTasksResponseDtoProvider
  )
}

function isValidApiGroup(
  group: string
): group is AdminWaitlistTasksResponseDtoGroup {
  return Object.values(ApiGroup).includes(
    group as AdminWaitlistTasksResponseDtoGroup
  )
}

function isValidApiStatus(
  status: string
): status is AdminWaitlistTasksResponseDtoStatus {
  return Object.values(ApiStatus).includes(
    status as AdminWaitlistTasksResponseDtoStatus
  )
}

// ============================================================================
// Resource Adapters
// ============================================================================

function adaptResourcesFromApi(
  resources: AdminWaitlistTasksResponseDtoResources | undefined
): Resources | null {
  if (!resources || typeof resources !== 'object') return null

  // TODO: Improve resource mapping when API provides detailed resource schema
  return resources as Resources
}

function adaptResourcesToApi(
  resources: Resources | null
): AdminWaitlistTasksResponseDtoResources | undefined {
  if (!resources) return undefined

  // TODO: Add proper resource validation and transformation
  return resources as AdminWaitlistTasksResponseDtoResources
}

function adaptIteratorFromApi(
  iterator: AdminWaitlistTasksResponseDtoIterator | undefined
): IteratorDaily | null {
  if (!iterator || typeof iterator !== 'object') return null

  // TODO: Improve iterator mapping when API provides detailed iterator schema
  return iterator as unknown as IteratorDaily
}

function adaptIteratorToApi(
  iterator: IteratorDaily | null
): AdminWaitlistTasksResponseDtoIterator | undefined {
  if (!iterator) return undefined

  // TODO: Add proper iterator validation and transformation
  return iterator as unknown as AdminWaitlistTasksResponseDtoIterator
}

// ============================================================================
// Main Adapters: API → UI
// ============================================================================

/**
 * Converts AdminWaitlistTasksResponseDto to Quest (UI format)
 * This is a simple adapter since Quest extends the API type
 */
export function adaptAdminTaskToQuest(
  task: AdminWaitlistTasksResponseDto
): Quest {
  return {
    ...task,
    visible: true, // Default to visible for admin view
  }
}

/**
 * Converts Quest to Task for form compatibility
 * This handles the array→string conversion for type field
 */
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
    resources: adaptResourcesFromApi(quest.resources),
    child: quest.child ? quest.child.map(adaptQuestToTask) : null,
    iterable: quest.iterable ?? null,
    iterator: adaptIteratorFromApi(quest.iterator),
    visible: quest.visible,
  }
}

// ============================================================================
// Main Adapters: UI → API
// ============================================================================

/**
 * Converts Task to Quest for API compatibility
 * This handles the string→array conversion for type field and validates API types
 */
export function adaptTaskToQuest(task: Partial<Task>): Partial<Quest> {
  // Handle type conversion with validation
  let apiType: AdminWaitlistTasksResponseDtoTypeItem[] | undefined

  if (task.type) {
    if (isValidApiTaskType(task.type)) {
      apiType = [task.type]
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        `Invalid task type for API: ${task.type}, using 'external' as fallback`
      )
      apiType = ['external' as AdminWaitlistTasksResponseDtoTypeItem]
    }
  }

  // Handle provider validation
  let apiProvider: AdminWaitlistTasksResponseDtoProvider | undefined
  if (task.provider) {
    if (isValidApiProvider(task.provider)) {
      apiProvider = task.provider
    } else {
      // eslint-disable-next-line no-console
      console.warn(`Invalid provider for API: ${task.provider}`)
      apiProvider = undefined
    }
  }

  // Handle group validation
  let apiGroup: AdminWaitlistTasksResponseDtoGroup | undefined
  if (task.group && task.group !== 'all') {
    if (isValidApiGroup(task.group)) {
      apiGroup = task.group
    } else {
      // eslint-disable-next-line no-console
      console.warn(`Invalid group for API: ${task.group}`)
      // TODO: Add proper group mapping when API supports more groups
      apiGroup = 'social' // Default fallback
    }
  }

  // Handle status validation
  let apiStatus: AdminWaitlistTasksResponseDtoStatus | undefined
  if (task.status) {
    if (isValidApiStatus(task.status)) {
      apiStatus = task.status
    } else {
      // eslint-disable-next-line no-console
      console.warn(`Invalid status for API: ${task.status}`)
      apiStatus = undefined
    }
  }

  // Handle child tasks recursively
  const apiChild: AdminWaitlistTasksResponseDto[] = []
  if (task.child && task.child.length > 0) {
    for (const childTask of task.child) {
      const adaptedChild = adaptTaskToQuest(
        childTask
      ) as AdminWaitlistTasksResponseDto
      if (adaptedChild.id !== undefined) {
        apiChild.push(adaptedChild)
      }
    }
  }

  return {
    id: task.id,
    type: apiType,
    iterable: task.iterable ?? false,
    title: task.title ?? '',
    description: task.description ?? '',
    child: apiChild,
    provider: apiProvider,
    uri: task.uri ?? undefined,
    blocking_task: task.blocking_task ?? 0,
    reward: task.reward ?? 0,
    level: task.level ?? 0,
    group: apiGroup ?? 'social',
    order_by: task.order_by ?? 0,
    status: apiStatus,
    error: task.error ?? undefined,
    started_at: task.started_at ?? undefined,
    completed_at: task.completed_at ?? undefined,
    resources: adaptResourcesToApi(task.resources ?? null),
    iterator: adaptIteratorToApi(task.iterator ?? null),
    next_tick: task.next_tick ?? undefined,
    visible: task.visible,
  }
}

// ============================================================================
// Batch Adapters
// ============================================================================

/**
 * Converts array of AdminWaitlistTasksResponseDto to Quest array
 */
export function adaptAdminTasksToQuests(
  tasks: AdminWaitlistTasksResponseDto[]
): Quest[] {
  return tasks.map(adaptAdminTaskToQuest)
}

/**
 * Converts array of Quest to Task array
 */
export function adaptQuestsToTasks(quests: Quest[]): Task[] {
  return quests.map(adaptQuestToTask)
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validates if a task can be safely converted to API format
 */
export function validateTaskForApi(task: Partial<Task>): string[] {
  const errors: string[] = []

  if (!task.title?.trim()) {
    errors.push('Title is required')
  }

  if (!task.type) {
    errors.push('Type is required')
  }

  if (!task.group) {
    errors.push('Group is required')
  }

  if (task.reward !== undefined && task.reward < 0) {
    errors.push('Reward must be non-negative')
  }

  if (task.order_by !== undefined && task.order_by < 0) {
    errors.push('Order must be non-negative')
  }

  return errors
}

/**
 * Gets available API types that can be used in forms
 */
export function getAvailableApiTypes(): AdminWaitlistTasksResponseDtoTypeItem[] {
  return Object.values(ApiTypeItem)
}

/**
 * Gets available API providers that can be used in forms
 */
export function getAvailableApiProviders(): AdminWaitlistTasksResponseDtoProvider[] {
  return Object.values(ApiProvider)
}

/**
 * Gets available API groups that can be used in forms
 */
export function getAvailableApiGroups(): AdminWaitlistTasksResponseDtoGroup[] {
  return Object.values(ApiGroup)
}
