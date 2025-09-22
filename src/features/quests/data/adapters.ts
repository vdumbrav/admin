import {
  TaskResponseDtoGroup as ApiGroup,
  TaskResponseDtoProvider as ApiProvider,
  TaskResponseDtoTypeItem as ApiTypeItem,
  type TaskResponseDto,
  type TaskResponseDtoGroup,
  type TaskResponseDtoProvider,
  type TaskResponseDtoTypeItem,
} from '@/lib/api/generated/model';
import type { Quest } from './types';

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
