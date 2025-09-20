/**
 * Field State Management for Quest Form
 * Handles field visibility, disabled state, and readonly behavior based on preset configuration
 */
import type { PresetConfig } from '../presets/types';
import type { QuestFormValues } from '../types/form-types';

// ============================================================================
// Types
// ============================================================================

export interface FieldState {
  visible: boolean;
  disabled: boolean;
  readonly: boolean;
  tooltip?: string;
}

export type FieldStatesMatrix = Record<string, FieldState>;

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_FIELD_STATE: FieldState = {
  visible: true,
  disabled: false,
  readonly: false,
};

// ============================================================================
// Core Field State Logic
// ============================================================================

/**
 * Compute field visibility state based on preset configuration and current form values
 */
export function computeFieldStates(
  presetConfig?: PresetConfig,
  currentValues?: Partial<QuestFormValues>,
): FieldStatesMatrix {
  if (!presetConfig?.fieldVisibility) {
    // No preset - all fields are visible and editable
    return {};
  }

  const matrix: FieldStatesMatrix = {};
  const { fieldVisibility } = presetConfig;

  for (const [fieldName, visibility] of Object.entries(fieldVisibility)) {
    const state: FieldState = { ...DEFAULT_FIELD_STATE };

    switch (visibility) {
      case 'hidden':
        state.visible = false;
        break;

      case 'readonly':
        state.visible = true;
        state.disabled = false;
        state.readonly = true;
        state.tooltip = 'Managed by preset';
        break;

      case 'conditional':
        // Handle conditional visibility based on current form values
        Object.assign(state, evaluateConditionalVisibility(fieldName, currentValues, presetConfig));
        break;

      case 'visible':
      default:
        // Keep default state - visible and editable
        break;
    }

    matrix[fieldName] = state;
  }

  return matrix;
}

/**
 * Get field state for a specific field
 */
export function getFieldState(fieldName: string, matrix: FieldStatesMatrix): FieldState {
  return matrix[fieldName] ?? DEFAULT_FIELD_STATE;
}

/**
 * Check if field is visible in the current state matrix
 */
export function isFieldVisible(fieldName: string, matrix: FieldStatesMatrix): boolean {
  return getFieldState(fieldName, matrix).visible;
}

/**
 * Check if field is disabled in the current state matrix
 */
export function isFieldDisabled(fieldName: string, matrix: FieldStatesMatrix): boolean {
  return getFieldState(fieldName, matrix).disabled;
}

/**
 * Check if field is readonly in the current state matrix
 */
export function isFieldReadonly(fieldName: string, matrix: FieldStatesMatrix): boolean {
  return getFieldState(fieldName, matrix).readonly;
}

// ============================================================================
// Conditional Visibility Logic
// ============================================================================

/**
 * Evaluate conditional field visibility based on form values
 */
function evaluateConditionalVisibility(
  fieldName: string,
  currentValues?: Partial<QuestFormValues>,
  presetConfig?: PresetConfig,
): Partial<FieldState> {
  const state: Partial<FieldState> = {};

  // Partner group shows icon upload for Join and Action with Post
  if (fieldName === 'partnerIcon') {
    const isPartnerGroup = currentValues?.group === 'partner';
    state.visible = isPartnerGroup;
  }

  // Icon field is always visible for Explore preset
  if (fieldName === 'icon' && presetConfig?.id === 'explore') {
    state.visible = true;
  }

  return state;
}
