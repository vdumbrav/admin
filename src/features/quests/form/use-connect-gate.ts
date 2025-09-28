import { useMemo } from 'react';
import { useAdminWaitlistTasksControllerGetWaitlistTasks } from '@/lib/api/generated/admin/admin';

export interface ConnectGateResult {
  hasRequiredConnect: boolean | null; // null while loading/unknown
  connectQuestId: number | null; // ID of the Connect quest for this provider
  error?: string;
}

/**
 * Check if there is an existing Connect quest for a given provider.
 * Returns null while loading/fetching.
 */
export function useConnectGate(provider?: string): ConnectGateResult {
  const { data, error, isLoading } = useAdminWaitlistTasksControllerGetWaitlistTasks();

  const { hasRequiredConnect, connectQuestId } = useMemo(() => {
    if (!provider) return { hasRequiredConnect: null, connectQuestId: null };
    if (!data) return { hasRequiredConnect: null, connectQuestId: null };

    // Find Connect quest for this provider
    const connectQuest = data.find((t) => t.provider === provider && t.type.includes('connect'));

    return {
      hasRequiredConnect: !!connectQuest,
      connectQuestId: connectQuest?.id ?? null,
    };
  }, [data, provider]);

  if (error) {
    return {
      hasRequiredConnect: null,
      connectQuestId: null,
      error: error instanceof Error ? error.message : 'Failed to load quests',
    };
  }

  if (isLoading) {
    return { hasRequiredConnect: null, connectQuestId: null };
  }

  return { hasRequiredConnect, connectQuestId };
}
