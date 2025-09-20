/**
 * Deep merge two objects
 * Handles nested objects properly, arrays are replaced (not merged)
 */
export function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (sourceValue === null || sourceValue === undefined) {
        // Skip null/undefined values from source
        continue;
      }

      if (Array.isArray(sourceValue)) {
        // Arrays are replaced, not merged
        result[key] = sourceValue as T[Extract<keyof T, string>];
      } else if (
        typeof sourceValue === 'object' &&
        typeof targetValue === 'object' &&
        targetValue !== null &&
        !Array.isArray(targetValue)
      ) {
        // Recursively merge nested objects
        result[key] = deepMerge(targetValue as Record<string, unknown>, sourceValue) as T[Extract<
          keyof T,
          string
        >];
      } else {
        // Primitive values are replaced
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}
