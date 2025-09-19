import { useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAdminControllerGetWaitlistTasks } from '@/lib/api/generated/admin/admin';
import { type AdminWaitlistTasksResponseDto } from '@/lib/api/generated/model';
import { adaptAdminTasksToQuests, adaptAdminTaskToQuest } from './data/adapters';
import type { Quest, QuestQuery, QuestsResponse } from './data/types';

export const useQuests = (query: QuestQuery) => {
  // Use the generated API hook for admin access to waitlist tasks
  const {
    data: adminTasks,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useAdminControllerGetWaitlistTasks();

  // Memoize transformation to avoid unnecessary re-renders
  const transformedQuests = useMemo(() => {
    if (!adminTasks) return undefined;
    return adaptAdminTasksToQuests(adminTasks);
  }, [adminTasks]);

  // Memoize filtering and pagination for performance
  const processedData = useMemo((): QuestsResponse | undefined => {
    if (!transformedQuests) return undefined;

    // Apply client-side filtering (API returns full list of 50-200 items)
    let filteredItems = transformedQuests.filter((item: Quest) => {
      const matchesSearch =
        !query.search ||
        item.title.toLowerCase().includes(query.search.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.search.toLowerCase());

      const matchesGroup = !query.group || query.group === 'all' || item.group === query.group;

      const matchesType = !query.type || item.type?.some((t: string) => t === query.type);

      const matchesProvider = !query.provider || item.provider === query.provider;

      const matchesVisibility = query.visible === undefined || item.visible === query.visible;

      return matchesSearch && matchesGroup && matchesType && matchesProvider && matchesVisibility;
    });

    // Apply client-side sorting (frontend-only for small lists)
    if (query.sort) {
      const [field, direction] = query.sort.split(':');
      const isAsc = direction !== 'desc';

      filteredItems = [...filteredItems].sort((a, b) => {
        const aVal = (a as unknown as Record<string, unknown>)[field];
        const bVal = (b as unknown as Record<string, unknown>)[field];

        if (aVal !== null && aVal !== undefined && bVal !== null && bVal !== undefined) {
          if (aVal < bVal) return isAsc ? -1 : 1;
          if (aVal > bVal) return isAsc ? 1 : -1;
        }
        return 0;
      });
    }

    // Apply client-side pagination (frontend-only for small lists)
    const totalItems = filteredItems.length;
    let paginatedItems = filteredItems;

    if (query.page && query.limit) {
      const startIndex = (query.page - 1) * query.limit;
      const endIndex = startIndex + query.limit;
      paginatedItems = filteredItems.slice(startIndex, endIndex);
    }

    return {
      items: paginatedItems,
      total: totalItems,
    };
  }, [transformedQuests, query]);

  return {
    data: processedData,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};

export const useQuest = (id: number) => {
  // Use the base hook to get all tasks (leveraging React Query cache)
  const { data: adminTasks, isLoading, error, isFetching } = useAdminControllerGetWaitlistTasks();

  // Memoize the specific task lookup and transformation
  const quest = useMemo(() => {
    if (!adminTasks) return undefined;

    const task = adminTasks.find((task: AdminWaitlistTasksResponseDto) => task.id === id);

    return task ? adaptAdminTaskToQuest(task) : undefined;
  }, [adminTasks, id]);

  return {
    data: quest,
    isLoading,
    error,
    isFetching,
    isSuccess: !!quest && !isLoading && !error,
    isError: !!error,
  };
};

// ============================================================================
// Mutation Hooks (Currently in readonly mode)
// ============================================================================

/**
 * Create quest mutation
 * TODO: Implement actual quest creation API when available
 * TODO: Add proper validation using questFormSchema
 * TODO: Add optimistic updates for better UX
 */
export const useCreateQuest = () => {
  return useMutation({
    mutationFn: async (_data: Partial<Quest>): Promise<Quest> => {
      // TODO: Replace with actual API call when quest creation endpoint is available
      // Example: return await api.post('/api/quests', adaptTaskToQuest(data))
      throw new Error(
        'Create operation not available for admin tasks (readonly mode). TODO: Implement quest creation API.',
      );
    },
    onSuccess: () => {
      toast.success('Quest created successfully');
      // TODO: Invalidate and refetch quests list
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to create quest';
      toast.error(message);
    },
  });
};

/**
 * Update quest mutation
 * TODO: Implement actual quest update API when available
 * TODO: Add partial update support
 * TODO: Add validation before sending to API
 */
export const useUpdateQuest = (_id: number) => {
  return useMutation({
    mutationFn: async (_data: Partial<Quest>): Promise<Quest> => {
      // TODO: Replace with actual API call when quest update endpoint is available
      // Example: return await api.put(`/api/quests/${id}`, adaptTaskToQuest(data))
      throw new Error(
        'Update operation not available for admin tasks (readonly mode). TODO: Implement quest update API.',
      );
    },
    onSuccess: () => {
      toast.success('Quest updated successfully');
      // TODO: Invalidate and refetch quests list or update cache directly
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to update quest';
      toast.error(message);
    },
  });
};

/**
 * Delete quest mutation
 * TODO: Implement actual quest deletion API when available
 * TODO: Add confirmation dialog before deletion
 * TODO: Add soft delete option if supported by API
 */
export const useDeleteQuest = () => {
  return useMutation({
    mutationFn: async (_id: number): Promise<void> => {
      // TODO: Replace with actual API call when quest deletion endpoint is available
      // Example: return await api.delete(`/api/quests/${id}`)
      throw new Error(
        'Delete operation not available for admin tasks (readonly mode). TODO: Implement quest deletion API.',
      );
    },
    onSuccess: () => {
      toast.success('Quest deleted successfully');
      // TODO: Remove from cache and refetch list
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to delete quest';
      toast.error(message);
    },
  });
};

/**
 * Toggle quest visibility mutation
 * TODO: Implement actual visibility toggle API when available
 * TODO: Consider if this should be part of update quest instead
 */
export const useToggleVisibility = () => {
  return useMutation({
    mutationFn: async (_data: { id: number; visible: boolean }): Promise<Quest> => {
      // TODO: Replace with actual API call when visibility toggle endpoint is available
      // Example: return await api.patch(`/api/quests/${data.id}/visibility`, { visible: data.visible })
      throw new Error(
        'Toggle visibility not available for admin tasks (readonly mode). TODO: Implement visibility toggle API.',
      );
    },
    onSuccess: () => {
      toast.success('Quest visibility updated successfully');
      // TODO: Update cache directly for immediate feedback
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to toggle visibility';
      toast.error(message);
    },
  });
};

/**
 * Upload media for quest
 * TODO: Implement actual media upload API when available
 * TODO: Add progress tracking for file uploads
 * TODO: Add file type and size validation
 * TODO: Add image compression/optimization
 */
export const uploadMedia = async (_file: File, _token: string | undefined): Promise<string> => {
  // TODO: Replace with actual API call when media upload endpoint is available
  // Example:
  // const formData = new FormData()
  // formData.append('file', file)
  // const response = await api.post('/api/media/upload', formData, {
  //   headers: { Authorization: `Bearer ${token}` }
  // })
  // return response.data.url

  throw new Error(
    'Upload media not available for admin tasks (readonly mode). TODO: Implement media upload API.',
  );
};

// ============================================================================
// Bulk Operations (Future Enhancement)
// ============================================================================

/**
 * Bulk update quests
 * TODO: Implement when API supports bulk operations
 */
export const useBulkUpdateQuests = () => {
  return useMutation({
    mutationFn: async (_data: { ids: number[]; updates: Partial<Quest> }): Promise<Quest[]> => {
      throw new Error('Bulk update not implemented yet. TODO: Add bulk operations API.');
    },
  });
};

/**
 * Bulk delete quests
 * TODO: Implement when API supports bulk operations
 */
export const useBulkDeleteQuests = () => {
  return useMutation({
    mutationFn: async (_ids: number[]): Promise<void> => {
      throw new Error('Bulk delete not implemented yet. TODO: Add bulk operations API.');
    },
  });
};
