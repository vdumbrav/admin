/**
 * UI-specific business rules
 * Handles UI element generation, button text, popup content, etc.
 */
import type { PresetConfig } from '../presets/types';
import type { QuestFormValues } from '../types/form-types';
import { getPopupNameForGroup, ResourcePresets, toApiResources } from '../types/resources-types';

// ============================================================================
// UI Rules Application
// ============================================================================

/**
 * Apply UI-specific business rules to form values
 */
export function applyUIRules(
  values: QuestFormValues,
  presetConfig?: PresetConfig,
): QuestFormValues {
  const updatedValues = { ...values };

  // Apply preset-specific UI rules
  if (presetConfig) {
    switch (presetConfig.id) {
      case 'action-with-post':
        applyActionWithPostUIRules(updatedValues);
        break;
      case 'connect':
        applyConnectUIRules(updatedValues);
        break;
      case 'join':
        applyJoinUIRules(updatedValues);
        break;
      case 'explore':
        applyExploreUIRules(updatedValues);
        break;
      case 'seven-day-challenge':
        applySevenDayChallengeUIRules(updatedValues);
        break;
      default:
        // Unknown preset, use generic rules only
        break;
    }
  }

  // Apply generic UI rules
  applyGenericUIRules(updatedValues);

  return updatedValues;
}

// ============================================================================
// Preset-Specific UI Rules
// ============================================================================

/**
 * Apply UI rules for action-with-post preset
 */
function applyActionWithPostUIRules(values: QuestFormValues): void {
  if (!values.resources) {
    values.resources = toApiResources(
      ResourcePresets.actionWithPost({
        username: '',
        group: values.group,
      }),
    );
    return;
  }

  // Auto-generate button text based on tasks
  if (values.child && values.child.length > 0) {
    const buttonText = generateTaskButtonText(values.child);
    if (buttonText && values.resources.ui) {
      values.resources.ui.button = buttonText;
      if (values.resources.ui['pop-up']) {
        values.resources.ui['pop-up'].button = buttonText;
      }
    }
  }

  // Update popup description for partner quests
  if (values.group === 'partner' && values.resources.ui?.['pop-up']) {
    values.resources.ui['pop-up'].description = "Engage with our partner's Tweet to earn XP";
    values.resources.ui['pop-up'].name = 'Partner Quests';
  }
}

/**
 * Apply UI rules for connect preset
 */
function applyConnectUIRules(values: QuestFormValues): void {
  if (!values.provider) return;

  // Create proper resources from ResourcePresets (overwrite defaults)
  values.resources = toApiResources(ResourcePresets.connect(values.provider, values.group));

  // Auto-generate popup description based on provider
  const descriptionMapping: Record<string, string> = {
    telegram: 'Connect your Telegram account to earn XP',
    discord: 'Connect your Discord account to earn XP',
    twitter: 'Connect your X account to earn XP',
  };

  const description = descriptionMapping[values.provider];
  if (description && values.resources.ui?.['pop-up']) {
    values.resources.ui['pop-up'].description = description;
  }

  // Auto-update button text for Matrix provider
  if (values.provider === 'matrix') {
    if (values.resources.ui) {
      values.resources.ui.button = 'Add';
      if (values.resources.ui['pop-up']) {
        values.resources.ui['pop-up'].button = 'Add';
      }
    }
  }
}

/**
 * Apply UI rules for join preset
 */
function applyJoinUIRules(values: QuestFormValues): void {
  if (!values.provider) return;

  // Auto-update button text for Twitter provider
  if (values.provider === 'twitter') {
    if (!values.resources) {
      values.resources = toApiResources(ResourcePresets.join(values.provider, values.group));
    } else if (values.resources.ui) {
      values.resources.ui.button = 'Follow';
      if (values.resources.ui['pop-up']) {
        values.resources.ui['pop-up'].button = 'Follow';
        values.resources.ui['pop-up']['additional-title'] = 'Connect your X';
        values.resources.ui['pop-up']['additional-description'] =
          'Before starting the quest, ensure you connected X account';
      }
    }
  }
}

/**
 * Apply UI rules for explore preset
 */
function applyExploreUIRules(values: QuestFormValues): void {
  values.resources ??= toApiResources(
    ResourcePresets.explore({
      buttonText: 'Visit',
      popupDescription: 'Visit the link to complete this quest',
    }),
  );
}

// ============================================================================
// Generic UI Rules
// ============================================================================

/**
 * Apply UI rules for seven-day-challenge preset
 */
function applySevenDayChallengeUIRules(values: QuestFormValues): void {
  // Ensure resources exist with Daily Quests popup name
  values.resources ??= {
    ui: {
      button: 'Boost XP',
      'pop-up': {
        name: 'Daily Quests',
        button: 'Boost XP',
        description: '',
      },
    },
  };
}

/**
 * Apply generic UI rules that work across all presets
 */
function applyGenericUIRules(values: QuestFormValues): void {
  // Auto-generate popup name based on group
  if (!values.resources?.ui?.['pop-up']?.name) {
    const popupName = getPopupNameForGroup(values.group);
    if (popupName) {
      ensureResourcesStructure(values);
      if (values.resources?.ui?.['pop-up']) {
        values.resources.ui['pop-up'].name = popupName;
      }
    }
  }

  // Auto-fill Connect gate additional fields for social providers
  if (values.provider && (values.type === 'join' || values.type === 'multiple')) {
    const additionalTitle = PROVIDER_ADDITIONAL_TITLES[values.provider];
    if (additionalTitle) {
      ensureResourcesStructure(values);
      if (values.resources?.ui?.['pop-up']) {
        values.resources.ui['pop-up']['additional-title'] = additionalTitle;
        values.resources.ui['pop-up']['additional-description'] = CONNECT_GATE_DESCRIPTION.replace(
          'X account',
          `${values.provider === 'twitter' ? 'X' : values.provider} account`,
        );
      }
    }
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get default button text based on task type
 */
export function getDefaultButtonText(type: string): string {
  return TASK_BUTTON_MAPPING[type] ?? 'Complete';
}

/**
 * Generate button text based on child tasks
 */
function generateTaskButtonText(children: QuestFormValues['child']): string | null {
  if (!children || children.length === 0) return null;

  if (children.length === 1) {
    const taskType = children[0].type;
    return TASK_BUTTON_MAPPING[taskType] ?? 'Engage';
  }

  return 'Complete Tasks';
}

/**
 * Ensure resources structure exists with proper defaults
 */
function ensureResourcesStructure(values: QuestFormValues): void {
  values.resources ??= {
    ui: {
      button: 'Continue',
      'pop-up': {
        name: '',
        description: '',
        button: 'Continue',
      },
    },
  };

  values.resources.ui ??= {
    button: 'Continue',
    'pop-up': {
      name: '',
      description: '',
      button: 'Continue',
    },
  };

  values.resources.ui['pop-up'] ??= {
    name: '',
    description: '',
    button: values.resources.ui.button ?? 'Continue',
  };
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Mapping of child task types to button text
 */
export const TASK_BUTTON_MAPPING: Record<string, string> = {
  like: 'Like Tweet',
  comment: 'Comment on Tweet',
  share: 'Share Tweet',
  connect: 'Follow & Engage',
  join: 'Join',
};

/**
 * Provider-specific additional-title messages for Connect gate
 */
const PROVIDER_ADDITIONAL_TITLES: Record<string, string> = {
  twitter: 'Connect your X',
  discord: 'Connect your Discord',
  telegram: 'Connect your Telegram',
};

/**
 * Standard additional-description for Connect gate
 */
const CONNECT_GATE_DESCRIPTION = 'Before starting the quest, ensure you connected X account';
