/**
 * Type adapters for IteratorDto until Swagger schema is fixed
 *
 * Issues being addressed:
 * 1. reward_map should be number[] but currently string[]
 * 2. iterator_resource should be properly typed instead of { [key: string]: unknown }
 */
import type { IteratorDto } from '../generated/model/iteratorDto';

// Proper typing for iterator resource until Swagger is fixed
export interface IteratorResourceDto {
  /** Array of icon URLs for each day */
  icons?: string[];
  /** Array of titles for each day */
  titles?: string[];
  /** Array of descriptions for each day */
  descriptions?: string[];
  /** Background color */
  background_color?: string;
}

// Corrected IteratorDto with proper types
export interface CorrectedIteratorDto {
  /** Current day */
  day: number;
  /** Total days in challenge */
  days: number;
  /** Array of daily rewards as numbers */
  reward_map: number[];
  /** Array of reward strings (backend generated) */
  iterator_reward: string[];
  /** Iterator resource with proper typing */
  iterator_resource: IteratorResourceDto;
  /** Current reward */
  reward: number;
  /** Maximum reward */
  reward_max: number;
  /** Resource data */
  resource: IteratorResourceDto;
}

/**
 * Converts API IteratorDto to properly typed version
 * Handles string[] -> number[] conversion for reward_map
 */
export function adaptIteratorDto(apiIterator: IteratorDto): CorrectedIteratorDto {
  return {
    ...apiIterator,
    // Convert string[] to number[] for reward_map
    reward_map: apiIterator.reward_map.map((reward) =>
      typeof reward === 'string' ? parseFloat(reward) || 0 : reward,
    ),
    // Cast unknown types to proper interfaces
    iterator_resource: apiIterator.iterator_resource as IteratorResourceDto,
    resource: apiIterator.resource as IteratorResourceDto,
  };
}

/**
 * Type guard to check if iterator_resource has expected structure
 */
export function isValidIteratorResource(resource: unknown): resource is IteratorResourceDto {
  if (!resource || typeof resource !== 'object') return false;

  const res = resource as Record<string, unknown>;

  return (
    (res.icons === undefined || Array.isArray(res.icons)) &&
    (res.titles === undefined || Array.isArray(res.titles)) &&
    (res.descriptions === undefined || Array.isArray(res.descriptions)) &&
    (res.background_color === undefined || typeof res.background_color === 'string')
  );
}

/**
 * Safely extracts iterator resource with fallback
 */
export function safeGetIteratorResource(
  resource: unknown,
  fallback: IteratorResourceDto = {},
): IteratorResourceDto {
  return isValidIteratorResource(resource) ? resource : fallback;
}
