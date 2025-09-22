/**
 * Adapter layer between form types and API types
 *
 * This adapter handles the conversion between clean form types optimized for UX
 * and API types. Required because:
 *
 * 1. Form structure differs from API (single type vs array, optional vs required fields)
 * 2. Iterator reward_map needs string conversion until Swagger IteratorDto is fixed
 * 3. Child tasks require special handling for API compatibility
 * 4. Form validation and defaults don't match API expectations
 *
 * REMAINING ISSUES:
 * - IteratorDto - reward_map remains string[] in API (form uses number[])
 * - Child task adapters use Pick<TaskResponseDto> for type safety
 */
import type { TaskResponseDto } from '@/lib/api/generated/model';
import { questFormSchema } from '../data/schemas';
import {
  type ChildFormValues,
  DEFAULT_FORM_VALUES,
  type QuestFormValues,
} from '../types/form-types';

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
export function apiToForm(apiData: Partial<TaskResponseDto>): QuestFormValues {
  return {
    // Core fields with fallback to defaults
    title: apiData.title ?? '',
    type: Array.isArray(apiData.type) && apiData.type.length > 0 ? apiData.type[0] : 'external', // TODO: Simplify when API uses single type instead of array (P2)
    description: apiData.description ?? '',
    group: apiData.group ?? 'all',
    order_by: apiData.order_by ?? 0,

    // Optional fields
    provider: apiData.provider,
    uri: apiData.uri ?? undefined,
    reward: apiData.reward,
    enabled: apiData.enabled ?? true,

    // Resources directly from API
    resources: apiData.resource ?? apiData.resources ?? DEFAULT_FORM_VALUES.resources, // TODO: Unify resource vs resources field naming (P1)
    child: apiData.child ? apiData.child.map(convertApiChildToForm) : undefined,

    // Schedule mapping for edit mode
    start: apiData.started_at ?? undefined,
    end: apiData.completed_at ?? undefined,

    // Iterator mapping for 7-day challenge (API → Form)
    // API sends string[], convert to number[] for form
    iterator: apiData.iterator
      ? {
          days: typeof apiData.iterator.days === 'number' ? apiData.iterator.days : undefined,
          reward_map: Array.isArray(apiData.iterator.reward_map)
            ? apiData.iterator.reward_map.map((reward: string | number) =>
                typeof reward === 'string' ? parseFloat(reward) || 0 : reward,
              )
            : [],
        }
      : undefined,
  };
}

/**
 * Safely extract first type from API type array
 */
function getFirstType(apiType: string | string[] | undefined): string {
  if (Array.isArray(apiType) && apiType.length > 0) {
    return apiType[0];
  }
  return typeof apiType === 'string' ? apiType : 'external';
}

/**
 * Extract child resources from API response
 */
function extractChildResources(resourceData: unknown): ChildFormValues['resources'] {
  if (!resourceData || typeof resourceData !== 'object') {
    return undefined;
  }

  const data = resourceData as Record<string, unknown>;
  const tweetId = typeof data.tweetId === 'string' ? data.tweetId : undefined;
  const username = typeof data.username === 'string' ? data.username : undefined;

  return (tweetId || username) ? { tweetId, username } : undefined;
}

/**
 * Convert API child task to form child with minimal casting
 */
function convertApiChildToForm(apiChild: TaskResponseDto): ChildFormValues {
  const resourceData = apiChild.resource ?? apiChild.resources;
  const childType = getFirstType(apiChild.type);

  return {
    title: apiChild.title,
    description: apiChild.description,
    type: childType as ChildFormValues['type'], // TODO: Remove when API unifies enums between Create/Response DTOs (P2)
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
export function formToApi(formData: QuestFormValues): Partial<TaskResponseDto> {
  return {
    // Core required fields
    title: formData.title,
    type: [formData.type], // TODO: Simplify when API uses single type instead of array (P2)
    description: formData.description || undefined,
    group: formData.group,
    order_by: formData.order_by,

    // Optional fields
    provider: formData.provider,
    uri: formData.uri,
    reward: formData.reward,
    enabled: formData.enabled,
    web: formData.web ?? true, // Default web enabled for admin-created tasks
    twa: formData.twa ?? false, // Default TWA disabled for admin-created tasks
    pinned: formData.pinned ?? false, // Default not pinned

    // Resources directly as ResourcesDto
    resource: formData.resources,
    child: formData.child ? formData.child.map(convertFormChildToApi) : undefined,

    // Iterator mapping for 7-day challenge (Form → API)
    iterator: formData.iterator
      ? {
          days: formData.iterator.days ?? 7,
          reward_map: formData.iterator.reward_map.map(String), // TODO: Remove .map(String) when API uses number[] (P0)
          reward_max: Math.max(...formData.iterator.reward_map),
          reward: formData.iterator.reward_map[0] ?? 0,
          day: 0,
          iterator_reward: [],
          iterator_resource: {}, // TODO: Remove when IteratorDto makes this optional (P1)
          resource: {}, // TODO: Remove when IteratorDto makes this optional (P1)
        }
      : undefined,
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
    id: 0, // Will be assigned by API
    title: formChild.title,
    type: [formChild.type] as TaskResponseDto['type'], // TODO: Remove array wrapping when API unifies type structures (P2)
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
    resources: formChild.resources
      ? {
          tweetId: formChild.resources.tweetId,
          username: formChild.resources.username,
        }
      : undefined,
    // Required fields for TaskResponseDto
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
  } as QuestFormValues; // TODO: Remove casting when type compatibility improves (P2)
}

/**
 * Validate form data and convert to API format
 *
 * TODO: Consider simplifying when Create/Update DTOs match TaskResponseDto structure (P2)
 * Currently needed for:
 * - Zod validation
 * - type: string → type: string[] conversion
 * - Iterator number[] → string[] conversion (temporary)
 * - Enum compatibility (CreateTaskDtoType vs TaskResponseDtoTypeItem)
 */
export function validateAndConvertToApi(formData: unknown): Partial<TaskResponseDto> {
  const validatedData = questFormSchema.parse(formData);
  return formToApi(validatedData as QuestFormValues); // TODO: Remove casting when Zod types align better (P2)
}
