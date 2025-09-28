/**
 * API transformation business rules
 * Handles data calculation, field population, and API-specific logic
 */
import type { PresetConfig } from '../presets/types';
import type { ChildFormValues, QuestFormValues } from '../types/form-types';

// ============================================================================
// API Transformation Rules
// ============================================================================

/**
 * Apply API transformation rules to form values before sending to backend
 */
export function applyAPITransformRules(
  values: QuestFormValues,
  presetConfig?: PresetConfig,
  findConnectQuestByProvider?: (provider: string) => number | null,
): QuestFormValues {
  const updatedValues = { ...values };

  // Calculate rewards
  applyRewardCalculations(updatedValues);

  // Apply child task management
  applyChildTaskRules(updatedValues);

  // Auto-select blocking_task for quests that need Connect gate
  applyConnectGateRules(updatedValues, findConnectQuestByProvider);

  // Apply preset-specific API rules
  if (presetConfig) {
    applyPresetAPIRules(updatedValues, presetConfig);
  }

  return updatedValues;
}

// ============================================================================
// Reward Calculations
// ============================================================================

/**
 * Apply reward calculation rules
 */
function applyRewardCalculations(values: QuestFormValues): void {
  // Calculate total reward for multi-task quests
  if (values.child && values.child.length > 0) {
    const calculatedTotal = calculateTotalReward(values.child);
    values.totalReward = calculatedTotal;

    // For multiple type quests, ensure reward field matches totalReward
    if (values.type === 'multiple') {
      values.reward = calculatedTotal;
    }
  } else if (values.type === 'multiple') {
    // Reset totalReward if no child tasks
    values.totalReward = 0;
    values.reward = 0;
  }

  // Calculate total reward for 7-day challenge
  // iterator is only for seven-day-challenge preset, other presets may have undefined
  if (values.iterator?.reward_map && Array.isArray(values.iterator.reward_map)) {
    values.totalReward = values.iterator.reward_map.reduce(
      (sum: number, reward: number) => sum + reward,
      0,
    );
  }
}

/**
 * Calculate total reward from child tasks
 */
function calculateTotalReward(children: ChildFormValues[]): number {
  if (!children.length) {
    return 0;
  }

  return children.reduce((total, child) => {
    const reward = typeof child.reward === 'number' ? child.reward : 0;
    return total + reward;
  }, 0);
}

// ============================================================================
// Child Task Management
// ============================================================================

/**
 * Apply child task rules
 */
function applyChildTaskRules(values: QuestFormValues): void {
  // Auto-create first child task for multiple type quests
  if (values.type === 'multiple' && (!values.child || values.child.length === 0)) {
    values.child = [createDefaultChildTask(values)];
  }

  // Update child order_by indices and ensure provider inheritance
  if (values.child) {
    values.child = updateChildOrderBy(values.child);

    // For multiple type, ensure all child tasks inherit provider from parent
    if (values.type === 'multiple' && values.provider) {
      values.child = values.child.map((child) => ({
        ...child,
        provider: child.provider ?? values.provider,
      }));
    }
  }
}

/**
 * Create default child task for multiple type quests
 */
function createDefaultChildTask(parentValues: QuestFormValues): ChildFormValues {
  return {
    title: '',
    description: '',
    type: 'like',
    group: 'social',
    order_by: 0,
    reward: 0,
    provider: parentValues.provider, // Inherit provider from parent
    resources: {
      username: '',
      tweetId: '',
      ui: {
        'pop-up': {
          static: '',
        },
      },
    },
  };
}

/**
 * Update order_by indices for child tasks (0-based sequential)
 */
function updateChildOrderBy(children: ChildFormValues[]): ChildFormValues[] {
  return children.map((child, index) => ({
    ...child,
    order_by: index,
  }));
}

// ============================================================================
// Connect Gate Rules
// ============================================================================

/**
 * Apply connect gate rules for automatic blocking_task assignment
 */
function applyConnectGateRules(
  values: QuestFormValues,
  findConnectQuestByProvider?: (provider: string) => number | null,
): void {
  if (
    values.provider &&
    values.type !== 'connect' &&
    !values.blocking_task &&
    findConnectQuestByProvider
  ) {
    const connectQuestId = findConnectQuestByProvider(values.provider);
    if (connectQuestId) {
      values.blocking_task = { id: connectQuestId };
    }
  }
}

// ============================================================================
// Preset-Specific API Rules
// ============================================================================

/**
 * Apply preset-specific API transformation rules
 */
function applyPresetAPIRules(values: QuestFormValues, presetConfig: PresetConfig): void {
  switch (presetConfig.id) {
    case 'action-with-post':
      applyActionWithPostAPIRules(values);
      break;
    case 'seven-day-challenge':
      applySevenDayChallengeAPIRules(values);
      break;
    // Note: 'multiple' is not a preset ID, it's handled by type-specific logic
    // case 'multiple':
    //   applyMultipleTypeAPIRules(values);
    //   break;
    case 'connect':
    case 'join':
    case 'explore':
      // These presets don't require specific API transformation rules
      break;
    default:
      // Unknown preset, no specific rules to apply
      break;
  }
}

/**
 * Apply API rules for action-with-post preset
 */
function applyActionWithPostAPIRules(values: QuestFormValues): void {
  // Ensure type is multiple
  values.type = 'multiple';

  // Ensure provider is twitter
  values.provider = 'twitter';

  // Ensure group is social unless explicitly set to partner
  if (values.group !== 'partner') {
    values.group = 'social';
  }

  // Validate URI format for Twitter
  if (values.uri && !isTwitterUrl(values.uri)) {
    console.warn('action-with-post preset expects Twitter URL');
  }
}

/**
 * Apply API rules for seven-day challenge preset
 */
function applySevenDayChallengeAPIRules(values: QuestFormValues): void {
  // Ensure type is repeatable
  values.type = 'repeatable';

  // Ensure iterator configuration exists
  values.iterator ??= {
    days: 7,
    reward_map: [10, 20, 30, 40, 50, 75, 100],
  };

  // Validate reward map
  if (values.iterator.reward_map) {
    // Ensure days field matches reward_map length
    values.iterator.days = values.iterator.reward_map.length;

    // Validate range
    if (values.iterator.reward_map.length < 3 || values.iterator.reward_map.length > 10) {
      console.warn('Seven day challenge should have 3-10 days');
    }
  }
}

/**
 * Apply API rules for multiple type quests
 * TODO: This function is currently unused but may be needed for future multiple type handling
 */
// function applyMultipleTypeAPIRules(values: QuestFormValues): void {
//   // Ensure at least one child task exists
//   if (!values.child || values.child.length === 0) {
//     values.child = [createDefaultChildTask(values)];
//   }

//   // Validate all child tasks have required fields
//   values.child = values.child.map((child) => ({
//     ...child,
//     // Ensure required fields have defaults
//     title: child.title ?? '',
//     type: child.type ?? 'like',
//     group: child.group ?? 'social',
//     reward: typeof child.reward === 'number' ? child.reward : 0,
//     provider: child.provider ?? values.provider,
//   }));
// }

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Check if URL is a valid Twitter URL
 */
function isTwitterUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname.includes('twitter.com') || parsedUrl.hostname.includes('x.com');
  } catch {
    return false;
  }
}

/**
 * Validate iterator configuration
 */
export function validateIteratorConfig(iterator: QuestFormValues['iterator']): boolean {
  if (!iterator) return false;

  if (!iterator.reward_map || !Array.isArray(iterator.reward_map)) return false;

  if (iterator.reward_map.length < 3 || iterator.reward_map.length > 10) return false;

  return iterator.reward_map.every((reward) => typeof reward === 'number' && reward >= 0);
}

/**
 * Validate child tasks configuration
 */
export function validateChildTasks(children: ChildFormValues[]): boolean {
  if (!children || children.length === 0) return false;

  return children.every(
    (child) =>
      child.title &&
      child.type &&
      child.group &&
      typeof child.reward === 'number' &&
      child.reward >= 0,
  );
}
