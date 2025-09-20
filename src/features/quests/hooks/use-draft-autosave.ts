import { useEffect, useRef } from 'react';
import { type UseFormWatch } from 'react-hook-form';
import type { QuestFormValues } from '../types/form-types';

interface UseDraftAutosaveOptions {
  key: string;
  watch: UseFormWatch<QuestFormValues>;
  debounceMs?: number;
  enabled?: boolean;
}

/**
 * Hook for auto-saving form drafts to localStorage
 *
 * Features:
 * - Debounced saves to avoid excessive localStorage writes
 * - Configurable storage key for different form instances
 * - Optional enable/disable toggle
 * - Cleanup on unmount
 */
export function useDraftAutosave({
  key,
  watch,
  debounceMs = 2000,
  enabled = true,
}: UseDraftAutosaveOptions) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storageKey = `quest-draft-${key}`;

  useEffect(() => {
    if (!enabled) return;

    const subscription = watch((data) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for debounced save
      timeoutRef.current = setTimeout(() => {
        try {
          // Only save if there's meaningful data
          if (data.title || data.description || data.uri) {
            localStorage.setItem(
              storageKey,
              JSON.stringify({
                data,
                timestamp: Date.now(),
              }),
            );
          }
        } catch (error) {
          console.warn('Failed to save draft:', error);
        }
      }, debounceMs);
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [watch, storageKey, debounceMs, enabled]);

  // Cleanup function to clear draft
  const clearDraft = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to clear draft:', error);
    }
  };

  return { clearDraft };
}

/**
 * Load draft data from localStorage
 */
export function loadDraft(key: string): QuestFormValues | null {
  try {
    const storageKey = `quest-draft-${key}`;
    const stored = localStorage.getItem(storageKey);

    if (!stored) return null;

    const parsed = JSON.parse(stored);

    // Check if draft is not too old (7 days)
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
    if (Date.now() - parsed.timestamp > maxAge) {
      localStorage.removeItem(storageKey);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.warn('Failed to load draft:', error);
    return null;
  }
}

/**
 * Check if a draft exists for the given key
 */
export function hasDraft(key: string): boolean {
  try {
    const storageKey = `quest-draft-${key}`;
    return localStorage.getItem(storageKey) !== null;
  } catch {
    return false;
  }
}
