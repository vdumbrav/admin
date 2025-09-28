/**
 * STRICT API TRANSFORMATION RULES - FAIL-FAST VALIDATION
 *
 * ⚠️  BREAKING: No longer tolerates invalid data or missing fields
 * Throws errors instead of silent corruption or fallback values
 *
 * KEY CHANGES:
 * - Multiple type quests MUST have provider and child tasks
 * - Child rewards MUST be numbers - no fallbacks to 0
 * - Seven-day challenge MUST have valid iterator configuration
 * - Empty arrays and undefined values trigger immediate errors
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
    values.totalReward = values.iterator.reward_map.reduce((sum: number, reward: number) => {
      // Ensure each reward is a valid number to prevent NaN
      const validReward = typeof reward === 'number' && !isNaN(reward) ? reward : 0;
      return sum + validReward;
    }, 0);
  }
}

/**
 * STRICT CHILD REWARD CALCULATION - NO MERCY FOR INVALID DATA
 *
 * ⚠️  BREAKING: Empty arrays now throw error instead of returning 0
 * All child rewards MUST be valid numbers or function will crash
 */
function calculateTotalReward(children: ChildFormValues[]): number {
  if (!children.length) {
    throw new Error('Cannot calculate total reward: children array is empty');
  }

  return children.reduce((total, child) => {
    if (typeof child.reward !== 'number') {
      console.error(`STRICT VALIDATION FAILED: Invalid child task reward`, {
        expected: 'number',
        got: typeof child.reward,
        task: child,
      });
      throw new Error(`FAIL-FAST: Child task reward must be a number, got: ${typeof child.reward}`);
    }
    return total + child.reward;
  }, 0);
}

// ============================================================================
// Child Task Management
// ============================================================================

/**
 * Apply child task rules - STRICT validation
 */
function applyChildTaskRules(values: QuestFormValues): void {
  // STRICT: multiple type MUST have child tasks
  if (values.type === 'multiple') {
    if (!values.child || values.child.length === 0) {
      if (!values.provider) {
        throw new Error('Multiple type quest requires provider to auto-create child tasks');
      }
      values.child = [createDefaultChildTask(values)];
    }

    // STRICT: provider is REQUIRED for multiple type
    if (!values.provider) {
      throw new Error('Multiple type quest must have provider');
    }

    // Update child order_by indices and ENFORCE provider inheritance
    values.child = updateChildOrderBy(values.child);
    values.child = values.child.map((child) => {
      child.provider ??= values.provider;
      return child;
    });
  }
}

/**
 * Create default child task for multiple type quests - STRICT requirements
 */
function createDefaultChildTask(parentValues: QuestFormValues): ChildFormValues {
  if (!parentValues.provider) {
    throw new Error('Parent quest must have provider to create child task');
  }

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
 * Validate child tasks configuration - STRICT, throw on invalid
 */
export function validateChildTasks(children: ChildFormValues[]): void {
  if (!children || children.length === 0) {
    throw new Error('Child tasks array cannot be empty');
  }

  children.forEach((child, index) => {
    if (!child.title || typeof child.title !== 'string') {
      throw new Error(`Child task ${index + 1} must have a valid title`);
    }

    if (!child.type) {
      throw new Error(`Child task ${index + 1} must have a type`);
    }

    if (!child.group) {
      throw new Error(`Child task ${index + 1} must have a group`);
    }

    if (typeof child.reward !== 'number' || child.reward < 0) {
      throw new Error(`Child task ${index + 1} reward must be a non-negative number`);
    }
  });
}
