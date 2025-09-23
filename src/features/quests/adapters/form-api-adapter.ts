/**
 * Adapter layer between form types and API types
 *
 * This adapter handles the conversion between clean form types optimized for UX
 * and API types. Required because:
 *
 * 1. Form validation and defaults don't match API expectations
 * 2. Child tasks require special handling for API compatibility
 * 3. Date fields (start/end) are form-only and not sent to API
 *
 * MIGRATION STATUS:
 * ✅ IteratorDto fields are now optional (iterator_resource, resource)
 * ✅ reward_map is now number[] (was string[])
 * ✅ type field is now single value (was array)
 */
import type { TaskResponseDto } from '@/lib/api/generated/model';
import { questFormSchema } from '../data/schemas';
import {
  type ChildFormValues,
  DEFAULT_FORM_VALUES,
  type QuestFormValues,
} from '../types/form-types';
import type { QuestWithDates } from '../types/quest-with-dates';

// ============================================================================
// API to Form conversion
// ============================================================================

/**
 * Convert API response to form values
 *
 * Transforms API data structure to form-optimized structure:
 * - Ensures all required fields have default values
 * - Converts nullable API fields to form-friendly types
 * - Handles nested resources structure transformation
 *
 * @param apiData - Partial task data from API response
 * @returns Complete form values ready for react-hook-form
 */
export function apiToForm(apiData: Partial<QuestWithDates>): QuestFormValues {
  return {
    // Core fields with fallback to defaults
    title: apiData.title ?? '',
    type: apiData.type ?? 'external',
    description: apiData.description ?? '',
    group: apiData.group ?? 'all',
    order_by: apiData.order_by ?? 0,

    // Optional fields
    provider: apiData.provider,
    uri: apiData.uri ?? undefined,
    reward: apiData.reward,
    enabled: apiData.enabled ?? true,
    preset: apiData.preset,
    block_id: apiData.blocking_task?.id,

    // Resources directly from API
    resources: apiData.resource ?? DEFAULT_FORM_VALUES.resources,
    child: apiData.child ? apiData.child.map(convertApiChildToForm) : undefined,

    // Schedule mapping for edit mode
    start: apiData.started_at ?? undefined,
    end: apiData.completed_at ?? undefined,

    // Iterator mapping for 7-day challenge (API → Form)
    iterator: apiData.iterator
      ? {
          days: typeof apiData.iterator.days === 'number' ? apiData.iterator.days : undefined,
          reward_map: apiData.iterator.reward_map,
        }
      : undefined,
  };
}

/**
 * Extract child resources from API response
 */
function extractChildResources(resourceData: unknown): ChildFormValues['resources'] {
  // TODO: Improve type safety for resourceData (P3)
  if (!resourceData || typeof resourceData !== 'object') {
    return undefined;
  }

  const data = resourceData as Record<string, unknown>; // TODO: Replace with proper type validation (P3)
  const tweetId = typeof data.tweetId === 'string' ? data.tweetId : undefined;
  const username = typeof data.username === 'string' ? data.username : undefined;

  return tweetId || username ? { tweetId, username } : undefined;
}

/**
 * Convert API child task to form child with minimal casting
 */
function convertApiChildToForm(apiChild: TaskResponseDto): ChildFormValues {
  const resourceData = apiChild.resource;
  return {
    title: apiChild.title,
    description: apiChild.description,
    type: apiChild.type as ChildFormValues['type'], // TODO: Remove casting when type compatibility improves (P2)
    group: apiChild.group,
    provider: apiChild.provider,
    reward: apiChild.reward,
    order_by: apiChild.order_by,
    resources: extractChildResources(resourceData),
  };
}

// ============================================================================
// Form to API conversion
// ============================================================================

/**
 * Convert form values to API format for submission
 *
 * Transforms form data back to API-compatible structure:
 * - Converts form strings back to nullable API fields
 * - Handles nested resource structure conversion
 * - Applies proper type mappings for submission
 *
 * @param formData - Complete form values from react-hook-form
 * @returns API-compatible task data for submission
 */
export function formToApi(formData: QuestFormValues): Partial<QuestWithDates> {
  return {
    // Core required fields
    title: formData.title,
    type: formData.type,
    description: formData.description || undefined,
    group: formData.group,
    order_by: formData.order_by,

    // Optional fields
    provider: formData.provider,
    uri: formData.uri,
    reward: formData.reward,
    enabled: formData.enabled,
    preset: formData.preset ?? undefined,
    blocking_task: formData.block_id ? { id: formData.block_id } : undefined,
    web: formData.web ?? true, // Default web enabled for admin-created tasks
    twa: formData.twa ?? false, // Default TWA disabled for admin-created tasks
    pinned: formData.pinned ?? false, // Default not pinned

    // Resources directly as ResourcesDto
    resource: formData.resources,
    child: formData.child ? formData.child.map(convertFormChildToApi) : [],

    // Iterator mapping for 7-day challenge (Form → API)
    iterator: formData.iterator
      ? {
          id: 0, // Will be assigned by API
          days: formData.iterator.days ?? 7,
          reward_map: formData.iterator.reward_map,
          reward_max: Math.max(...formData.iterator.reward_map),
          reward: formData.iterator.reward_map[0] ?? 0,
          day: 0,
          iterator_reward: [],
        }
      : undefined,

    // Date fields
    started_at: formData.start,
    completed_at: formData.end,
  };
}

/**
 * Convert form child to API child
 *
 * @param formChild - Child form values
 * @returns Complete Task object for API
 */
function convertFormChildToApi(formChild: ChildFormValues): TaskResponseDto {
  return {
    title: formChild.title,
    type: formChild.type,
    description: formChild.description,
    group: formChild.group,
    order_by: formChild.order_by,
    provider: formChild.provider,
    reward: formChild.reward,
    enabled: true,
    web: true,
    twa: false,
    pinned: false,
    child: [],
    level: 0,
    blocking_task: { id: 0, title: '' }, // BlockingTaskDto structure
    started_at: undefined,
    completed_at: undefined,
    iterable: false,
    // Include relevant resources for children
    resource: formChild.resources
      ? {
          tweetId: formChild.resources.tweetId,
          username: formChild.resources.username,
        }
      : undefined,
    // Required fields for TaskResponseDto
    id: 0, // Will be assigned by API
    blocking_task_id: 0,
    total_reward: 0,
    total_users: 0,
  } as TaskResponseDto; // TODO: Remove casting when CreateTaskDto matches TaskResponseDto structure (P2)
}

// ============================================================================
// Utility functions
// ============================================================================

/**
 * Get default form values for creating a new quest
 *
 * Provides clean starting state for new quest creation with sensible defaults
 *
 * @returns Complete default form values
 */
export function getDefaultFormValues(): QuestFormValues {
  return {
    ...DEFAULT_FORM_VALUES,
    title: '',
    type: 'external',
    description: '',
    group: 'all',
    order_by: 0,
    enabled: true,
    web: true,
    twa: false,
    pinned: false,
    // Ensure values for all possible fields to avoid uncontrolled->controlled warning
    reward: undefined,
    totalReward: undefined,
    uri: '',
    icon: '',
    provider: undefined, // For controlled Select components
    child: [],
    start: '',
    end: '',
    iterator: undefined,
    resources: {
      ui: {
        button: '',
      },
      username: '',
      tweetId: '',
      icon: '',
    },
  };
}

/**
 * Validate form data and convert to API format
 *
 * TODO: Consider simplifying when Create/Update DTOs match TaskResponseDto structure (P2)
 * Currently needed for:
 * - Zod validation
 * - Enum compatibility (CreateTaskDtoType vs TaskResponseDtoTypeItem)
 */
export function validateAndConvertToApi(formData: unknown): Partial<QuestWithDates> {
  // TODO: Replace unknown with proper type (P3)
  const validatedData = questFormSchema.parse(formData);
  return formToApi(validatedData as QuestFormValues); // TODO: Remove casting when Zod types align better (P2)
}
