import {
  TaskResponseDtoGroup as ApiGroup,
  TaskResponseDtoProvider as ApiProvider,
  TaskResponseDtoTypeItem as ApiTypeItem,
  type TaskResponseDto,
  type TaskResponseDtoGroup,
  type TaskResponseDtoIterator,
  type TaskResponseDtoProvider,
  type TaskResponseDtoTypeItem,
} from '@/lib/api/generated/model';
import type { IteratorDaily, Quest } from './types';

// ============================================================================
// Main Adapters: API → UI
// ============================================================================

/**
 * Identity function - Quest is now the same as TaskResponseDto
 */
export function adaptAdminTaskToQuest(task: TaskResponseDto): Quest {
  return task;
}

// ============================================================================
// Main Adapters: UI → API
// ============================================================================

// ============================================================================
// Batch Adapters
// ============================================================================

/**
 * Converts array of TaskResponseDto to Quest array
 */
export function adaptAdminTasksToQuests(tasks: TaskResponseDto[]): Quest[] {
  return tasks.map(adaptAdminTaskToQuest);
}

// ============================================================================
// Iterator Converters
// ============================================================================

/**
 * Type guard to check if API iterator has the expected structure
 */
export function isValidIterator(iterator: TaskResponseDtoIterator): iterator is IteratorDaily {
  return (
    typeof iterator === 'object' &&
    iterator !== null &&
    typeof iterator.days === 'number' &&
    Array.isArray(iterator.reward_map) &&
    iterator.reward_map.every((r: unknown) => typeof r === 'number') &&
    typeof iterator.reward_max === 'number' &&
    typeof iterator.reward === 'number'
  );
}

/**
 * Converts API iterator (untyped) to typed IteratorDaily
 */
export function convertApiIteratorToDaily(apiIterator?: TaskResponseDtoIterator): IteratorDaily | undefined {
  if (!apiIterator) return undefined;

  // Type assertion after validation
  if (isValidIterator(apiIterator)) {
    return apiIterator;
  }

  // Fallback with safe defaults if structure is invalid
  return {
    days: typeof apiIterator.days === 'number' ? apiIterator.days : 7,
    reward_map: Array.isArray(apiIterator.reward_map)
      ? apiIterator.reward_map.filter((r: unknown) => typeof r === 'number')
      : [],
    reward_max: typeof apiIterator.reward_max === 'number' ? apiIterator.reward_max : 0,
    reward: typeof apiIterator.reward === 'number' ? apiIterator.reward : 0,
    day: typeof apiIterator.day === 'number' ? apiIterator.day : 0,
    tick: typeof apiIterator.tick === 'number' ? apiIterator.tick : undefined,
  };
}

/**
 * Converts typed IteratorDaily to API iterator (untyped)
 */
export function convertDailyToApiIterator(daily: IteratorDaily): TaskResponseDtoIterator {
  return {
    days: daily.days,
    reward_map: daily.reward_map,
    reward_max: daily.reward_max,
    reward: daily.reward,
    day: daily.day || 0,
    tick: daily.tick,
  };
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Gets available API types that can be used in forms
 */
export function getAvailableApiTypes(): TaskResponseDtoTypeItem[] {
  return Object.values(ApiTypeItem);
}

/**
 * Gets available API providers that can be used in forms
 */
export function getAvailableApiProviders(): TaskResponseDtoProvider[] {
  return Object.values(ApiProvider);
}

/**
 * Gets available API groups that can be used in forms
 */
export function getAvailableApiGroups(): TaskResponseDtoGroup[] {
  return Object.values(ApiGroup);
}
