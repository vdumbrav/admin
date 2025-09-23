import { useMemo } from 'react';
import { useAdminWaitlistTasksControllerGetWaitlistTasks } from '@/lib/api/generated/admin/admin';

export interface ConnectGateResult {
  hasRequiredConnect: boolean | null; // null while loading/unknown
  error?: string;
}

/**
 * Check if there is an existing Connect quest for a given provider.
 * Returns null while loading/fetching.
 */
export function useConnectGate(provider?: string): ConnectGateResult {
  const { data, error, isLoading } = useAdminWaitlistTasksControllerGetWaitlistTasks();

  const hasRequiredConnect = useMemo(() => {
    if (!provider) return null;
    if (!data) return null;
    // AdminWaitlistTasksResponseDto.type is an array on API model, check includes 'connect'
    return data.some((t) => t.provider === provider && t.type.includes('connect'));
  }, [data, provider]);

  if (error) {
    return {
      hasRequiredConnect: null,
      error: error instanceof Error ? error.message : 'Failed to load quests',
    };
  }

  if (isLoading) {
    return { hasRequiredConnect: null };
  }

  return { hasRequiredConnect };
}
