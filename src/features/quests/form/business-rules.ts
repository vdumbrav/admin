/**
 * Business Rules for Quest Form
 * Handles calculations, validations, and automatic field population
 */
import { deepMerge, getConnectGateMessage, isSocialDomain } from '@/utils';
import { getDefaultFormValues } from '../adapters/form-api-adapter';
import type { PresetConfig } from '../presets/types';
import type { ChildFormValues, QuestFormValues } from '../types/form-types';

// ============================================================================
// Form Values & Defaults
// ============================================================================

/**
 * Create default form values with preset configuration
 */
export function getPresetFormValues(presetConfig?: PresetConfig): QuestFormValues {
  const defaultValues = getDefaultFormValues();

  if (!presetConfig) {
    return defaultValues;
  }

  // Start with defaults from preset config
  const presetDefaults = presetConfig.defaults;

  // Deep merge preset defaults with form defaults
  const mergedValues = deepMerge(
    defaultValues as Record<string, unknown>,
    presetDefaults as Partial<Record<string, unknown>>,
  ) as QuestFormValues;

  // Add start time only if not already set
  if (!mergedValues.start) {
    const now = new Date();
    const startTime = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour
    mergedValues.start = startTime.toISOString();
  }

  // Auto-set preset ID from preset config
  if (presetConfig?.id && typeof presetConfig.id === 'string') {
    mergedValues.preset ??= presetConfig.id;
  }

  return mergedValues;
}

/**
 * Apply default fields from preset configuration to final values
 */
export function applyLockedFields(
  values: QuestFormValues,
  _presetConfig?: PresetConfig,
): QuestFormValues {
  // No longer applying locked fields, just return values as-is
  return values;
}

// ============================================================================
// Business Logic & Calculations
// ============================================================================

/**
 * Apply business rules to form values (auto-calculations, field population)
 */
export function applyBusinessRules(
  values: QuestFormValues,
  presetConfig?: PresetConfig,
  _findConnectQuestByProvider?: (provider: string) => number | null,
): QuestFormValues {
  const updatedValues = { ...values };

  // Auto-generate pop-up name based on group
  if (!updatedValues.resources?.ui?.['pop-up']?.name) {
    const popupName = getPopupNameByGroup(updatedValues.group);
    if (popupName) {
      updatedValues.resources = {
        ...updatedValues.resources,
        ui: {
          button: updatedValues.resources?.ui?.button ?? 'Continue',
          ...updatedValues.resources?.ui,
          'pop-up': {
            ...updatedValues.resources?.ui?.['pop-up'],
            name: popupName,
            button: updatedValues.resources?.ui?.['pop-up']?.button ?? 'Continue',
            description: updatedValues.resources?.ui?.['pop-up']?.description ?? '',
          },
        },
      };
    }
  }

  // Auto-update button text for Connect preset with Matrix provider
  if (presetConfig?.id === 'connect' && updatedValues.provider === 'matrix') {
    updatedValues.resources = {
      ...updatedValues.resources,
      ui: {
        ...updatedValues.resources?.ui,
        button: 'Add',
        'pop-up': {
          name: updatedValues.resources?.ui?.['pop-up']?.name ?? 'Social Quests',
          description: updatedValues.resources?.ui?.['pop-up']?.description ?? '',
          ...updatedValues.resources?.ui?.['pop-up'],
          button: 'Add',
        },
      },
    };
  }

  // Auto-update button text for Join preset with Twitter provider
  if (presetConfig?.id === 'join' && updatedValues.provider === 'twitter') {
    updatedValues.resources = {
      ...updatedValues.resources,
      ui: {
        ...updatedValues.resources?.ui,
        button: 'Follow',
        'pop-up': {
          name: updatedValues.resources?.ui?.['pop-up']?.name ?? 'Social Quests',
          description: updatedValues.resources?.ui?.['pop-up']?.description ?? '',
          ...updatedValues.resources?.ui?.['pop-up'],
          button: 'Follow',
        },
      },
    };
  }

  // Auto-fill Connect gate additional fields for Join and Action with Post
  if (
    (presetConfig?.id === 'join' || presetConfig?.id === 'action-with-post') &&
    updatedValues.provider
  ) {
    const additionalTitle = PROVIDER_ADDITIONAL_TITLES[updatedValues.provider];
    if (additionalTitle) {
      updatedValues.resources = {
        ...updatedValues.resources,
        ui: {
          button: updatedValues.resources?.ui?.button ?? 'Join',
          ...updatedValues.resources?.ui,
          'pop-up': {
            name: updatedValues.resources?.ui?.['pop-up']?.name ?? 'Social Quests',
            button: updatedValues.resources?.ui?.['pop-up']?.button ?? 'Join',
            description: updatedValues.resources?.ui?.['pop-up']?.description ?? '',
            ...updatedValues.resources?.ui?.['pop-up'],
            'additional-title': additionalTitle,
            'additional-description': CONNECT_GATE_DESCRIPTION.replace(
              'X account',
              `${updatedValues.provider === 'twitter' ? 'X' : updatedValues.provider} account`,
            ),
          },
        },
      };
    }
  }

  // Calculate total reward for multi-task quests
  if (updatedValues.child && updatedValues.child.length > 0) {
    updatedValues.totalReward = calculateTotalReward(updatedValues.child);
  }

  // Calculate total reward for 7-day challenge
  // iterator только для seven-day-challenge пресета, у других пресетов может быть undefined
  if (updatedValues.iterator?.reward_map && Array.isArray(updatedValues.iterator.reward_map)) {
    updatedValues.totalReward = updatedValues.iterator.reward_map.reduce(
      (sum: number, reward: number) => sum + reward,
      0,
    );
  }

  // Auto-select block_id for quests that need Connect gate
  if (
    updatedValues.provider &&
    updatedValues.type !== 'connect' &&
    !updatedValues.block_id &&
    _findConnectQuestByProvider
  ) {
    const connectQuestId = _findConnectQuestByProvider(updatedValues.provider);
    if (connectQuestId) {
      updatedValues.block_id = connectQuestId;
    }
  }

  // Update child order_by indices
  if (updatedValues.child) {
    updatedValues.child = updateChildOrderBy(updatedValues.child);
  }

  return updatedValues;
}

/**
 * Calculate total reward from child tasks
 */
export function calculateTotalReward(children: ChildFormValues[]): number {
  if (!children.length) {
    return 0;
  }

  return children.reduce((total, child) => {
    const reward = typeof child.reward === 'number' ? child.reward : 0;
    return total + reward;
  }, 0);
}

/**
 * Update order_by indices for child tasks (0-based sequential)
 */
export function updateChildOrderBy(children: ChildFormValues[]): ChildFormValues[] {
  return children.map((child, index) => ({
    ...child,
    order_by: index,
  }));
}

// ============================================================================
// Connect Gate Validation
// ============================================================================

/**
 * Get connect-gate warnings for the current quest configuration
 */
export function getConnectGateWarnings(
  presetConfig?: PresetConfig,
  provider?: string,
  uri?: string,
): string[] {
  if (!presetConfig) return [];

  const warnings: string[] = [];
  const connectGateRules = presetConfig.connectGateRules;

  if (!connectGateRules) return warnings;

  // Check domain-based connect gate for Explore preset
  if (connectGateRules.conditional && uri) {
    if (isSocialDomain(uri)) {
      const message = getConnectGateMessage(uri);
      if (message) {
        warnings.push(message);
      }
    }
  }

  // Check provider-based connect gate for Join and Action with Post
  if (connectGateRules.required && provider) {
    const message = PROVIDER_CONNECT_MESSAGES[provider];
    if (message) {
      warnings.push(message);
    }
  }

  return warnings;
}

// Helper: detect social platform link for Explore preset
export function getExploreDomainWarning(uri?: string): string | null {
  if (!uri) return null;
  if (!isSocialDomain(uri)) return null;
  return 'This link looks like a social platform. Consider using a Connect or Join quest instead.';
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Mapping of quest groups to popup names
 * Centralized for easy product copy updates
 */
const GROUP_POPUP_NAMES: Record<string, string> = {
  social: 'Social Quests',
  daily: 'Daily Quests',
  partner: 'Partner Quests',
  referral: 'Referral Quests',
};

/**
 * Provider-specific connect-gate warning messages
 */
const PROVIDER_CONNECT_MESSAGES: Record<string, string> = {
  twitter: 'Requires Connect Twitter quest',
  discord: 'Requires Connect Discord quest',
  telegram: 'Requires Connect Telegram quest',
  matrix: 'Requires Connect Matrix quest',
  walme: 'Requires Connect Internal quest',
  monetag: 'Requires Connect Monetag quest',
  adsgram: 'Requires Connect Adsgram quest',
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

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get popup name based on quest group
 */
function getPopupNameByGroup(group: string): string | null {
  return GROUP_POPUP_NAMES[group];
}
