import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  filesControllerUploadFile,
  getAdminWaitlistTasksControllerGetWaitlistTasksQueryKey,
  useAdminWaitlistTasksControllerCreateTask,
  useAdminWaitlistTasksControllerDeleteTask,
  useAdminWaitlistTasksControllerGetTask,
  useAdminWaitlistTasksControllerGetWaitlistTasks,
  useAdminWaitlistTasksControllerUpdateTask,
} from '@/lib/api/generated/admin/admin';
import {
  type CreateTaskDto,
  type TaskResponseDto,
  type UpdateTaskDto,
} from '@/lib/api/generated/model';
import { validateAndConvertToApi } from './adapters/form-api-adapter';
import type { QuestQuery, QuestsResponse } from './data/types';
import { useExistingQuests } from './hooks/use-existing-quests';
import type { QuestFormValues } from './types/form-types';

export const useQuests = (query: QuestQuery) => {
  const {
    data: adminTasks,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useAdminWaitlistTasksControllerGetWaitlistTasks();

  const processedData = useMemo((): QuestsResponse | undefined => {
    const questsData = adminTasks ?? [];
    if (!Array.isArray(questsData)) return undefined;

    // Client-side filtering - no server-side filtering needed
    let filteredItems = questsData.filter((item: TaskResponseDto) => {
      const matchesSearch =
        !query.search ||
        item.title?.toLowerCase().includes(query.search.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.search.toLowerCase()) ||
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
          return selectedTypes.includes(item.type);
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
  }, [adminTasks, query]);

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
    data: questData,
    isLoading,
    error,
    isFetching,
    isSuccess,
    isError,
  } = useAdminWaitlistTasksControllerGetTask(id);

  // Handle the API returning array instead of single object
  const quest = useMemo(() => {
    if (!questData) return undefined;
    // If API returns array, take first item, otherwise use as is
    return Array.isArray(questData) ? questData[0] : questData;
  }, [questData]);

  return {
    data: quest,
    isLoading,
    error,
    isFetching,
    isSuccess: isSuccess && !!quest,
    isError,
  };
};

// ============================================================================
// Mutation Hooks
// ============================================================================

export const useCreateQuest = () => {
  const queryClient = useQueryClient();
  const createTaskMutation = useAdminWaitlistTasksControllerCreateTask();
  const queryKey = getAdminWaitlistTasksControllerGetWaitlistTasksQueryKey();
  const { existingQuests } = useExistingQuests();

  return useMutation({
    mutationFn: async (data: QuestFormValues): Promise<TaskResponseDto> => {
      const apiData = validateAndConvertToApi(data, undefined, undefined, existingQuests); // Client-side validation first
      const result = await createTaskMutation.mutateAsync({
        data: apiData as CreateTaskDto,
      });
      return result;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
      toast.success('Quest created successfully');
    },
    onError: (error) => {
      // Handle specific server validation errors
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();

        // Check for duplicate connect quest error
        if (errorMessage.includes('connect') && errorMessage.includes('provider')) {
          toast.error(
            'A Connect quest for this provider already exists. Only one Connect quest per provider is allowed.',
          );
          return;
        }

        // Check for duplicate multiple quest error
        if (errorMessage.includes('multiple') && errorMessage.includes('url')) {
          toast.error(
            'A Multiple quest for this URL already exists. Only one Multiple quest per URL is allowed.',
          );
          return;
        }

        // Generic error
        toast.error(error.message);
      } else {
        toast.error('Failed to create quest');
      }
    },
  });
};

export const useUpdateQuest = (id: number) => {
  const queryClient = useQueryClient();
  const updateTaskMutation = useAdminWaitlistTasksControllerUpdateTask();
  const queryKey = getAdminWaitlistTasksControllerGetWaitlistTasksQueryKey();
  const { existingQuests } = useExistingQuests();

  return useMutation({
    mutationFn: async (data: QuestFormValues): Promise<TaskResponseDto> => {
      const apiData = validateAndConvertToApi(
        data,
        undefined,
        undefined,
        existingQuests,
      ) as UpdateTaskDto; // Client-side validation first
      const result = await updateTaskMutation.mutateAsync({ id, data: apiData });
      return result;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
      toast.success('Quest updated successfully');
    },
    onError: (error) => {
      // Handle specific server validation errors
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();

        // Check for duplicate connect quest error
        if (errorMessage.includes('connect') && errorMessage.includes('provider')) {
          toast.error(
            'A Connect quest for this provider already exists. Only one Connect quest per provider is allowed.',
          );
          return;
        }

        // Check for duplicate multiple quest error
        if (errorMessage.includes('multiple') && errorMessage.includes('url')) {
          toast.error(
            'A Multiple quest for this URL already exists. Only one Multiple quest per URL is allowed.',
          );
          return;
        }

        // Handle conflict errors with special UI
        if (errorMessage.includes('conflict')) {
          toast.error(error.message, {
            action: {
              label: 'Reload form',
              onClick: () => window.location.reload(),
            },
          });
          return;
        }

        // Generic error
        toast.error(error.message);
      } else {
        toast.error('Failed to update quest');
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
        data: { enabled: data.enabled } as UpdateTaskDto, // TODO: P2 - Create proper UpdateTaskDto partial for single field updates
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
        data: { pinned: data.pinned } as UpdateTaskDto, // TODO: P2 - Create proper UpdateTaskDto partial for single field updates
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
