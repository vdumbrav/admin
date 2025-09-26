/**
 * Preset system types for Quest creation
 * Single source of truth for preset configuration
 */
import { z } from 'zod';

// ============================================================================
// Field visibility and behavior types
// ============================================================================

export type FieldVisibility = 'visible' | 'hidden' | 'readonly' | 'conditional';

export interface FieldVisibilityConfig {
  group?: FieldVisibility;
  provider?: FieldVisibility;
  uri?: FieldVisibility;
  reward?: FieldVisibility;
  totalReward?: FieldVisibility;
  tasks?: FieldVisibility;
  dailyRewards?: FieldVisibility;
  username?: FieldVisibility;
  tweetId?: FieldVisibility;
  icon?: FieldVisibility;
  partnerIcon?: FieldVisibility;
  buttonText?: FieldVisibility;
  popupDescription?: FieldVisibility;
  popupButton?: FieldVisibility;
  repeatable?: FieldVisibility;
}

export interface BusinessRule {
  condition: string;
  action: string;
  description: string;
  mapping?: Record<string, string>;
}

export interface ConnectGateConfig {
  required?: boolean;
  conditional?: boolean;
  provider?: 'match';
  trigger?: string;
  domains?: string[];
}

export interface RewardCalculationConfig {
  source: 'tasks' | 'iterator.reward_map';
  field: 'totalReward';
  readonly: boolean;
}

// ============================================================================
// Preset configuration schema and type
// ============================================================================

export const presetConfigSchema = z.object({
  id: z.enum(['connect', 'join', 'action-with-post', 'seven-day-challenge', 'explore']),
  name: z.string().min(1),

  // Form behavior
  fieldVisibility: z.record(z.string(), z.enum(['visible', 'hidden', 'readonly', 'conditional'])),
  defaults: z.record(z.string(), z.any()),

  // Business logic
  businessRules: z
    .array(
      z.object({
        condition: z.string(),
        action: z.string(),
        description: z.string(),
        mapping: z.record(z.string(), z.string()).optional(),
      }),
    )
    .optional(),

  connectGateRules: z
    .object({
      required: z.boolean().optional(),
      conditional: z.boolean().optional(),
      provider: z.enum(['match']).optional(),
      trigger: z.string().optional(),
      domains: z.array(z.string()).optional(),
    })
    .optional(),

  rewardCalculation: z
    .object({
      source: z.enum(['tasks', 'iterator.reward_map']),
      field: z.enum(['totalReward']),
      readonly: z.boolean(),
    })
    .optional(),

  specialComponents: z.array(z.string()).optional(),
});

export type PresetConfig = z.infer<typeof presetConfigSchema>;

export type PresetId = PresetConfig['id'];

// ============================================================================
// Preset errors
// ============================================================================

export class PresetNotFoundError extends Error {
  constructor(presetId: string) {
    super(`Preset "${presetId}" not found`);
    this.name = 'PresetNotFoundError';
  }
}

export class InvalidPresetConfigError extends Error {
  constructor(presetId: string, errors: string[]) {
    super(`Invalid preset config for "${presetId}": ${errors.join(', ')}`);
    this.name = 'InvalidPresetConfigError';
  }
}
