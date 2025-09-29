import { useMemo } from 'react';
import { useAdminWaitlistTasksControllerGetWaitlistTasks } from '@/lib/api/generated/admin/admin';

/**
 * Hook for fetching existing quests data for client-side validation
 * Used to validate uniqueness constraints like connect per provider and multiple per URI
 */
export function useExistingQuests() {
  const {
    data: allQuests,
    isLoading,
    isFetching,
    error,
  } = useAdminWaitlistTasksControllerGetWaitlistTasks();

  const existingQuests = useMemo(() => {
    if (!allQuests || !Array.isArray(allQuests)) return [];

    return allQuests.map((quest) => ({
      id: quest.id,
      type: quest.type,
      provider: quest.provider,
      uri: quest.uri,
      title: quest.title,
    }));
  }, [allQuests]);

  return {
    existingQuests,
    isLoading,
    isFetching,
    error,
  };
}
