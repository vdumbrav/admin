import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  filesControllerUploadFile,
  useAdminWaitlistTasksControllerCreateTask,
  useAdminWaitlistTasksControllerDeleteTask,
  useAdminWaitlistTasksControllerGetWaitlistTasks,
  useAdminWaitlistTasksControllerUpdateTask,
} from '@/lib/api/generated/admin/admin';
import {
  type CreateTaskDto,
  type UpdateTaskDto,
  type UploadFileDto,
} from '@/lib/api/generated/model';
import { validateAndConvertToApi } from './adapters/form-api-adapter';
import type { Quest, QuestQuery, QuestsResponse } from './data/types';

export const useQuests = (query: QuestQuery) => {
  const {
    data: adminTasks,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useAdminWaitlistTasksControllerGetWaitlistTasks();

  const questsData = adminTasks;

  const processedData = useMemo((): QuestsResponse | undefined => {
    if (!questsData) return undefined;

    // Client-side filtering - no server-side filtering needed
    let filteredItems = questsData.filter((item: Quest) => {
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

    // Client-side sorting - no server support required
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

    // Client-side pagination for small datasets
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
  const {
    data: adminTasks,
    isLoading,
    error,
    isFetching,
  } = useAdminWaitlistTasksControllerGetWaitlistTasks();

  const quest = useMemo(() => {
    if (!adminTasks) return undefined;
    return adminTasks.find((task) => task.id === id);
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
// Mutation Hooks
// ============================================================================

export const useCreateQuest = () => {
  const queryClient = useQueryClient();
  const createTaskMutation = useAdminWaitlistTasksControllerCreateTask();

  return useMutation({
    mutationFn: async (data: Partial<Quest>): Promise<Quest> => {
      const apiData = validateAndConvertToApi(data) as unknown as CreateTaskDto;
      const result = await createTaskMutation.mutateAsync({ data: apiData });
      return result;
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

export const useUpdateQuest = (id: number) => {
  const queryClient = useQueryClient();
  const updateTaskMutation = useAdminWaitlistTasksControllerUpdateTask();

  return useMutation({
    mutationFn: async (data: Partial<Quest>): Promise<Quest> => {
      const apiData = validateAndConvertToApi(data) as unknown as UpdateTaskDto;
      const result = await updateTaskMutation.mutateAsync({ id, data: apiData });
      return result;
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
 * Delete quest mutation
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

export const useToggleEnabled = () => {
  const queryClient = useQueryClient();
  const updateTaskMutation = useAdminWaitlistTasksControllerUpdateTask();

  return useMutation({
    mutationFn: async (data: { id: number; enabled: boolean }): Promise<Quest> => {
      const result = await updateTaskMutation.mutateAsync({
        id: data.id,
        data: { enabled: data.enabled } as UpdateTaskDto,
      });
      return result;
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

export const useTogglePinned = () => {
  const queryClient = useQueryClient();
  const updateTaskMutation = useAdminWaitlistTasksControllerUpdateTask();

  return useMutation({
    mutationFn: async (data: { id: number; pinned: boolean }): Promise<Quest> => {
      const result = await updateTaskMutation.mutateAsync({
        id: data.id,
        data: { pinned: data.pinned } as UpdateTaskDto,
      });
      return result;
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
 * Upload media for quest
 */
export const uploadMedia = async (file: File): Promise<string> => {
  try {
    // Upload file using API endpoint
    const uploadFileDto: UploadFileDto = { file };

    const response = await filesControllerUploadFile(uploadFileDto);

    if (response.url) {
      return response.url;
    }

    throw new Error('Invalid response: missing URL');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'File upload failed';
    throw new Error(`Upload failed: ${message}`);
  }
};
