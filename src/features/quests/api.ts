import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  useAdminWaitlistTasksControllerGetWaitlistTasks,
  useAdminWaitlistTasksControllerCreateTask,
  useAdminWaitlistTasksControllerUpdateTask,
  useAdminWaitlistTasksControllerDeleteTask,
  useFilesControllerUploadFile,
  filesControllerUploadFile
} from '@/lib/api/generated/admin/admin';
import { type TaskResponseDto, type CreateTaskDto, type UpdateTaskDto, type UploadFileDto } from '@/lib/api/generated/model';
import { adaptAdminTasksToQuests, adaptAdminTaskToQuest } from './data/adapters';
import { formToApi, validateAndConvertToApi } from './adapters/form-api-adapter';
import type { Quest, QuestQuery, QuestsResponse } from './data/types';

export const useQuests = (query: QuestQuery) => {
  // Use the generated API hook for admin access to waitlist tasks
  const {
    data: adminTasks,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useAdminWaitlistTasksControllerGetWaitlistTasks();

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
        item.description.toLowerCase().includes(query.search.toLowerCase()) ||
        false;

      const matchesGroup =
        !query.group ||
        (() => {
          const selectedGroups = query.group.split(',').filter(Boolean);
          return selectedGroups.includes(item.group);
        })();

      const matchesType =
        !query.type ||
        (() => {
          const selectedTypes = query.type.split(',').filter(Boolean);
          // Handle both array and string types
          if (Array.isArray(item.type)) {
            return item.type.some((t: string) => selectedTypes.includes(t));
          } else if (typeof item.type === 'string') {
            return selectedTypes.includes(item.type);
          }
          return false;
        })();

      const matchesProvider =
        !query.provider ||
        (() => {
          const selectedProviders = query.provider.split(',').filter(Boolean);
          return item.provider ? selectedProviders.includes(item.provider) : false;
        })();

      const matchesVisibility = query.enabled === undefined || item.enabled === query.enabled;

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
  const { data: adminTasks, isLoading, error, isFetching } = useAdminWaitlistTasksControllerGetWaitlistTasks();

  // Memoize the specific task lookup and transformation
  const quest = useMemo(() => {
    if (!adminTasks) return undefined;

    const task = adminTasks.find((task) => task.id === id);

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
 * Create quest mutation (Real API implementation)
 */
export const useCreateQuest = () => {
  const queryClient = useQueryClient();
  const createTaskMutation = useAdminWaitlistTasksControllerCreateTask();

  return useMutation({
    mutationFn: async (data: Partial<Quest>): Promise<Quest> => {
      // Convert form data to API format using adapter
      const apiData = validateAndConvertToApi(data) as CreateTaskDto;

      const result = await createTaskMutation.mutateAsync({ data: apiData });

      // Convert API response back to Quest format
      return adaptAdminTaskToQuest(result);
    },
    onSuccess: () => {
      toast.success('Quest created successfully');
      // Invalidate and refetch quests list
      void queryClient.invalidateQueries({ queryKey: ['api', 'admin', 'tasks'] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to create quest';
      toast.error(message);
    },
  });
};

/**
 * Update quest mutation (Real API implementation)
 */
export const useUpdateQuest = (id: number) => {
  const queryClient = useQueryClient();
  const updateTaskMutation = useAdminWaitlistTasksControllerUpdateTask();

  return useMutation({
    mutationFn: async (data: Partial<Quest>): Promise<Quest> => {
      // Convert form data to API format using adapter
      const apiData = validateAndConvertToApi(data) as UpdateTaskDto;

      const result = await updateTaskMutation.mutateAsync({ id, data: apiData });

      // Convert API response back to Quest format
      return adaptAdminTaskToQuest(result);
    },
    onSuccess: () => {
      toast.success('Quest updated successfully');
      // Invalidate and refetch quests list
      void queryClient.invalidateQueries({ queryKey: ['api', 'admin', 'tasks'] });
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
 * Delete quest mutation (Real API implementation)
 */
export const useDeleteQuest = () => {
  const queryClient = useQueryClient();
  const deleteTaskMutation = useAdminWaitlistTasksControllerDeleteTask();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await deleteTaskMutation.mutateAsync({ id });
    },
    onSuccess: () => {
      toast.success('Quest deleted successfully');
      // Invalidate and refetch quests list
      void queryClient.invalidateQueries({ queryKey: ['api', 'admin', 'tasks'] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to delete quest';
      toast.error(message);
    },
  });
};

/**
 * Toggle quest enabled status mutation (Using PUT as PATCH)
 */
export const useToggleEnabled = () => {
  const queryClient = useQueryClient();
  const updateTaskMutation = useAdminWaitlistTasksControllerUpdateTask();

  return useMutation({
    mutationFn: async (data: { id: number; enabled: boolean }): Promise<Quest> => {
      // Use PUT endpoint which works as PATCH for enabled updates
      const result = await updateTaskMutation.mutateAsync({
        id: data.id,
        data: { enabled: data.enabled } as UpdateTaskDto
      });

      // Convert API response back to Quest format
      return adaptAdminTaskToQuest(result);
    },
    onSuccess: () => {
      toast.success('Quest status updated successfully');
      // Invalidate and refetch quests list
      void queryClient.invalidateQueries({ queryKey: ['api', 'admin', 'tasks'] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to toggle status';
      toast.error(message);
    },
  });
};

/**
 * @deprecated Use useToggleEnabled instead
 */
export const useToggleVisibility = useToggleEnabled;

/**
 * Toggle quest pinned state (Real API implementation)
 */
export const useTogglePinned = () => {
  const queryClient = useQueryClient();
  const updateTaskMutation = useAdminWaitlistTasksControllerUpdateTask();

  return useMutation({
    mutationFn: async (data: { id: number; pinned: boolean }): Promise<Quest> => {
      const result = await updateTaskMutation.mutateAsync({
        id: data.id,
        data: { pinned: data.pinned } as UpdateTaskDto
      });

      // Convert API response back to Quest format
      return adaptAdminTaskToQuest(result);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['api', 'admin', 'tasks'] });
      toast.success('Updated pin state');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to update pin';
      toast.error(message);
    },
  });
};

/**
 * Upload media for quest (Real API implementation)
 */
export const uploadMedia = async (file: File, _token: string | undefined): Promise<string> => {
  // Use real API endpoint for file upload
  const uploadFileDto: UploadFileDto = { file };

  const result = await filesControllerUploadFile(uploadFileDto);

  return result.url;
};

// ============================================================================
// Bulk Operations (Future Enhancement)
// ============================================================================

/**
 * Bulk update quests (Using individual API calls)
 * TODO: Implement true bulk operations when API supports them
 */
export const useBulkUpdateQuests = () => {
  const queryClient = useQueryClient();
  const updateTaskMutation = useAdminWaitlistTasksControllerUpdateTask();

  return useMutation({
    mutationFn: async (data: { ids: number[]; updates: Partial<Quest> }): Promise<Quest[]> => {
      // Convert form data to API format
      const apiData = validateAndConvertToApi(data.updates) as UpdateTaskDto;

      // Execute all updates in parallel
      const promises = data.ids.map(id =>
        updateTaskMutation.mutateAsync({ id, data: apiData })
      );

      const results = await Promise.all(promises);

      // Convert all API responses back to Quest format
      return results.map(result => adaptAdminTaskToQuest(result));
    },
    onSuccess: () => {
      toast.success('Quests updated successfully');
      void queryClient.invalidateQueries({ queryKey: ['api', 'admin', 'tasks'] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to update quests';
      toast.error(message);
    },
  });
};

/**
 * Bulk delete quests - NOT NEEDED
 * Individual delete operations are sufficient for admin interface
 */
export const useBulkDeleteQuests = () => {
  return useMutation({
    mutationFn: async (_ids: number[]): Promise<void> => {
      throw new Error('Bulk delete not needed - use individual delete operations');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Bulk delete not available';
      toast.error(message);
    },
  });
};
