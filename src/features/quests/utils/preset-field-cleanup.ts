/**
 * Utility for cleaning up incompatible fields when switching presets
 */
import type { PresetConfig } from '../presets/types';
import type { QuestFormValues } from '../types/form-types';

/**
 * Fields that should be cleared when switching between incompatible presets
 */
const PRESET_INCOMPATIBLE_FIELDS: Record<string, string[]> = {
  'action-with-post': ['iterator', 'uri'], // Clear daily rewards and main URI
  'seven-day-challenge': ['child', 'uri', 'provider'], // Clear children and URI
  connect: ['child', 'iterator', 'uri'], // Clear children and daily rewards
  join: ['child', 'iterator'], // Clear children and daily rewards
  explore: ['child', 'iterator', 'provider'], // Clear children and daily rewards
};

/**
 * Clean up incompatible fields when switching presets
 */
export function cleanupIncompatibleFields(
  currentValues: Partial<QuestFormValues>,
  newPresetConfig: PresetConfig | undefined,
  oldPresetConfig: PresetConfig | undefined,
): Partial<QuestFormValues> {
  // If no preset change, return as is
  if (!newPresetConfig || !oldPresetConfig || newPresetConfig.id === oldPresetConfig.id) {
    return currentValues;
  }

  const fieldsToClean = PRESET_INCOMPATIBLE_FIELDS[newPresetConfig.id] || [];
  const cleanedValues = { ...currentValues };

  // Clear incompatible fields
  fieldsToClean.forEach((fieldPath) => {
    if (fieldPath === 'child') {
      cleanedValues.child = [];
    } else if (fieldPath === 'iterator') {
      cleanedValues.iterator = undefined;
    } else if (fieldPath === 'uri') {
      cleanedValues.uri = '';
    } else if (fieldPath === 'provider') {
      // Only clear if new preset doesn't use provider
      if (newPresetConfig.fieldVisibility?.provider === 'hidden') {
        cleanedValues.provider = undefined;
      }
    }
  });

  return cleanedValues;
}

/**
 * Get fields that need to be reset to defaults for new preset
 */
export function getFieldsToReset(presetConfig: PresetConfig): Array<keyof QuestFormValues> {
  const fieldsToReset: Array<keyof QuestFormValues> = [];

  // Always reset type and group to preset defaults
  if (presetConfig.defaults?.type) {
    fieldsToReset.push('type');
  }
  if (presetConfig.defaults?.group) {
    fieldsToReset.push('group');
  }
  if (presetConfig.defaults?.provider) {
    fieldsToReset.push('provider');
  }

  return fieldsToReset;
}
