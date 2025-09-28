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
 * - IteratorDto fields are now optional (iterator_resource, resource)
 * - reward_map is now number[] (was string[])
 * - type field is now single value (was array)
 */
import type { CreateTaskDto, TaskResponseDto } from '@/lib/api/generated/model';
import { buildQuestFormSchema } from '../types/form-schema';
import {
  type ChildFormValues,
  DEFAULT_FORM_VALUES,
  type QuestFormValues,
} from '../types/form-types';
import {
  formatValidationErrors,
  validateBlockingTaskDependencies,
  validatePresetCompatibility,
  validateRequiredFields,
} from '../validators/quest-validator';

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
    type: apiData.type ?? 'external',
    description: apiData.description ?? '',
    group: apiData.group ?? 'all',
    order_by: apiData.order_by ?? 0,

    // Optional fields
    provider: apiData.provider,
    uri: apiData.uri ?? undefined,
    reward: apiData.reward ?? 0,
    enabled: apiData.enabled ?? true,
    preset: apiData.preset,
    blocking_task: apiData.blocking_task,
    icon: apiData.resource?.icon ?? undefined,

    // Resources directly from API (excluding icon which is handled separately)
    resources: apiData.resource
      ? {
          ...apiData.resource,
          icon: undefined, // Remove icon from resources to avoid duplication
        }
      : DEFAULT_FORM_VALUES.resources,
    child: apiData.child ? apiData.child.map(convertApiChildToForm) : [],

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
 * Type guard to validate resource data structure
 */
function isValidResourceData(data: unknown): data is Record<string, unknown> {
  return data !== null && typeof data === 'object';
}

/**
 * Extract child resources from API response with proper type safety
 */
function extractChildResources(resourceData: unknown): ChildFormValues['resources'] {
  if (!isValidResourceData(resourceData)) {
    return undefined;
  }

  const tweetId = typeof resourceData.tweetId === 'string' ? resourceData.tweetId : undefined;
  const username = typeof resourceData.username === 'string' ? resourceData.username : undefined;

  return tweetId || username ? { tweetId, username } : undefined;
}

/**
 * Convert API child task to form child with minimal casting
 */
function convertApiChildToForm(apiChild: TaskResponseDto): ChildFormValues {
  const resourceData = apiChild.resource;

  // Ensure child task type is valid for child tasks (filter out parent-only types)
  const childTypes = ['like', 'share', 'comment', 'join', 'connect'] as const;
  type ChildTypeUnion = (typeof childTypes)[number];
  const validChildType = childTypes.includes(apiChild.type as ChildTypeUnion)
    ? (apiChild.type as ChildFormValues['type'])
    : 'like';

  return {
    title: apiChild.title,
    description: apiChild.description,
    type: validChildType,
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
 * Convert form values to CreateTaskDto format for submission
 *
 * Transforms form data back to API-compatible structure:
 * - Converts form strings back to nullable API fields
 * - Handles nested resource structure conversion
 * - Applies proper type mappings for submission
 * - Uses proper CreateTaskDto interface (not TaskResponseDto)
 *
 * @param formData - Complete form values from react-hook-form
 * @returns API-compatible CreateTaskDto for submission
 */
export function formToApi(formData: QuestFormValues): Omit<CreateTaskDto, 'parent_id'> {
  const baseData: Omit<CreateTaskDto, 'parent_id'> = {
    // Core required fields
    title: formData.title,
    type: formData.type,
    description: formData.description || '',
    group: formData.group,
    // For multiple type, reward should be total of all child rewards
    reward:
      formData.type === 'multiple'
        ? (formData.totalReward ?? calculateTotalRewardFromChildren(formData.child) ?? 0)
        : formData.reward,
    enabled: formData.enabled ?? true, // Required boolean for CreateTaskDto
    web: formData.web ?? true, // Required boolean for CreateTaskDto
    twa: formData.twa ?? false, // Required boolean for CreateTaskDto
    pinned: formData.pinned ?? false, // Required boolean for CreateTaskDto
    level: 1, // Required field for CreateTaskDto - form doesn't have this field

    // Include preset if specified
    // TEMPORARILY DISABLED: preset field not supported by API
    // ...(formData.preset && { preset: formData.preset }),

    // Exclude form-only fields like order_by, totalReward, etc.

    // Optional fields - only include if not empty
    ...(formData.provider && { provider: formData.provider }),
    // URI is required for multiple type even if empty
    ...(formData.uri || formData.type === 'multiple' ? { uri: formData.uri ?? '' } : {}),
    // blocking_task for multiple type or if explicitly set
    // For multiple type, blocking_task is REQUIRED by API validation
    ...(formData.blocking_task || formData.type === 'multiple'
      ? { blocking_task: formData.blocking_task ?? { id: 1 } }
      : {}),

    // Include resources if present
    ...(formData.resources && { resource: formData.resources }),

    // Child tasks - NEVER include in API request, they are created separately
    // ...(formData.child && formData.child.length > 0 && { ... }),

    // Iterator mapping for 7-day challenge (Form to API) - only if present
    ...(formData.iterator && {
      iterator: {
        day: 0, // Starting day for iterator
        days: formData.iterator.days ?? 7,
        reward_map: formData.iterator.reward_map,
        iterator_reward: [], // Will be populated by API
        reward: formData.iterator.reward_map[0] ?? 0, // First day reward
        reward_max: Math.max(...formData.iterator.reward_map),
      },
    }),

    // Date fields - only if not empty
    ...(formData.start && { started_at: formData.start }),
    ...(formData.end && { completed_at: formData.end }),
  };

  return baseData;
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
    reward: 0,
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
 * Performs comprehensive validation before API submission:
 * - Required field validation
 * - Type-specific validation
 * - Preset compatibility
 * - Zod schema validation
 */
export function validateAndConvertToApi(
  formData: unknown,
  presetId?: string,
  availableConnectQuests?: Array<{ id: number; provider: string }>,
): Omit<CreateTaskDto, 'parent_id'> {
  // First validate with Zod schema
  const schema = buildQuestFormSchema(presetId);
  // TODO: Improve type safety - Zod parse should return proper type without casting
  const validatedData = schema.parse(formData) as QuestFormValues;

  // Then validate business rules

  const requiredFieldsResult = validateRequiredFields(validatedData);
  const presetErrors = validatePresetCompatibility(validatedData, presetId);
  const dependencyErrors = availableConnectQuests
    ? validateBlockingTaskDependencies(validatedData, availableConnectQuests)
    : [];

  const allErrors = [...requiredFieldsResult.errors, ...presetErrors, ...dependencyErrors];

  if (allErrors.length > 0) {
    const errorMessage = formatValidationErrors(allErrors);
    throw new Error(`Validation failed:\n${errorMessage}`);
  }

  return formToApi(validatedData);
}

// ============================================================================
// Helper functions
// ============================================================================

/**
 * Calculate total reward from children array - safe fallback
 */
function calculateTotalRewardFromChildren(children?: ChildFormValues[]): number {
  if (!children || children.length === 0) return 0;

  return children.reduce((total, child) => {
    const reward = typeof child.reward === 'number' ? child.reward : 0;
    return total + reward;
  }, 0);
}
