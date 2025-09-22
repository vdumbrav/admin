import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  filesControllerUploadFile,
  getAdminWaitlistTasksControllerGetWaitlistTasksQueryKey,
  useAdminWaitlistTasksControllerCreateTask,
  useAdminWaitlistTasksControllerDeleteTask,
  useAdminWaitlistTasksControllerGetWaitlistTasks,
  useAdminWaitlistTasksControllerUpdateTask,
} from '@/lib/api/generated/admin/admin';
import {
  type TaskResponseDto,
  type UpdateTaskDto,
} from '@/lib/api/generated/model';
import { validateAndConvertToApi } from './adapters/form-api-adapter';
import type { QuestQuery, QuestsResponse } from './data/types';

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
    let filteredItems = questsData.filter((item: TaskResponseDto) => {
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
        const aVal = a[field as keyof TaskResponseDto];
        const bVal = b[field as keyof TaskResponseDto];

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
  }, [questsData, query]);

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
  const queryKey = getAdminWaitlistTasksControllerGetWaitlistTasksQueryKey();

  return useMutation({
    mutationFn: async (data: Partial<TaskResponseDto>): Promise<TaskResponseDto> => {
      const apiData = validateAndConvertToApi(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await createTaskMutation.mutateAsync({ data: apiData as any });
      return result;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
      toast.success('Quest created successfully');
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
  const queryKey = getAdminWaitlistTasksControllerGetWaitlistTasksQueryKey();

  return useMutation({
    mutationFn: async (data: Partial<TaskResponseDto>): Promise<TaskResponseDto> => {
      // TODO: Remove casting when validateAndConvertToApi returns proper UpdateTaskDto (P2)
      // Currently needed due to TaskResponseDto vs UpdateTaskDto structural differences
      const apiData = validateAndConvertToApi(data) as unknown as UpdateTaskDto;
      const result = await updateTaskMutation.mutateAsync({ id, data: apiData });
      return result;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
      toast.success('Quest updated successfully');
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
  const queryKey = getAdminWaitlistTasksControllerGetWaitlistTasksQueryKey();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await deleteTaskMutation.mutateAsync({ id });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
      toast.success('Quest deleted successfully');
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
  const queryKey = getAdminWaitlistTasksControllerGetWaitlistTasksQueryKey();

  return useMutation({
    mutationFn: async (data: { id: number; enabled: boolean }): Promise<TaskResponseDto> => {
      const result = await updateTaskMutation.mutateAsync({
        id: data.id,
        data: { enabled: data.enabled } as UpdateTaskDto,
      });
      return result;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
      toast.success('Quest status updated');
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
  const queryKey = getAdminWaitlistTasksControllerGetWaitlistTasksQueryKey();

  return useMutation({
    mutationFn: async (data: { id: number; pinned: boolean }): Promise<TaskResponseDto> => {
      const result = await updateTaskMutation.mutateAsync({
        id: data.id,
        data: { pinned: data.pinned } as UpdateTaskDto,
      });
      return result;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
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
    const response = await filesControllerUploadFile({ file });

    if (response.url) {
      return response.url;
    }

    throw new Error('Invalid response: missing URL');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'File upload failed';
    throw new Error(`Upload failed: ${message}`);
  }
};
