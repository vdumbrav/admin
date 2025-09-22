/**
 * API Adapters for handling type inconsistencies
 *
 * This module provides adapters to handle current API type issues
 * until Swagger schemas are properly updated.
 */

export * from './iterator-dto-adapter';

// Re-export commonly used types
export type { CorrectedIteratorDto, IteratorResourceDto } from './iterator-dto-adapter';
