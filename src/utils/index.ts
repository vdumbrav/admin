/**
 * Shared Utilities
 * Common utility functions used across the application
 */

// Object utilities
export { deepMerge } from './object/deep-merge';

// Domain utilities
export {
  matchDomain,
  extractDomain,
  getProviderForDomain,
  isSocialDomain,
  getConnectGateMessage,
} from './domain/domain-matcher';

// Re-export specific utility categories
export * as ObjectUtils from './object';
export * as DomainUtils from './domain';
export * as ValidationUtils from './validation';
