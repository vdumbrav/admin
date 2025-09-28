/**
 * Business Rules for Quest Form
 * Orchestrates UI rules and API transformation rules
 */
import { deepMerge, getConnectGateMessage, isSocialDomain } from '@/utils';
import { getDefaultFormValues } from '../adapters/form-api-adapter';
import type { PresetConfig } from '../presets/types';
import { applyAPITransformRules } from '../rules/api-transform-rules';
import { applyUIRules } from '../rules/ui-rules';
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
  const mergedValues = deepMerge(defaultValues, presetDefaults);

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
 * Apply business rules to form values (orchestrates UI and API transformation rules)
 */
export function applyBusinessRules(
  values: QuestFormValues,
  presetConfig?: PresetConfig,
  findConnectQuestByProvider?: (provider: string) => number | null,
): QuestFormValues {
  let updatedValues = { ...values };

  // Apply UI-specific rules (button text, popup content, etc.)
  updatedValues = applyUIRules(updatedValues, presetConfig);

  // Apply API transformation rules (calculations, field population, etc.)
  updatedValues = applyAPITransformRules(updatedValues, presetConfig, findConnectQuestByProvider);

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
