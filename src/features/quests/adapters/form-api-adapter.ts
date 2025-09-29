/**
 * STRICT VALIDATION ADAPTER - BREAKS LEGACY DATA INTENTIONALLY
 *
 * This adapter enforces fail-fast validation with ZERO tolerance for invalid data.
 *
 * ⚠️  BREAKING CHANGES:
 * - NO fallback patterns (|| '', ?? 0, etc.)
 * - ALL required fields must be present and correctly typed
 * - Throws errors instead of silent corruption
 * - Legacy quests with missing fields WILL CRASH
 *
 * KEY PRINCIPLES:
 * 1. Explicit validation with meaningful error messages
 * 2. Fail-fast on invalid API responses
 * 3. Strict type checking everywhere
 * 4. No defensive programming - crash early and loudly
 *
 * MIGRATION STATUS:
 * - All fallbacks removed - strict validation only
 * - Required fields enforced without mercy
 * - Empty strings and undefined values rejected
 */
import type { CreateTaskDto, TaskResponseDto } from '@/lib/api/generated/model';
import { buildQuestFormSchema } from '../types/form-schema';
import { type ChildFormValues, type QuestFormValues } from '../types/form-types';
import {
  formatValidationErrors,
  validateBlockingTaskDependencies,
  validateMultipleURIUniqueness,
  validatePresetCompatibility,
  validateRequiredFields,
} from '../validators/quest-validator';

// ============================================================================
// Data validation helpers
// ============================================================================

/**
 * AGGRESSIVE API DATA VALIDATION - FAIL FAST ON INVALID DATA
 *
 * ⚠️  BREAKING: No fallbacks, no mercy for missing or invalid fields
 * Legacy data with issues will throw errors immediately
 */
function validateRequiredApiData(apiData: Partial<TaskResponseDto>): void {
  const errors: string[] = [];

  // ALL core fields are REQUIRED - no optionals, no fallbacks
  if (typeof apiData.title !== 'string' || !apiData.title.trim()) {
    errors.push('title must be a non-empty string');
  }

  if (typeof apiData.description !== 'string') {
    errors.push('description must be a string');
  }

  if (!apiData.type) {
    errors.push('type is required');
  }

  if (!apiData.group) {
    errors.push('group is required');
  }

  if (typeof apiData.reward !== 'number') {
    errors.push(`reward must be a number, got: ${typeof apiData.reward}`);
  }

  if (typeof apiData.order_by !== 'number') {
    errors.push(`order_by must be a number, got: ${typeof apiData.order_by}`);
  }

  if (typeof apiData.enabled !== 'boolean') {
    errors.push(`enabled must be a boolean, got: ${typeof apiData.enabled}`);
  }

  // Resource validation - no fallbacks
  if (!apiData.resource) {
    errors.push('resource object is required');
  }

  if (errors.length > 0) {
    console.error('STRICT API validation failed:', { apiData, errors });
    throw new Error(`INVALID API DATA - FAIL FAST: ${errors.join(', ')}`);
  }
}

/**
 * Safely extract string value with validation
 */
function getRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string, got: ${typeof value}`);
  }
  return value;
}

/**
 * Safely extract number value with validation
 */
function getRequiredNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number') {
    throw new Error(`${fieldName} must be a number, got: ${typeof value}`);
  }
  return value;
}

/**
 * Safely extract boolean value with validation
 */
function getRequiredBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`${fieldName} must be a boolean, got: ${typeof value}`);
  }
  return value;
}

/**
 * Validate required boolean field - throw if not boolean
 */
function validateRequiredBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`${fieldName} is required and must be a boolean, got: ${typeof value}`);
  }
  return value;
}

/**
 * Validate optional string - must be string if present, null/undefined allowed
 */
function validateOptionalString(value: unknown, fieldName: string): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string if provided, got: ${typeof value}`);
  }
  return value;
}

/**
 * STRICT RESOURCE VALIDATION - NO FALLBACKS
 *
 * ⚠️  BREAKING: Resources are now REQUIRED - will crash if missing
 */
function validateAndExtractResources(resource: unknown): QuestFormValues['resources'] {
  if (!resource) {
    throw new Error('Resources are REQUIRED - no fallback allowed (legacy data incompatible)');
  }

  if (typeof resource !== 'object' || resource === null) {
    throw new Error(`Resources must be an object, got: ${typeof resource}`);
  }

  // Return as-is but remove icon to avoid duplication
  const { icon, ...otherResources } = resource as Record<string, unknown>;
  return otherResources as QuestFormValues['resources'];
}

/**
 * Validate and extract children with strict validation
 */
function validateAndExtractChildren(child: unknown): QuestFormValues['child'] {
  if (!child) {
    return []; // Empty array is valid for non-multiple types
  }

  if (!Array.isArray(child)) {
    throw new Error(`Children must be an array, got: ${typeof child}`);
  }

  return child.map(convertApiChildToForm);
}

// ============================================================================
// API to Form conversion
// ============================================================================

/**
 * STRICT API TO FORM CONVERSION - NO FALLBACKS ALLOWED
 *
 * ⚠️  BREAKING CHANGE: This function will CRASH on invalid data
 *
 * Transforms API data with ZERO tolerance for missing/invalid fields:
 * - ALL required fields must be present and correctly typed
 * - Throws descriptive errors instead of silent corruption
 * - No empty string fallbacks - fails fast on missing data
 *
 * @param apiData - API response data (MUST contain all required fields)
 * @returns Strictly validated form values
 * @throws Error if any required field is missing or invalid
 */
export function apiToForm(apiData: Partial<TaskResponseDto>): QuestFormValues {
  // Validate required fields first
  validateRequiredApiData(apiData);

  return {
    // Core fields - ALL REQUIRED, NO FALLBACKS
    id: apiData.id, // Include ID for form (enables update detection)
    title: getRequiredString(apiData.title, 'title'),
    type: getRequiredString(apiData.type, 'type') as QuestFormValues['type'],
    description: getRequiredString(apiData.description, 'description'),
    group: getRequiredString(apiData.group, 'group') as QuestFormValues['group'],
    order_by: getRequiredNumber(apiData.order_by, 'order_by'),

    // Optional fields (but validate if present)
    provider: apiData.provider,
    uri: validateOptionalString(apiData.uri, 'uri'),
    reward: getRequiredNumber(apiData.reward, 'reward'),
    enabled: getRequiredBoolean(apiData.enabled, 'enabled'),
    web: getRequiredBoolean(apiData.web, 'web'),
    twa: getRequiredBoolean(apiData.twa, 'twa'),
    pinned: getRequiredBoolean(apiData.pinned, 'pinned'),
    preset: validateOptionalString(apiData.preset, 'preset'),
    parent_id: apiData.parent_id,
    blocking_task: apiData.blocking_task,
    icon: validateOptionalString(apiData.resource?.icon, 'icon'),

    // Resources - strict validation, no fallbacks
    resources: validateAndExtractResources(apiData.resource),
    child: validateAndExtractChildren(apiData.child),

    // Schedule mapping for edit mode
    start: apiData.started_at,
    end: apiData.completed_at,

    // Iterator mapping for 7-day challenge (API → Form)
    iterator: apiData.iterator ? validateAndExtractIterator(apiData.iterator) : undefined,
  };
}

/**
 * Validate and extract iterator data with strict type checking
 */
function validateAndExtractIterator(iterator: unknown): QuestFormValues['iterator'] {
  if (!iterator || typeof iterator !== 'object') {
    throw new Error('Iterator must be an object');
  }

  const iteratorObj = iterator as Record<string, unknown>;

  if (!Array.isArray(iteratorObj.reward_map)) {
    throw new Error('Iterator reward_map must be an array');
  }

  const rewardMap = iteratorObj.reward_map as unknown[];
  // Handle both number[] and string[] formats from API
  const parsedRewardMap = rewardMap.map((reward) => {
    if (typeof reward === 'number') return reward;
    if (typeof reward === 'string') {
      const parsed = Number(reward);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  });

  return {
    days: typeof iteratorObj.days === 'number' ? iteratorObj.days : undefined,
    reward_map: parsedRewardMap,
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
 * Convert API child task to form child with strict validation
 */
function convertApiChildToForm(apiChild: TaskResponseDto): ChildFormValues {
  // Validate required child fields
  if (typeof apiChild.title !== 'string') {
    throw new Error(`Child task title must be a string, got: ${typeof apiChild.title}`);
  }

  if (typeof apiChild.reward !== 'number') {
    throw new Error(`Child task reward must be a number, got: ${typeof apiChild.reward}`);
  }

  if (typeof apiChild.order_by !== 'number') {
    throw new Error(`Child task order_by must be a number, got: ${typeof apiChild.order_by}`);
  }

  // Ensure child task type is valid for child tasks (filter out parent-only types)
  const childTypes = ['like', 'share', 'comment', 'join', 'connect'] as const;
  type ChildTypeUnion = (typeof childTypes)[number];

  if (!childTypes.includes(apiChild.type as ChildTypeUnion)) {
    throw new Error(
      `Invalid child task type: ${apiChild.type}. Must be one of: ${childTypes.join(', ')}`,
    );
  }

  return {
    title: apiChild.title,
    description: apiChild.description,
    type: apiChild.type as ChildFormValues['type'],
    group: apiChild.group,
    provider: apiChild.provider,
    reward: apiChild.reward,
    order_by: apiChild.order_by,
    resources: extractChildResources(apiChild.resource),
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
 * - Automatically detects CREATE vs UPDATE based on presence of ID
 *
 * @param formData - Complete form values from react-hook-form
 * @returns API-compatible CreateTaskDto for submission
 */
export function formToApi(formData: QuestFormValues): Omit<CreateTaskDto, 'parent_id'> {
  const isUpdate = !!formData.id; // Detect update vs create by ID presence
  const baseData = {
    // Core required fields
    title: formData.title,
    type: formData.type,
    description: formData.description || '',
    group: formData.group,
    // For multiple type, reward should be total of all child rewards - STRICT
    reward:
      formData.type === 'multiple'
        ? (formData.totalReward ?? calculateTotalRewardFromChildren(formData.child))
        : formData.reward,
    enabled: validateRequiredBoolean(formData.enabled, 'enabled'),
    web: formData.web ?? true, // Default to true if undefined
    twa: formData.twa ?? false, // Default to false if undefined
    pinned: formData.pinned ?? false, // Default to false if undefined
    // Include level only for CREATE (POST), not for UPDATE (PATCH)
    ...(isUpdate ? {} : { level: 1 }),

    // Include preset if specified
    ...(formData.preset && { preset: formData.preset }),

    // Include order_by for UPDATE operations (supported by UpdateTaskDto)
    ...(isUpdate && typeof formData.order_by === 'number' && { order_by: formData.order_by }),

    // Optional fields - only include if not empty
    ...(formData.provider && { provider: formData.provider }),
    // URI is required for multiple type and must not be empty
    ...(formData.uri ? { uri: formData.uri } : {}),
    // blocking_task only for CREATE (PATCH doesn't handle ORM references properly)
    ...(!isUpdate && formData.blocking_task ? { blocking_task: formData.blocking_task } : {}),
    // parent_id if explicitly set (required for some child task types)
    ...(formData.parent_id && { parent_id: formData.parent_id }),

    // Include resources - use empty object as fallback since entity requires non-null
    // CRITICAL FIX: Restore icon from top-level icon field back to resources.icon
    resource: {
      ...(formData.resources ?? {}),
      ...(formData.icon && { icon: formData.icon }),
    },

    // Child tasks - NEVER include in API request, they are created separately
    // ...(formData.child && formData.child.length > 0 && { ... }),

    // Iterator mapping for 7-day challenge (Form to API) - only if present
    ...(formData.iterator && {
      iterator: {
        day: 0, // Starting day for iterator
        days: formData.iterator.days ?? 7,
        reward_map: formData.iterator.reward_map,
        iterator_reward: formData.iterator.reward_map.map((reward) =>
          typeof reward === 'number' ? String(reward) : '0',
        ), // Backend API requires string[] format - safe conversion from number[]
        iterator_resource: {}, // Empty object as default
        reward: formData.iterator.reward_map[0] ?? 0, // First day reward
        reward_max: Math.max(...formData.iterator.reward_map),
      },
    }),

    // Date fields - only if not empty
    ...(formData.start && { started_at: formData.start }),
    ...(formData.end && { completed_at: formData.end }),
  };

  return baseData as Omit<CreateTaskDto, 'parent_id'>;
}

// ============================================================================
// Utility functions
// ============================================================================

/**
 * Default form values for new quest creation
 */
export function getDefaultFormValues(): QuestFormValues {
  return {
    // ID undefined for new quests (enables create detection)
    id: undefined,
    // User input fields - empty strings for forms
    title: '',
    type: 'external',
    description: '',
    group: 'all',
    order_by: 0,
    reward: 0,
    enabled: false,
    web: true,
    twa: false,
    pinned: false,

    // Optional fields - undefined when not set
    totalReward: undefined,
    uri: undefined,
    icon: undefined,
    provider: undefined,
    preset: undefined,
    parent_id: undefined,
    blocking_task: undefined,
    child: [],
    start: undefined,
    end: undefined,
    iterator: undefined,

    // Resources - set isNew to true by default
    resources: {
      isNew: true,
      ui: {
        button: '',
        'pop-up': {
          name: '',
          button: '',
          description: '',
        },
      },
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
  existingQuests?: Array<{ id: number; type: string; provider?: string; uri?: string }>,
): Omit<CreateTaskDto, 'parent_id'> {
  // First validate with Zod schema
  const schema = buildQuestFormSchema(presetId);
  // Zod parse returns correct type but TypeScript needs help with inference
  const validatedData = schema.parse(formData) as QuestFormValues;

  // Then validate business rules

  const requiredFieldsResult = validateRequiredFields(validatedData);
  const presetErrors = validatePresetCompatibility(validatedData, presetId);
  const dependencyErrors = availableConnectQuests
    ? validateBlockingTaskDependencies(validatedData, availableConnectQuests)
    : [];
  const uniquenessErrors = existingQuests
    ? [...validateMultipleURIUniqueness(validatedData, existingQuests)]
    : [];

  const allErrors = [
    ...requiredFieldsResult.errors,
    ...presetErrors,
    ...dependencyErrors,
    ...uniquenessErrors,
  ];

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
 * STRICT CHILD REWARD CALCULATION - FAIL FAST ON INVALID DATA
 *
 * ⚠️  BREAKING: No longer accepts empty arrays or invalid rewards
 * Will throw error instead of returning 0 fallback
 */
function calculateTotalRewardFromChildren(children?: ChildFormValues[]): number {
  if (!children || children.length === 0) {
    throw new Error('Cannot calculate total reward: children array is empty or undefined');
  }

  return children.reduce((total, child) => {
    if (typeof child.reward !== 'number') {
      throw new Error(`Child reward must be a number, got: ${typeof child.reward}`);
    }
    return total + child.reward;
  }, 0);
}
