/**
 * Deep merge two objects - simplified implementation
 * Handles nested objects properly, arrays are replaced (not merged)
 */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
}

export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  // TODO P3: Fix generic type constraints to avoid index assignment issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = { ...target } as any;

  for (const [key, sourceValue] of Object.entries(source)) {
    if (sourceValue === null || sourceValue === undefined) {
      continue;
    }

    const targetValue = result[key];

    if (Array.isArray(sourceValue)) {
      // Arrays are replaced, not merged
      result[key] = sourceValue;
    } else if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
      // Recursively merge nested objects
      result[key] = deepMerge(targetValue, sourceValue);
    } else {
      // Primitive values are replaced
      result[key] = sourceValue;
    }
  }

  return result;
}
