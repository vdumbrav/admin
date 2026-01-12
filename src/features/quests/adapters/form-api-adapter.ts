/**
 * Form ↔ API Adapter
 *
 * Strict validation: throws on invalid data instead of silent fallbacks.
 * No defensive programming — crash early with clear error messages.
 */
import type { CreateTaskDto, TaskResponseDto } from '@/lib/api/generated/model';
import { isSocialProvider } from '../constants';
import { buildQuestFormSchema } from '../types/form-schema';
import { type ChildFormValues, type QuestFormValues } from '../types/form-types';
import { getPopupNameForGroup } from '../types/resources-types';
import {
  formatValidationErrors,
  validateBlockingTaskDependencies,
  validatePresetCompatibility,
  validateRequiredFields,
} from '../validators/quest-validator';

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

function getRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string, got: ${typeof value}`);
  }
  return value;
}

function getRequiredNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number') {
    throw new Error(`${fieldName} must be a number, got: ${typeof value}`);
  }
  return value;
}

function getRequiredBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`${fieldName} must be a boolean, got: ${typeof value}`);
  }
  return value;
}

function validateRequiredBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`${fieldName} is required and must be a boolean, got: ${typeof value}`);
  }
  return value;
}

function validateOptionalString(value: unknown, fieldName: string): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} must be a string if provided, got: ${typeof value}`);
  }
  return value;
}

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

function validateAndExtractChildren(child: unknown): QuestFormValues['child'] {
  if (!child) {
    return []; // Empty array is valid for non-multiple types
  }

  if (!Array.isArray(child)) {
    throw new Error(`Children must be an array, got: ${typeof child}`);
  }

  return child.map(convertApiChildToForm);
}

/** Convert API response to form values. Throws on invalid data. */
export function apiToForm(apiData: Partial<TaskResponseDto>): QuestFormValues {
  // Validate required fields first
  validateRequiredApiData(apiData);

  const group = getRequiredString(apiData.group, 'group') as QuestFormValues['group'];
  const resources = validateAndExtractResources(apiData.resource);

  // Sync popup name with group (fix legacy data)
  if (resources?.ui?.['pop-up']?.name) {
    const expectedName = getPopupNameForGroup(group);
    if (resources.ui['pop-up'].name !== expectedName) {
      resources.ui['pop-up'].name = expectedName;
    }
  }

  // Reconstruct Tweet URL from username and tweetId if uri is missing
  const reconstructedUri =
    !apiData.uri && apiData.resource?.username && apiData.resource?.tweetId
      ? `https://x.com/${apiData.resource.username}/status/${apiData.resource.tweetId}`
      : validateOptionalString(apiData.uri, 'uri');

  return {
    // Core fields - ALL REQUIRED, NO FALLBACKS
    id: apiData.id, // Include ID for form (enables update detection)
    title: getRequiredString(apiData.title, 'title'),
    type: getRequiredString(apiData.type, 'type') as QuestFormValues['type'],
    description: getRequiredString(apiData.description, 'description'),
    group,
    order_by: getRequiredNumber(apiData.order_by, 'order_by'),

    // Optional fields (but validate if present)
    provider: apiData.provider,
    uri: reconstructedUri,
    reward: getRequiredNumber(apiData.reward, 'reward'),
    enabled: getRequiredBoolean(apiData.enabled, 'enabled'),
    web: getRequiredBoolean(apiData.web, 'web'),
    twa: getRequiredBoolean(apiData.twa, 'twa'),
    pinned: getRequiredBoolean(apiData.pinned, 'pinned'),
    preset: validateOptionalString(apiData.preset, 'preset'),
    parent_id: apiData.parent_id,
    // Normalize blocking_task: only include if it has valid id, otherwise undefined
    blocking_task:
      apiData.blocking_task && typeof apiData.blocking_task.id === 'number'
        ? apiData.blocking_task
        : undefined,
    icon: validateOptionalString(apiData.resource?.icon, 'icon'),

    // Resources - strict validation, no fallbacks
    resources,
    child: validateAndExtractChildren(apiData.child),

    // Schedule mapping for edit mode
    start: apiData.active_from,
    end: apiData.active_to,

    // Iterator mapping for 7-day challenge (API → Form)
    iterator: apiData.iterator ? validateAndExtractIterator(apiData.iterator) : undefined,

    // Repeatable mapping (API iterable → Form repeatable)
    repeatable: apiData.iterable ?? false,
  };
}

function validateAndExtractIterator(iterator: unknown): QuestFormValues['iterator'] {
  if (!iterator || typeof iterator !== 'object') {
    throw new Error('Iterator must be an object');
  }

  const iteratorObj = iterator as Record<string, unknown>;

  if (!Array.isArray(iteratorObj.reward_map)) {
    throw new Error('Iterator reward_map must be an array');
  }

  // API returns reward_map as either number[] or string[] depending on backend version
  const rewardMap = iteratorObj.reward_map as unknown[];
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

function isValidResourceData(data: unknown): data is Record<string, unknown> {
  return data !== null && typeof data === 'object';
}

/**
 * Extract tweetId, username, and static image from child task resources.
 * Static image extraction added to fix Task Images being lost on form load.
 */
function extractChildResources(resourceData: unknown): ChildFormValues['resources'] {
  if (!isValidResourceData(resourceData)) {
    return undefined;
  }

  const tweetId = typeof resourceData.tweetId === 'string' ? resourceData.tweetId : undefined;
  const username = typeof resourceData.username === 'string' ? resourceData.username : undefined;

  // Extract UI resources including static image (Task Image field)
  type ChildUIResources = NonNullable<ChildFormValues['resources']>['ui'];
  let uiResources: ChildUIResources = undefined;

  if (isValidResourceData(resourceData.ui)) {
    const popupData = resourceData.ui['pop-up'];
    if (isValidResourceData(popupData)) {
      const staticImage = typeof popupData.static === 'string' ? popupData.static : undefined;
      if (staticImage) {
        uiResources = {
          'pop-up': {
            static: staticImage,
          },
        };
      }
    }
  }

  // Return resources if any field is present
  if (tweetId || username || uiResources) {
    return {
      ...(tweetId && { tweetId }),
      ...(username && { username }),
      ...(uiResources && { ui: uiResources }),
    };
  }

  return undefined;
}

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

  // Reconstruct Tweet URL from username and tweetId if uri is missing (for child tasks)
  const childUri =
    !apiChild.uri && apiChild.resource?.username && apiChild.resource?.tweetId
      ? `https://x.com/${apiChild.resource.username}/status/${apiChild.resource.tweetId}`
      : apiChild.uri;

  const converted = {
    id: apiChild.id, // Include ID for update detection
    title: apiChild.title,
    description: apiChild.description,
    type: apiChild.type as ChildFormValues['type'],
    group: apiChild.group,
    provider: apiChild.provider,
    reward: apiChild.reward,
    order_by: apiChild.order_by,
    uri: childUri, // Restored Tweet URL
    resources: extractChildResources(apiChild.resource),
  };

  return converted;
}

/** Convert form values to API format. Auto-detects CREATE vs UPDATE by ID presence. */
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
    // blocking_task handling:
    // - For CREATE with provider (except connect type): blocking_task is REQUIRED
    // - For CREATE without provider: blocking_task is optional (can be null)
    // - For UPDATE: skip blocking_task (PATCH doesn't handle ORM references properly)
    ...(!isUpdate
      ? (() => {
          const isConnectType = formData.type === 'connect';
          const hasBlockingTask =
            formData.blocking_task?.id !== null &&
            formData.blocking_task?.id !== undefined &&
            typeof formData.blocking_task?.id === 'number';

          // Social providers (telegram, discord, twitter) require blocking_task (except connect type)
          if (isSocialProvider(formData.provider) && !isConnectType && !hasBlockingTask) {
            throw new Error(
              `Connect quest is required for ${formData.provider} provider. Please create a Connect ${formData.provider} quest first or select an existing one.`,
            );
          }

          return {
            blocking_task: hasBlockingTask ? formData.blocking_task : null,
          };
        })()
      : {}),
    ...(formData.parent_id && { parent_id: formData.parent_id }),

    // Merge icon back into resources (form stores it at top level for convenience)
    resource: {
      ...(formData.resources ?? {}),
      ...(formData.icon && { icon: formData.icon }),
    },

    // Child tasks are created separately via useCreateMultiTask/useUpdateMultiTask
    ...(formData.iterator?.reward_map &&
      formData.iterator.reward_map.length > 0 && {
        iterator: {
          day: 0,
          days: formData.iterator.days ?? 7,
          reward_map: formData.iterator.reward_map,
          iterator_reward: formData.iterator.reward_map,
          iterator_resource: {},
          reward: formData.iterator.reward_map[0] ?? 0,
          reward_max: Math.max(...formData.iterator.reward_map),
        },
      }),

    ...(formData.start && { active_from: new Date(formData.start).toISOString() }),
    ...(formData.end && { active_to: new Date(formData.end).toISOString() }),
  };

  return baseData as Omit<CreateTaskDto, 'parent_id'>;
}

export function getDefaultFormValues(): QuestFormValues {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  return {
    id: undefined,
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

    totalReward: undefined,
    uri: undefined,
    icon: undefined,
    provider: undefined,
    preset: undefined,
    parent_id: undefined,
    blocking_task: undefined,
    child: [],
    start: oneHourLater.toISOString(),
    end: undefined,
    iterator: undefined,
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

/** Validate with Zod + business rules, then convert to API format. */
export function validateAndConvertToApi(
  formData: unknown,
  presetId?: string,
  availableConnectQuests?: Array<{ id: number; provider: string }>,
): Omit<CreateTaskDto, 'parent_id'> {
  const schema = buildQuestFormSchema(presetId);
  const validatedData = schema.parse(formData) as QuestFormValues;

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

/** Returns 0 for empty arrays (form validation handles required children). */
function calculateTotalRewardFromChildren(children?: ChildFormValues[]): number {
  if (!children || children.length === 0) {
    return 0;
  }

  return children.reduce((total, child) => {
    if (typeof child.reward !== 'number') {
      throw new Error(`Child reward must be a number, got: ${typeof child.reward}`);
    }
    return total + child.reward;
  }, 0);
}
