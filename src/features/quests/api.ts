import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAdminControllerGetWaitlistTasks } from '@/lib/api/generated/admin/admin';
import { type AdminWaitlistTasksResponseDto } from '@/lib/api/generated/model';
import { adaptAdminTasksToQuests, adaptAdminTaskToQuest } from './data/adapters';
import type { Quest, QuestQuery, QuestsResponse } from './data/types';
import {
  initializeMockStorage,
  mockCreateQuest,
  mockUpdateQuest,
  mockUploadMedia,
} from './utils/mock-api';

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
        (item.description?.toLowerCase().includes(query.search.toLowerCase()) ?? false);

      const matchesGroup = !query.group || item.group === query.group;

      const matchesType =
        !query.type ||
        (() => {
          const selectedTypes = query.type.split(',').filter(Boolean);
          return item.type?.some((t: string) => selectedTypes.includes(t));
        })();

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
 * Create quest mutation (Mock implementation)
 */
export const useCreateQuest = () => {
  const queryClient = useQueryClient();

  // Initialize mock storage on first use
  initializeMockStorage();

  return useMutation({
    mutationFn: async (data: Partial<Quest>): Promise<Quest> => {
      return await mockCreateQuest(data);
    },
    onSuccess: () => {
      toast.success('Quest created successfully');
      // Invalidate and refetch quests list
      void queryClient.invalidateQueries({ queryKey: ['waitlist-tasks'] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to create quest';
      toast.error(message);
    },
  });
};

/**
 * Update quest mutation (Mock implementation)
 */
export const useUpdateQuest = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Quest>): Promise<Quest> => {
      return await mockUpdateQuest(id, data);
    },
    onSuccess: () => {
      toast.success('Quest updated successfully');
      // Invalidate and refetch quests list
      void queryClient.invalidateQueries({ queryKey: ['waitlist-tasks'] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to update quest';

      // Handle conflict errors with special UI
      if (message.includes('Conflict')) {
        toast.error(message, {
          action: {
            label: 'Reload form',
            onClick: () => window.location.reload(),
          },
        });
      } else {
        toast.error(message);
      }
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
 * Toggle quest pinned state (Mock implementation)
 */
export const useTogglePinned = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: number; pinned: boolean }): Promise<Quest> => {
      // Use mock update for now
      return await mockUpdateQuest(data.id, { pinned: data.pinned } as Partial<Quest>);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['waitlist-tasks'] });
      toast.success('Updated pin state');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to update pin';
      toast.error(message);
    },
  });
};

/**
 * Upload media for quest (Mock implementation)
 */
export const uploadMedia = async (file: File, _token: string | undefined): Promise<string> => {
  return await mockUploadMedia(file);
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
