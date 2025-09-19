/**
 * Preset Manager - Single source of truth for Quest presets
 * Runtime registry with validation and type safety
 */
import { actionWithPostPresetConfig } from './configs/action-with-post';
import { connectPresetConfig } from './configs/connect';
import { explorePresetConfig } from './configs/explore';
import { joinPresetConfig } from './configs/join';
import { sevenDayChallengePresetConfig } from './configs/seven-day-challenge';
import {
  presetConfigSchema,
  PresetNotFoundError,
  InvalidPresetConfigError,
  type PresetConfig,
  type PresetId,
} from './types';

// ============================================================================
// Preset Registry
// ============================================================================

const PRESET_REGISTRY = new Map<PresetId, PresetConfig>([
  ['connect', connectPresetConfig],
  ['join', joinPresetConfig],
  ['action-with-post', actionWithPostPresetConfig],
  ['seven-day-challenge', sevenDayChallengePresetConfig],
  ['explore', explorePresetConfig],
]);

// Validate all presets at module load time
for (const [id, config] of PRESET_REGISTRY.entries()) {
  const result = presetConfigSchema.safeParse(config);
  if (!result.success) {
    const errors = result.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`);
    throw new InvalidPresetConfigError(id, errors);
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Get preset configuration by ID
 * @throws PresetNotFoundError if preset doesn't exist
 */
export function getPreset(presetId: string): PresetConfig {
  if (!isValidPresetId(presetId)) {
    throw new PresetNotFoundError(presetId);
  }

  const preset = PRESET_REGISTRY.get(presetId);
  if (!preset) {
    throw new PresetNotFoundError(presetId);
  }

  return preset;
}

/**
 * Get all available presets
 */
export function listPresets(): PresetConfig[] {
  return Array.from(PRESET_REGISTRY.values());
}

/**
 * Check if preset ID is valid
 */
export function isValidPresetId(presetId: string): presetId is PresetId {
  return PRESET_REGISTRY.has(presetId as PresetId);
}

/**
 * Assert that preset ID is known, throw if not
 * @throws PresetNotFoundError if preset doesn't exist
 */
export function assertKnownPreset(presetId: string): asserts presetId is PresetId {
  if (!isValidPresetId(presetId)) {
    throw new PresetNotFoundError(presetId);
  }
}

/**
 * Get preset safely, returns null if not found
 */
export function getPresetSafe(presetId: string): PresetConfig | null {
  try {
    return getPreset(presetId);
  } catch (error) {
    if (error instanceof PresetNotFoundError) {
      return null;
    }
    throw error;
  }
}

/**
 * Validate preset configuration against schema
 */
export function validatePresetConfig(config: unknown): PresetConfig {
  const result = presetConfigSchema.safeParse(config);
  if (!result.success) {
    const errors = result.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`);
    throw new InvalidPresetConfigError('unknown', errors);
  }
  return result.data;
}

// ============================================================================
// Development helpers
// ============================================================================

/**
 * Get preset registry for debugging (development only)
 */
export function getPresetRegistry(): Map<PresetId, PresetConfig> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('getPresetRegistry is only available in development');
  }
  return new Map(PRESET_REGISTRY);
}

/**
 * Register preset dynamically (development/testing only)
 */
export function registerPreset(config: PresetConfig): void {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('registerPreset is only available in development');
  }

  const validatedConfig = validatePresetConfig(config);
  PRESET_REGISTRY.set(validatedConfig.id, validatedConfig);
}
