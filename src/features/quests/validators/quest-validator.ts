/**
 * STRICT QUEST VALIDATION - ZERO TOLERANCE FOR INVALID DATA
 *
 * ⚠️  BREAKING: Enhanced validation that rejects previously "acceptable" data
 *
 * KEY CHANGES:
 * - Strict type checking for all fields (title, reward, etc.)
 * - No silent fallbacks - explicit errors for invalid types
 * - Enhanced error messages with actual vs expected types
 * - Fails fast on any validation issue
 */
import { ValidationErrorFactory, type ValidationFieldError } from '../errors/validation-errors';
import type { QuestFormValues } from '../types/form-types';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationFieldError[];
}

/**
 * Validate required fields based on quest type
 */
export function validateRequiredFields(formData: QuestFormValues): ValidationResult {
  const errors: ValidationFieldError[] = [];

  // Core required fields for all types with strict validation
  if (typeof formData.title !== 'string' || !formData.title.trim()) {
    errors.push(
      ValidationErrorFactory.required(
        'title',
        'Quest title is required and must be a non-empty string',
      ),
    );
  }

  if (!formData.type) {
    errors.push(ValidationErrorFactory.required('type', 'Quest type is required'));
  }

  if (!formData.group) {
    errors.push(ValidationErrorFactory.required('group', 'Quest group is required'));
  }

  // Validate reward is a valid number
  if (typeof formData.reward !== 'number' || formData.reward < 0) {
    errors.push(ValidationErrorFactory.invalid('reward', 'Reward must be a non-negative number'));
  }

  // Type-specific validation
  switch (formData.type) {
    case 'multiple':
      validateMultipleType(formData, errors);
      break;
    case 'join':
      validateJoinType(formData, errors);
      break;
    case 'connect':
      validateConnectType(formData, errors);
      break;
    case 'external':
      validateExternalType(formData, errors);
      break;
    case 'repeatable':
      validateRepeatableType(formData, errors);
      break;
    case 'referral':
    case 'share':
    case 'like':
    case 'comment':
    case 'dummy':
      // These types don't require specific validation beyond core fields
      // dummy type is supported in all environments for testing purposes
      break;
    default:
      // Handle unknown types
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate multiple type quest requirements
 */
function validateMultipleType(formData: QuestFormValues, errors: ValidationFieldError[]): void {
  // URI is required for multiple type
  if (!formData.uri?.trim()) {
    errors.push({
      field: 'uri',
      message: 'URI is required for multiple type quests',
      type: 'required',
    });
  }

  // Must have at least one child task
  if (!formData.child || formData.child.length === 0) {
    errors.push({
      field: 'child',
      message: 'Multiple type quests must have at least one child task',
      type: 'required',
    });
  }

  // Validate child tasks
  if (formData.child && formData.child.length > 0) {
    formData.child.forEach((child, index) => {
      if (!child.title?.trim()) {
        errors.push({
          field: `child[${index}].title`,
          message: `Child task ${index + 1} title is required`,
          type: 'required',
        });
      }

      if (!child.type) {
        errors.push({
          field: `child[${index}].type`,
          message: `Child task ${index + 1} type is required`,
          type: 'required',
        });
      }

      if (typeof child.reward !== 'number' || child.reward < 0) {
        errors.push({
          field: `child[${index}].reward`,
          message: `Child task ${index + 1} reward must be a non-negative number, got: ${typeof child.reward}`,
          type: 'invalid',
        });
      }
    });
  }
}

/**
 * Validate join type quest requirements
 */
function validateJoinType(formData: QuestFormValues, errors: ValidationFieldError[]): void {
  if (!formData.uri?.trim()) {
    errors.push({
      field: 'uri',
      message: 'URI is required for join type quests',
      type: 'required',
    });
  }

  if (!formData.provider) {
    errors.push({
      field: 'provider',
      message: 'Provider is required for join type quests',
      type: 'required',
    });
  }
}

/**
 * Validate connect type quest requirements
 */
function validateConnectType(formData: QuestFormValues, errors: ValidationFieldError[]): void {
  if (!formData.provider) {
    errors.push({
      field: 'provider',
      message: 'Provider is required for connect type quests',
      type: 'required',
    });
  }
}

/**
 * Validate external type quest requirements
 */
function validateExternalType(formData: QuestFormValues, errors: ValidationFieldError[]): void {
  if (!formData.uri?.trim()) {
    errors.push({
      field: 'uri',
      message: 'URI is required for external type quests',
      type: 'required',
    });
  }

  // Validate URI format
  if (formData.uri && !isValidUrl(formData.uri)) {
    errors.push({
      field: 'uri',
      message: 'URI must be a valid URL',
      type: 'invalid',
    });
  }
}

/**
 * Validate repeatable type quest requirements (7-day challenge)
 */
function validateRepeatableType(formData: QuestFormValues, errors: ValidationFieldError[]): void {
  if (!formData.iterator) {
    errors.push({
      field: 'iterator',
      message: 'Iterator configuration is required for repeatable type quests',
      type: 'required',
    });
    return;
  }

  if (!formData.iterator.reward_map || formData.iterator.reward_map.length === 0) {
    errors.push({
      field: 'iterator.reward_map',
      message: 'Reward map is required for repeatable type quests',
      type: 'required',
    });
  }

  if (formData.iterator.reward_map) {
    // Validate reward map has 3-10 days
    if (formData.iterator.reward_map.length < 3 || formData.iterator.reward_map.length > 10) {
      errors.push({
        field: 'iterator.reward_map',
        message: 'Reward map must have between 3 and 10 days',
        type: 'invalid',
      });
    }

    // Validate all rewards are positive numbers
    const hasInvalidRewards = formData.iterator.reward_map.some(
      (reward) => typeof reward !== 'number' || reward < 0,
    );
    if (hasInvalidRewards) {
      errors.push({
        field: 'iterator.reward_map',
        message: 'All daily rewards must be positive numbers',
        type: 'invalid',
      });
    }
  }
}

/**
 * Validate blocking task dependencies
 */
export function validateBlockingTaskDependencies(
  formData: QuestFormValues,
  availableConnectQuests: Array<{ id: number; provider: string }>,
): ValidationFieldError[] {
  const errors: ValidationFieldError[] = [];

  // Check if quest requires connect gate but no blocking task is set
  if (formData.provider && formData.type !== 'connect' && !formData.blocking_task) {
    const hasMatchingConnectQuest = availableConnectQuests.some(
      (quest) => quest.provider === formData.provider,
    );

    if (!hasMatchingConnectQuest) {
      errors.push({
        field: 'blocking_task',
        message: `No Connect quest found for ${formData.provider}. Create a Connect quest first.`,
        type: 'dependency',
      });
    }
  }

  return errors;
}

/**
 * Validate preset compatibility
 */
export function validatePresetCompatibility(
  formData: QuestFormValues,
  presetId?: string,
): ValidationFieldError[] {
  const errors: ValidationFieldError[] = [];

  if (!presetId) return errors;

  // Validate preset-specific requirements
  switch (presetId) {
    case 'action-with-post':
      if (formData.type !== 'multiple') {
        errors.push({
          field: 'type',
          message: 'Action with post preset requires multiple type',
          type: 'invalid',
        });
      }
      if (formData.provider !== 'twitter') {
        errors.push({
          field: 'provider',
          message: 'Action with post preset requires twitter provider',
          type: 'invalid',
        });
      }
      break;

    case 'seven-day-challenge':
      if (formData.type !== 'repeatable') {
        errors.push({
          field: 'type',
          message: 'Seven day challenge preset requires repeatable type',
          type: 'invalid',
        });
      }
      break;
  }

  return errors;
}

/**
 * Helper function to validate URL format
 */
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ValidationFieldError[]): string {
  if (errors.length === 0) return '';

  const grouped = errors.reduce<Record<string, string[]>>(
    (acc, error) => {
      acc[error.type].push(error.message);
      return acc;
    },
    { required: [], invalid: [], dependency: [] },
  );

  let message = '';
  if (grouped.required.length > 0) {
    message += `Missing required fields:\n${grouped.required.map((msg) => `• ${msg}`).join('\n')}\n\n`;
  }
  if (grouped.invalid.length > 0) {
    message += `Invalid values:\n${grouped.invalid.map((msg) => `• ${msg}`).join('\n')}\n\n`;
  }
  if (grouped.dependency.length > 0) {
    message += `Dependencies:\n${grouped.dependency.map((msg) => `• ${msg}`).join('\n')}`;
  }

  return message.trim();
}

/**
 * Validate connect quest uniqueness per provider
 */
export function validateConnectUniqueness(
  formData: QuestFormValues,
  existingQuests: Array<{ id: number; type: string; provider?: string }>,
): ValidationFieldError[] {
  const errors: ValidationFieldError[] = [];

  // Only validate for connect type quests
  if (formData.type !== 'connect' || !formData.provider) {
    return errors;
  }

  // Check if there's already a connect quest for this provider
  const duplicateConnect = existingQuests.find(
    (quest) =>
      quest.type === 'connect' && quest.provider === formData.provider && quest.id !== formData.id, // Exclude current quest if editing
  );

  if (duplicateConnect) {
    errors.push({
      field: 'provider',
      message: `A Connect quest for ${formData.provider} already exists (ID: ${duplicateConnect.id}). Only one Connect quest per provider is allowed.`,
      type: 'duplicate',
    });
  }

  return errors;
}

/**
 * Validate multiple quest uniqueness per URI
 */
export function validateMultipleURIUniqueness(
  formData: QuestFormValues,
  existingQuests: Array<{ id: number; type: string; uri?: string }>,
): ValidationFieldError[] {
  const errors: ValidationFieldError[] = [];

  // Only validate for multiple type quests with URI
  if (formData.type !== 'multiple' || !formData.uri?.trim()) {
    return errors;
  }

  // Check if there's already a multiple quest for this URI
  const duplicateMultiple = existingQuests.find(
    (quest) => quest.type === 'multiple' && quest.uri === formData.uri && quest.id !== formData.id, // Exclude current quest if editing
  );

  if (duplicateMultiple) {
    errors.push({
      field: 'uri',
      message: `A Multiple quest for this URL already exists (ID: ${duplicateMultiple.id}). Only one Multiple quest per URL is allowed.`,
      type: 'duplicate',
    });
  }

  return errors;
}
