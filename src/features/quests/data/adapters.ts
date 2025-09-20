import {
  type AdminWaitlistTasksResponseDto,
  type AdminWaitlistTasksResponseDtoGroup,
  type AdminWaitlistTasksResponseDtoIterator,
  type AdminWaitlistTasksResponseDtoProvider,
  type AdminWaitlistTasksResponseDtoResources,
  type AdminWaitlistTasksResponseDtoStatus,
  type AdminWaitlistTasksResponseDtoTypeItem,
  AdminWaitlistTasksResponseDtoGroup as ApiGroup,
  AdminWaitlistTasksResponseDtoProvider as ApiProvider,
  AdminWaitlistTasksResponseDtoStatus as ApiStatus,
  AdminWaitlistTasksResponseDtoTypeItem as ApiTypeItem,
} from '@/lib/api/generated/model';
import type { IteratorDaily, Quest, Resources, Task } from './types';

// ============================================================================
// Type Guards
// ============================================================================

function isValidApiTaskType(type: string): type is AdminWaitlistTasksResponseDtoTypeItem {
  return Object.values(ApiTypeItem).includes(type as AdminWaitlistTasksResponseDtoTypeItem);
}

function isValidApiProvider(provider: string): provider is AdminWaitlistTasksResponseDtoProvider {
  return Object.values(ApiProvider).includes(provider as AdminWaitlistTasksResponseDtoProvider);
}

function isValidApiGroup(group: string): group is AdminWaitlistTasksResponseDtoGroup {
  return Object.values(ApiGroup).includes(group as AdminWaitlistTasksResponseDtoGroup);
}

function isValidApiStatus(status: string): status is AdminWaitlistTasksResponseDtoStatus {
  return Object.values(ApiStatus).includes(status as AdminWaitlistTasksResponseDtoStatus);
}

// ============================================================================
// Resource Adapters
// ============================================================================

function adaptResourcesFromApi(
  resources: AdminWaitlistTasksResponseDtoResources | undefined,
): Resources | undefined {
  if (!resources || typeof resources !== 'object') return undefined;

  // TODO: Improve resource mapping when API provides detailed resource schema
  return resources as Resources;
}

function adaptResourcesToApi(
  resources: Resources | undefined,
): AdminWaitlistTasksResponseDtoResources | undefined {
  if (!resources) return undefined;

  // TODO: Add proper resource validation and transformation
  return resources as AdminWaitlistTasksResponseDtoResources;
}

function adaptIteratorFromApi(
  iterator: AdminWaitlistTasksResponseDtoIterator | undefined,
): IteratorDaily | undefined {
  if (!iterator || typeof iterator !== 'object') return undefined;

  // TODO: Improve iterator mapping when API provides detailed iterator schema
  return iterator as unknown as IteratorDaily;
}

function adaptIteratorToApi(
  iterator: IteratorDaily | undefined | null,
): AdminWaitlistTasksResponseDtoIterator | undefined {
  if (!iterator) return undefined;

  // TODO: Add proper iterator validation and transformation
  return iterator as unknown as AdminWaitlistTasksResponseDtoIterator;
}

// ============================================================================
// Main Adapters: API → UI
// ============================================================================

/**
 * Converts AdminWaitlistTasksResponseDto to Quest (UI format)
 * This is a simple adapter since Quest extends the API type
 */
export function adaptAdminTaskToQuest(task: AdminWaitlistTasksResponseDto): Quest {
  return {
    ...task,
    visible: true, // Default to visible for admin view
  };
}

/**
 * Converts Quest to Task for form compatibility
 * This handles the array→string conversion for type field
 */
export function adaptQuestToTask(quest: Quest): Task {
  return {
    id: quest.id,
    type: Array.isArray(quest.type) ? quest.type[0] : quest.type,
    title: quest.title,
    description: quest.description,
    blocking_task: quest.blocking_task,
    reward: quest.reward,
    level: quest.level,
    group: quest.group === 'all' ? 'social' : quest.group,
    order_by: quest.order_by,
    provider: quest.provider,
    uri: quest.uri,
    status: quest.status,
    error: quest.error,
    started_at: quest.started_at,
    completed_at: quest.completed_at,
    next_tick: quest.next_tick,
    resources: adaptResourcesFromApi(quest.resources),
    child: quest.child ? quest.child.map(adaptQuestToTask) : undefined,
    iterable: quest.iterable,
    iterator: adaptIteratorFromApi(quest.iterator),
    visible: quest.visible,
  };
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
  let apiType: AdminWaitlistTasksResponseDtoTypeItem[] | undefined;

  if (task.type) {
    if (isValidApiTaskType(task.type)) {
      apiType = [task.type];
    } else {
      console.warn(`Invalid task type for API: ${task.type}, using 'external' as fallback`);
      apiType = ['external' as AdminWaitlistTasksResponseDtoTypeItem];
    }
  }

  // Handle provider validation
  let apiProvider: AdminWaitlistTasksResponseDtoProvider | undefined;
  if (task.provider) {
    if (isValidApiProvider(task.provider)) {
      apiProvider = task.provider;
    } else {
      console.warn(`Invalid provider for API: ${task.provider}`);
      apiProvider = undefined;
    }
  }

  // Handle group validation
  let apiGroup: AdminWaitlistTasksResponseDtoGroup | undefined;
  if (task.group) {
    if (isValidApiGroup(task.group)) {
      apiGroup = task.group;
    } else {
      console.warn(`Invalid group for API: ${task.group}`);
      apiGroup = 'social'; // Default fallback
    }
  }

  // Handle status validation
  let apiStatus: AdminWaitlistTasksResponseDtoStatus | undefined;
  if (task.status) {
    if (isValidApiStatus(task.status)) {
      apiStatus = task.status;
    } else {
      console.warn(`Invalid status for API: ${task.status}`);
      apiStatus = undefined;
    }
  }

  // Handle child tasks recursively
  const apiChild: AdminWaitlistTasksResponseDto[] = [];
  if (task.child && task.child.length > 0) {
    for (const childTask of task.child) {
      const adaptedChild = adaptTaskToQuest(childTask) as AdminWaitlistTasksResponseDto;
      if (adaptedChild.id !== undefined) {
        apiChild.push(adaptedChild);
      }
    }
  }

  // Compute parent reward fallbacks for multiple/repeatable
  let computedReward = task.reward ?? 0;
  const isMultiple = Array.isArray(task.type)
    ? task.type.includes('multiple')
    : task.type === 'multiple';
  const isRepeatable = Array.isArray(task.type)
    ? task.type.includes('repeatable')
    : task.type === 'repeatable';

  if (isMultiple && task.child && task.child.length > 0) {
    computedReward = task.child.reduce((sum, c) => sum + (c.reward ?? 0), 0);
  }
  if (isRepeatable && task.iterator?.reward_map && Array.isArray(task.iterator.reward_map)) {
    computedReward = task.iterator.reward_map.reduce((s, r) => s + (r ?? 0), 0);
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
    reward: computedReward,
    level: task.level ?? 0,
    group: apiGroup ?? 'social',
    order_by: task.order_by ?? 0,
    status: apiStatus,
    error: task.error ?? undefined,
    started_at: task.started_at ?? undefined,
    completed_at: task.completed_at ?? undefined,
    resources: adaptResourcesToApi(task.resources ?? undefined),
    iterator: adaptIteratorToApi(task.iterator),
    next_tick: task.next_tick ?? undefined,
    visible: task.visible,
  };
}

// ============================================================================
// Batch Adapters
// ============================================================================

/**
 * Converts array of AdminWaitlistTasksResponseDto to Quest array
 */
export function adaptAdminTasksToQuests(tasks: AdminWaitlistTasksResponseDto[]): Quest[] {
  return tasks.map(adaptAdminTaskToQuest);
}

/**
 * Converts array of Quest to Task array
 */
export function adaptQuestsToTasks(quests: Quest[]): Task[] {
  return quests.map(adaptQuestToTask);
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validates if a task can be safely converted to API format
 */
export function validateTaskForApi(task: Partial<Task>): string[] {
  const errors: string[] = [];

  if (!task.title?.trim()) {
    errors.push('Title is required');
  }

  if (!task.type) {
    errors.push('Type is required');
  }

  if (!task.group) {
    errors.push('Group is required');
  }

  if (task.reward !== undefined && task.reward < 0) {
    errors.push('Reward must be non-negative');
  }

  if (task.order_by !== undefined && task.order_by < 0) {
    errors.push('Order must be non-negative');
  }

  return errors;
}

/**
 * Gets available API types that can be used in forms
 */
export function getAvailableApiTypes(): AdminWaitlistTasksResponseDtoTypeItem[] {
  return Object.values(ApiTypeItem);
}

/**
 * Gets available API providers that can be used in forms
 */
export function getAvailableApiProviders(): AdminWaitlistTasksResponseDtoProvider[] {
  return Object.values(ApiProvider);
}

/**
 * Gets available API groups that can be used in forms
 */
export function getAvailableApiGroups(): AdminWaitlistTasksResponseDtoGroup[] {
  return Object.values(ApiGroup);
}
