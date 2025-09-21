/**
 * Adapter layer between form types and API types
 *
 * This adapter handles the conversion between clean form types optimized for UX
 * and the current API types. When the API is improved, this adapter can be updated
 * or removed.
 *
 * TECHNICAL DEBT ANALYSIS:
 * ========================
 *
 * Issues requiring attention:
 * 1. Type safety compromises with `as` casting due to API type inconsistencies
 * 2. Hardcoded fallback values (e.g., group: 'social' for children)
 * 3. Resources structure lacks proper typing (using Record<string, unknown>)
 * 4. Child task type mismatches between API and form (some types not supported)
 *
 * When API is improved, remove this adapter and use direct form-to-API mapping.
 */
import type { Task } from '../data/types';
import {
  type ChildFormValues,
  DEFAULT_FORM_VALUES,
  type FormResources,
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
export function apiToForm(apiData: Partial<Task>): QuestFormValues {
  return {
    // Core fields with fallback to defaults
    title: apiData.title ?? (DEFAULT_FORM_VALUES.title as string),
    type: apiData.type ?? (DEFAULT_FORM_VALUES.type as QuestFormValues['type']),
    description: apiData.description ?? (DEFAULT_FORM_VALUES.description as string),
    group: apiData.group ?? (DEFAULT_FORM_VALUES.group as QuestFormValues['group']),
    order_by: apiData.order_by ?? (DEFAULT_FORM_VALUES.order_by as number),

    // Optional fields
    provider: apiData.provider,
    uri: apiData.uri ?? undefined,
    reward: apiData.reward,
    visible: apiData.visible ?? (DEFAULT_FORM_VALUES.visible as boolean),

    // Complex nested structures requiring conversion
    resources: apiData.resources
      ? convertApiResourcesToForm(apiData.resources as Record<string, unknown>)
      : DEFAULT_FORM_VALUES.resources,
    child: apiData.child ? apiData.child.map(convertApiChildToForm) : undefined,

    // Schedule mapping for edit mode
    start: apiData.started_at ?? undefined,
    end: apiData.completed_at ?? undefined,

    // Iterator passthrough if any (7-day challenge)
    iterator: (apiData.iterator ?? undefined) as QuestFormValues['iterator'] | undefined,
  };
}

/**
 * Convert API child task to form child
 *
 * ISSUE: Type casting required due to API/form type mismatch
 * - API supports more task types than child form accepts
 * - Should be resolved by aligning API schemas
 *
 * @param apiChild - Complete task from API
 * @returns Simplified child form values
 */
function convertApiChildToForm(apiChild: Task): ChildFormValues {
  return {
    title: apiChild.title,
    type: apiChild.type as ChildFormValues['type'], // TODO: Fix type mismatch in API
    provider: apiChild.provider,
    reward: apiChild.reward,
    order_by: apiChild.order_by,
    // Only extract relevant resources for children (Twitter-specific)
    resources: apiChild.resources
      ? {
          tweetId: apiChild.resources.tweetId,
          username: apiChild.resources.username,
        }
      : undefined,
  };
}

/**
 * Convert API resources to form resources
 *
 * MAJOR ISSUE: Resources lack proper typing in API
 * - Currently using unsafe type casting from Record<string, unknown>
 * - API should define proper ResourcesSchema in OpenAPI/Swagger
 * - This function contains the most technical debt in the adapter
 *
 * @param apiResources - Untyped resources object from API
 * @returns Properly typed form resources
 */
function convertApiResourcesToForm(
  apiResources: Record<string, unknown> | null | undefined,
): FormResources {
  if (!apiResources) return {};

  // UNSAFE: Type assertion due to lack of proper API typing
  // TODO: Replace with proper API schema validation
  const resources = apiResources as {
    icon?: string;
    username?: string;
    tweetId?: string;
    isNew?: boolean;
    block_id?: string;
    ui?: {
      button?: string;
      'pop-up'?: {
        name?: string;
        button?: string;
        description?: string;
        static?: string;
        'additional-title'?: string;
        'additional-description'?: string;
      };
    };
    adsgram?: {
      type?: 'task' | 'reward';
      subtype?: 'video-ad' | 'post-style-image';
    };
  };

  return {
    // Basic resource fields
    icon: resources.icon,
    username: resources.username,
    tweetId: resources.tweetId,
    isNew: resources.isNew,
    block_id: resources.block_id,

    // UI configuration with safe defaults
    ui: resources.ui
      ? {
          button: resources.ui.button ?? '',
          'pop-up': resources.ui['pop-up']
            ? {
                name: resources.ui['pop-up'].name ?? '',
                button: resources.ui['pop-up'].button ?? '',
                description: resources.ui['pop-up'].description ?? '',
                static: resources.ui['pop-up'].static,
                'additional-title': resources.ui['pop-up']['additional-title'],
                'additional-description': resources.ui['pop-up']['additional-description'],
              }
            : undefined,
        }
      : DEFAULT_FORM_VALUES.resources?.ui,

    // Adsgram integration settings
    adsgram: resources.adsgram
      ? {
          type: resources.adsgram.type,
          subtype: resources.adsgram.subtype,
        }
      : undefined,
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
export function formToApi(formData: QuestFormValues): Partial<Task> {
  return {
    // Core required fields
    title: formData.title,
    type: formData.type,
    description: formData.description || null, // API expects null for empty
    group: formData.group as Task['group'], // TODO: Remove casting when API fixed
    order_by: formData.order_by,

    // Optional fields
    provider: formData.provider,
    uri: formData.uri,
    reward: formData.reward,
    visible: formData.visible,

    // Complex nested structures
    resources: formData.resources ? convertFormResourcesToApi(formData.resources) : null,
    child: formData.child ? formData.child.map(convertFormChildToApi) : undefined,
  };
}

/**
 * Convert form child to API child
 *
 * ISSUE: Hardcoded defaults due to incomplete child form model
 * - group: 'social' is hardcoded (should be configurable)
 * - description: null is assumed (child forms don't capture this)
 *
 * @param formChild - Child form values
 * @returns Complete Task object for API
 */
function convertFormChildToApi(formChild: ChildFormValues): Task {
  return {
    title: formChild.title,
    type: formChild.type as Task['type'], // TODO: Fix type compatibility
    description: null, // TODO: Add description field to child form if needed
    group: 'social' as Task['group'], // TODO: Make group configurable for children
    order_by: formChild.order_by,
    provider: formChild.provider,
    reward: formChild.reward,
    // Only include Twitter-specific resources for children
    resources: formChild.resources
      ? {
          tweetId: formChild.resources.tweetId,
          username: formChild.resources.username,
        }
      : null,
  };
}

/**
 * Convert form resources to API resources
 *
 * ISSUE: Returns untyped Record<string, unknown> due to API limitations
 * - API should accept properly typed Resources interface
 * - Currently loses type safety on return value
 *
 * @param formResources - Properly typed form resources
 * @returns Untyped object for API compatibility
 */
function convertFormResourcesToApi(formResources: FormResources): Record<string, unknown> {
  return {
    // Basic resource fields
    icon: formResources.icon,
    username: formResources.username,
    tweetId: formResources.tweetId,
    isNew: formResources.isNew,
    block_id: formResources.block_id,

    // UI configuration structure
    ui: formResources.ui
      ? {
          button: formResources.ui.button,
          'pop-up': formResources.ui['pop-up']
            ? {
                name: formResources.ui['pop-up'].name,
                button: formResources.ui['pop-up'].button,
                description: formResources.ui['pop-up'].description,
                static: formResources.ui['pop-up'].static,
                'additional-title': formResources.ui['pop-up']['additional-title'],
                'additional-description': formResources.ui['pop-up']['additional-description'],
              }
            : undefined,
        }
      : undefined,

    // Adsgram integration settings
    adsgram: formResources.adsgram
      ? {
          type: formResources.adsgram.type,
          subtype: formResources.adsgram.subtype,
        }
      : undefined,
  };
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
    visible: true,
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
  } as QuestFormValues;
}

/**
 * Validate form data and convert to API format
 *
 * TODO: Implement proper Zod validation here instead of type assertion
 * Currently assumes react-hook-form has already validated the data
 *
 * @param formData - Unknown data to validate and convert
 * @returns API-compatible task data
 */
export function validateAndConvertToApi(formData: unknown): Partial<Task> {
  // UNSAFE: Type assertion without validation
  // TODO: Add questFormSchema.parse(formData) validation
  return formToApi(formData as QuestFormValues);
}
