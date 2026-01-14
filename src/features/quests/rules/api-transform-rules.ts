/**
 * API Transformation Rules
 *
 * Strict validation: throws on invalid data instead of silent fallbacks.
 */
import type { PresetConfig } from '../presets/types';
import type { ChildFormValues, QuestFormValues } from '../types/form-types';

/** Apply transformations before sending to backend (reward calc, child task rules). */
export function applyAPITransformRules(
  values: QuestFormValues,
  presetConfig?: PresetConfig,
): QuestFormValues {
  const updatedValues = { ...values };

  // Calculate rewards
  applyRewardCalculations(updatedValues);

  // Apply child task management
  applyChildTaskRules(updatedValues);

  // Apply preset-specific API rules
  if (presetConfig) {
    applyPresetAPIRules(updatedValues, presetConfig);
  }

  return updatedValues;
}

function applyRewardCalculations(values: QuestFormValues): void {
  if (values.child && values.child.length > 0) {
    const calculatedTotal = calculateTotalReward(values.child);
    values.totalReward = calculatedTotal;
    if (values.type === 'multiple') {
      values.reward = calculatedTotal;
    }
  } else if (values.type === 'multiple') {
    values.totalReward = 0;
    values.reward = 0;
  }

  if (values.iterator?.reward_map && Array.isArray(values.iterator.reward_map)) {
    values.totalReward = values.iterator.reward_map.reduce((sum: number, reward: number) => {
      const validReward = typeof reward === 'number' && !isNaN(reward) ? reward : 0;
      return sum + validReward;
    }, 0);
  }
}

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

function applyChildTaskRules(values: QuestFormValues): void {
  if (values.type === 'multiple') {
    if (!values.child || values.child.length === 0) {
      if (!values.provider) {
        throw new Error('Multiple type quest requires provider to auto-create child tasks');
      }
      values.child = [createDefaultChildTask(values)];
    }

    if (!values.provider) {
      throw new Error('Multiple type quest must have provider');
    }

    // Ensure sequential order_by and inherit provider from parent
    values.child = updateChildOrderBy(values.child);
    values.child = values.child.map((child) => {
      child.provider ??= values.provider;
      return child;
    });
  }
}

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
    provider: parentValues.provider,
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

function updateChildOrderBy(children: ChildFormValues[]): ChildFormValues[] {
  return children.map((child, index) => ({
    ...child,
    order_by: index,
  }));
}

function applyPresetAPIRules(values: QuestFormValues, presetConfig: PresetConfig): void {
  switch (presetConfig.id) {
    case 'action-with-post':
      applyActionWithPostAPIRules(values);
      break;
    case 'seven-day-challenge':
      applySevenDayChallengeAPIRules(values);
      break;
    case 'connect':
    case 'join':
    case 'explore':
      break;
  }
}

function applyActionWithPostAPIRules(values: QuestFormValues): void {
  values.type = 'multiple';
  values.provider = 'twitter';
  if (values.group !== 'partner') {
    values.group = 'social';
  }

  if (values.uri && !isTwitterUrl(values.uri)) {
    console.warn('action-with-post preset expects Twitter URL');
  }
}

function applySevenDayChallengeAPIRules(values: QuestFormValues): void {
  values.iterator ??= {
    days: 7,
    reward_map: [10, 20, 30, 40, 50, 75, 100],
  };

  if (values.iterator.reward_map) {
    values.iterator.days = values.iterator.reward_map.length;
    if (values.iterator.reward_map.length < 3 || values.iterator.reward_map.length > 10) {
      console.warn('Seven day challenge should have 3-10 days');
    }
  }
}

function isTwitterUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname.includes('twitter.com') || parsedUrl.hostname.includes('x.com');
  } catch {
    return false;
  }
}

export function validateIteratorConfig(iterator: QuestFormValues['iterator']): boolean {
  if (!iterator) return false;

  if (!iterator.reward_map || !Array.isArray(iterator.reward_map)) return false;

  if (iterator.reward_map.length < 3 || iterator.reward_map.length > 10) return false;

  return iterator.reward_map.every((reward) => typeof reward === 'number' && reward >= 0);
}

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
