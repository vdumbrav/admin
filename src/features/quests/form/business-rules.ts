/**
 * Business Rules for Quest Form
 * Orchestrates UI rules and API transformation rules
 */
import { deepMerge } from '@/utils';
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
  const mergedValues = deepMerge(defaultValues, presetDefaults as Partial<QuestFormValues>);

  // Auto-set preset ID from preset config
  if (presetConfig?.id && typeof presetConfig.id === 'string') {
    mergedValues.preset ??= presetConfig.id;
  }

  // Apply UI rules to ensure proper resource structure from the start
  const valuesWithUIRules = applyUIRules(mergedValues, presetConfig);

  return valuesWithUIRules;
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
): QuestFormValues {
  let updatedValues = { ...values };

  // Apply UI-specific rules (button text, popup content, etc.)
  updatedValues = applyUIRules(updatedValues, presetConfig);

  // Apply API transformation rules (calculations, field population, etc.)
  updatedValues = applyAPITransformRules(updatedValues, presetConfig);

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

