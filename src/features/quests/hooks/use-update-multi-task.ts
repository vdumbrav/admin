/**
 * Multi-task update hook with progress tracking
 * Handles updating parent task + child tasks
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  adminWaitlistTasksControllerCreateTask,
  adminWaitlistTasksControllerDeleteTask,
  adminWaitlistTasksControllerUpdateTask,
  getAdminWaitlistTasksControllerGetWaitlistTasksQueryKey,
} from '@/lib/api/generated/admin/admin';
import type { CreateTaskDto, UpdateTaskDto } from '@/lib/api/generated/model';
import { formToApi } from '../adapters/form-api-adapter';
import { getDefaultButtonText } from '../rules/ui-rules';
import type { ChildFormValues, QuestFormValues } from '../types/form-types';
import type {
  MultiTaskCreationResult,
  MultiTaskCreationState,
  MultiTaskProgressInfo,
} from '../types/multi-task-types';

export const useUpdateMultiTask = (parentId: number, initialChildren?: ChildFormValues[]) => {
  const queryClient = useQueryClient();
  const queryKey = getAdminWaitlistTasksControllerGetWaitlistTasksQueryKey();

  const [state, setState] = useState<MultiTaskCreationState>(() => ({
    main: { status: 'pending' },
    children: [],
    overall: 'idle',
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
  }));

  const parentDataRef = useRef<QuestFormValues | null>(null);

  /**
   * CRITICAL: Store initial children at hook creation time (before any UI deletions)
   * This ref is used to track which child tasks were deleted in the UI.
   *
   * Example flow:
   * 1. Form loads with 21 child tasks → originalChildrenRef = 21 tasks
   * 2. User deletes 14 tasks in UI → form has 7 tasks
   * 3. User saves → compare original 21 vs current 7 = delete 14 tasks via API
   */
  const originalChildrenRef = useRef<ChildFormValues[]>(initialChildren ?? []);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Update originalChildrenRef when initialChildren changes (e.g., after successful save)
   * This keeps the baseline in sync with the latest saved state
   */
  useEffect(() => {
    if (initialChildren && initialChildren.length > 0) {
      originalChildrenRef.current = initialChildren;
    }
  }, [initialChildren]);

  // Helper function to build child resources with proper inheritance
  const buildChildResources = useCallback(
    (child: ChildFormValues, parentData?: QuestFormValues) => {
      const buildChildUI = (baseUI?: NonNullable<QuestFormValues['resources']>['ui']) => {
        /**
         * IMPORTANT: Preserve static image field from child resources
         * The static field contains the uploaded image URL for child tasks.
         * Must check both child.resources and baseUI to avoid data loss.
         */
        const staticImage = child.resources?.ui?.['pop-up']?.static ?? baseUI?.['pop-up']?.static;

        return {
          button: getDefaultButtonText(child.type),
          'pop-up': {
            name: baseUI?.['pop-up']?.name ?? '',
            button: getDefaultButtonText(child.type),
            description: baseUI?.['pop-up']?.description ?? '',
            ...(baseUI?.['pop-up']?.['additional-title'] && {
              'additional-title': baseUI['pop-up']['additional-title'],
            }),
            ...(baseUI?.['pop-up']?.['additional-description'] && {
              'additional-description': baseUI['pop-up']['additional-description'],
            }),
            // Include static image if present (for Task Image uploads)
            ...(staticImage && {
              static: staticImage,
            }),
          },
        };
      };

      if (child.resources) {
        return {
          ...child.resources,
          ui: buildChildUI(child.resources.ui),
        };
      }

      if (parentData?.resources) {
        const { isNew, ui, ...inheritedResources } = parentData.resources;
        return {
          ...inheritedResources,
          ui: buildChildUI(ui),
        };
      }

      return {
        ui: buildChildUI(),
      };
    },
    [],
  );

  // Helper to create/update child task data
  const createChildTaskData = useCallback(
    (child: ChildFormValues, parentTaskId: number, parentData?: QuestFormValues) => {
      const childApiData = {
        type: child.type,
        title: child.title ?? '',
        description: child.description ?? '',
        group: child.group ?? parentData?.group ?? 'all',
        reward: child.reward ?? 0,
        order_by: child.order_by ?? (parentData?.order_by ? parentData.order_by + 1 : 0),

        enabled: child.enabled ?? parentData?.enabled ?? false,
        web: child.web ?? parentData?.web ?? true,
        twa: child.twa ?? parentData?.twa ?? false,
        pinned: child.pinned ?? false,
        level: child.level ?? parentData?.level ?? 1,

        parent_id: parentTaskId,

        provider: child.provider ?? parentData?.provider,

        ...(child.uri && { uri: child.uri }),

        ...((child.icon ?? parentData?.icon) && { icon: child.icon ?? parentData?.icon }),

        ...((child.start ?? parentData?.start) && { start: child.start ?? parentData?.start }),
        ...((child.end ?? parentData?.end) && { end: child.end ?? parentData?.end }),

        resource: buildChildResources(child, parentData),
      };

      return childApiData;
    },
    [buildChildResources],
  );

  // Progress calculation
  const getProgressInfo = useCallback(
    (currentState: MultiTaskCreationState): MultiTaskProgressInfo => {
      const { main, children, completedTasks, totalTasks } = currentState;

      let currentTaskName = '';
      let phase: 'main' | 'children' = 'main';

      if (main.status === 'creating') {
        currentTaskName = 'Updating main task...';
        phase = 'main';
      } else if (main.status === 'success') {
        const creatingChild = children.find((c) => c.status === 'creating');
        if (creatingChild) {
          currentTaskName = `Updating child task: ${creatingChild.data.title ?? `Task ${creatingChild.index + 1}`}`;
          phase = 'children';
        } else {
          currentTaskName = 'Completed';
        }
      }

      const current = completedTasks;
      const percentage = totalTasks > 0 ? Math.round((current / totalTasks) * 100) : 0;

      return {
        current,
        total: totalTasks,
        currentTaskName,
        percentage,
        phase,
      };
    },
    [],
  );

  // Main mutation function
  const mutation = useMutation({
    mutationFn: async (formData: QuestFormValues): Promise<MultiTaskCreationResult> => {
      abortControllerRef.current = new AbortController();

      parentDataRef.current = formData;

      const children = formData.child ?? [];
      const totalTasks = 1 + children.length;

      const { child: _, ...mainData } = formData;
      setState({
        main: {
          status: 'creating',
          data: mainData as QuestFormValues,
        },
        children: children.map((child, index) => ({
          status: 'pending',
          data: child,
          index,
        })),
        overall: 'creating',
        totalTasks,
        completedTasks: 0,
        failedTasks: 0,
      });

      const result: MultiTaskCreationResult = {
        success: false,
        childTasks: [],
        errors: [],
      };

      try {
        // Step 1: Update main task
        const mainTaskData = formToApi(formData);
        const mainTask = await adminWaitlistTasksControllerUpdateTask(
          parentId,
          mainTaskData as UpdateTaskDto,
        );

        result.mainTask = mainTask;

        setState((prev) => ({
          ...prev,
          main: {
            ...prev.main,
            status: 'success',
            result: mainTask,
          },
          completedTasks: 1,
        }));

        // Step 2: Delete removed child tasks
        // Use original children list to find what was deleted
        const originalChildren = originalChildrenRef.current;
        const currentChildIds = children.map((c) => c.id).filter((id): id is number => !!id);
        const childrenToDelete = originalChildren.filter(
          (original) => original.id && !currentChildIds.includes(original.id),
        );

        if (childrenToDelete.length > 0) {
          for (const childToDelete of childrenToDelete) {
            try {
              // childToDelete.id is guaranteed to exist due to filter condition
              if (!childToDelete.id) continue;
              await adminWaitlistTasksControllerDeleteTask(childToDelete.id);
            } catch (error) {
              console.error(`Failed to delete child task #${childToDelete.id}:`, error);
              // Continue with other deletions even if one fails
            }
          }
        }

        // Step 3: Update/Create child tasks
        if (children.length > 0) {
          for (let i = 0; i < children.length; i++) {
            if (abortControllerRef.current?.signal?.aborted) {
              throw new Error('Update cancelled');
            }

            const child = children[i];

            setState((prev) => ({
              ...prev,
              children: prev.children.map((c, idx) =>
                idx === i ? { ...c, status: 'creating', parentId } : c,
              ),
            }));

            try {
              const childTaskData = createChildTaskData(child, parentId, formData);

              // If child has id, update it; otherwise create new
              const childTask = child.id
                ? await adminWaitlistTasksControllerUpdateTask(
                    child.id,
                    childTaskData as unknown as UpdateTaskDto,
                  )
                : await adminWaitlistTasksControllerCreateTask(
                    childTaskData as unknown as CreateTaskDto,
                  );

              result.childTasks.push(childTask);

              setState((prev) => ({
                ...prev,
                children: prev.children.map((c, idx) =>
                  idx === i ? { ...c, status: 'success', result: childTask } : c,
                ),
                completedTasks: prev.completedTasks + 1,
              }));
            } catch (childError) {
              const errorMessage =
                childError instanceof Error ? childError.message : 'Unknown error';
              result.errors.push(`Failed to update child task "${child.title}": ${errorMessage}`);

              setState((prev) => ({
                ...prev,
                children: prev.children.map((c, idx) =>
                  idx === i ? { ...c, status: 'error', error: errorMessage } : c,
                ),
                failedTasks: prev.failedTasks + 1,
              }));
            }
          }
        }

        result.success = result.errors.length === 0;

        setState((prev) => ({
          ...prev,
          overall: result.success ? 'completed' : 'partial_error',
        }));

        return result;
      } catch (mainError) {
        const errorMessage =
          mainError instanceof Error ? mainError.message : 'Failed to update main task';
        result.errors.push(errorMessage);

        setState((prev) => ({
          ...prev,
          main: {
            ...prev.main,
            status: 'error',
            error: errorMessage,
          },
          overall: 'partial_error',
          failedTasks: prev.failedTasks + 1,
        }));

        throw mainError;
      }
    },
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey });

      if (result.success) {
        toast.success(`Quest updated successfully with ${result.childTasks.length} child tasks`);
      } else {
        const successCount = result.childTasks.length;
        const errorCount = result.errors.length;
        toast.warning(
          `Quest updated with ${successCount} successful and ${errorCount} failed child tasks`,
          {
            description: 'Use the retry button to attempt failed tasks again.',
            duration: 5000,
          },
        );
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to update quest';
      toast.error(message, {
        description: 'The quest could not be updated. Please try again.',
      });
    },
  });

  // Retry failed child tasks
  const retryFailedChildren = useCallback(async () => {
    const failedChildren = state.children.filter((c) => c.status === 'error');
    if (failedChildren.length === 0) return;

    setState((prev) => ({
      ...prev,
      overall: 'creating',
    }));

    for (const failedChild of failedChildren) {
      try {
        setState((prev) => ({
          ...prev,
          children: prev.children.map((c) =>
            c.index === failedChild.index ? { ...c, status: 'creating', error: undefined } : c,
          ),
        }));

        const childTaskData = createChildTaskData(
          failedChild.data,
          parentId,
          parentDataRef.current ?? undefined,
        );

        const childTask = failedChild.data.id
          ? await adminWaitlistTasksControllerUpdateTask(
              failedChild.data.id,
              childTaskData as unknown as UpdateTaskDto,
            )
          : await adminWaitlistTasksControllerCreateTask(childTaskData as unknown as CreateTaskDto);

        setState((prev) => ({
          ...prev,
          children: prev.children.map((c) =>
            c.index === failedChild.index ? { ...c, status: 'success', result: childTask } : c,
          ),
          completedTasks: prev.completedTasks + 1,
          failedTasks: prev.failedTasks - 1,
        }));

        toast.success(`Child task "${failedChild.data.title}" updated successfully`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({
          ...prev,
          children: prev.children.map((c) =>
            c.index === failedChild.index ? { ...c, status: 'error', error: errorMessage } : c,
          ),
        }));

        toast.error(`Failed to retry "${failedChild.data.title}": ${errorMessage}`);
      }
    }

    setState((prev) => ({
      ...prev,
      overall: prev.failedTasks === 0 ? 'completed' : 'partial_error',
    }));

    void queryClient.invalidateQueries({ queryKey });
  }, [state.children, createChildTaskData, parentId, queryClient, queryKey]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setState((prev) => ({
      ...prev,
      overall: 'idle',
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      main: { status: 'pending' },
      children: [],
      overall: 'idle',
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
    });
    parentDataRef.current = null;
  }, []);

  return {
    mutateAsync: mutation.mutateAsync,
    state,
    progressInfo: getProgressInfo(state),
    retryFailedChildren,
    cancel,
    reset,
    canRetry: state.failedTasks > 0,
  };
};
