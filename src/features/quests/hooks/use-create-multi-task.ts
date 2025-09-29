/**
 * Multi-task creation hook with progress tracking
 * Handles sequential creation of main task + child tasks
 */
import { useCallback, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  adminWaitlistTasksControllerCreateTask,
  getAdminWaitlistTasksControllerGetWaitlistTasksQueryKey,
} from '@/lib/api/generated/admin/admin';
import type { CreateTaskDto } from '@/lib/api/generated/model';
import { formToApi } from '../adapters/form-api-adapter';
import { getDefaultButtonText } from '../rules/ui-rules';
import type { ChildFormValues, QuestFormValues } from '../types/form-types';
import type {
  MultiTaskCreationResult,
  MultiTaskCreationState,
  MultiTaskProgressInfo,
} from '../types/multi-task-types';

export const useCreateMultiTask = () => {
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

  // Store parent data for retry operations
  const parentDataRef = useRef<QuestFormValues | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Helper function to build child resources with proper inheritance
  const buildChildResources = useCallback(
    (child: ChildFormValues, parentData?: QuestFormValues) => {
      // Build base UI structure with child-specific buttons
      const buildChildUI = (baseUI?: NonNullable<QuestFormValues['resources']>['ui']) => ({
        button: getDefaultButtonText(child.type), // Always child-specific
        'pop-up': {
          name: baseUI?.['pop-up']?.name ?? '',
          button: getDefaultButtonText(child.type), // Always child-specific
          description: baseUI?.['pop-up']?.description ?? '',
          // Include additional fields only if they exist in base
          ...(baseUI?.['pop-up']?.['additional-title'] && {
            'additional-title': baseUI['pop-up']['additional-title'],
          }),
          ...(baseUI?.['pop-up']?.['additional-description'] && {
            'additional-description': baseUI['pop-up']['additional-description'],
          }),
        },
      });

      // Case 1: Child has its own resources - use them but adapt UI buttons
      if (child.resources) {
        return {
          ...child.resources,
          ui: buildChildUI(child.resources.ui),
        };
      }

      // Case 2: Inherit from parent resources
      if (parentData?.resources) {
        const { isNew, ui, ...inheritedResources } = parentData.resources;
        return {
          ...inheritedResources,
          ui: buildChildUI(ui),
        };
      }

      // Case 3: No resources available - create minimal structure
      return {
        ui: buildChildUI(),
      };
    },
    [],
  );

  // Helper to create child task data with parent_id and inheritance from parent
  const createChildTaskData = useCallback(
    (child: ChildFormValues, parentId: number, parentData?: QuestFormValues) => {
      const childApiData = {
        // Core required fields for CreateTaskDto
        type: child.type,
        title: child.title ?? '',
        description: child.description ?? '',
        group: child.group ?? parentData?.group ?? 'all',
        reward: child.reward ?? 0,
        order_by: child.order_by ?? (parentData?.order_by ? parentData.order_by + 1 : 0),

        // Platform settings - smart inheritance from parent
        enabled: child.enabled ?? parentData?.enabled ?? false, // Inherit enabled state from parent
        web: child.web ?? parentData?.web ?? true,
        twa: child.twa ?? parentData?.twa ?? false,
        pinned: child.pinned ?? false, // Child tasks rarely pinned
        level: child.level ?? parentData?.level ?? 1,

        // Parent relationship - required for like/comment/share types due to @ValidateIf()
        parent_id: parentId,

        // Provider inheritance - use child first, fallback to parent
        provider: child.provider ?? parentData?.provider,

        // Optional fields with proper inheritance
        ...(child.uri && { uri: child.uri }),
        ...(parentData?.blocking_task && { blocking_task: parentData.blocking_task }),

        // Icon inheritance: use child icon if set, otherwise inherit from parent
        ...((child.icon ?? parentData?.icon) && { icon: child.icon ?? parentData?.icon }),

        // Schedule inheritance: inherit time frames from parent if not set on child
        ...((child.start ?? parentData?.start) && { start: child.start ?? parentData?.start }),
        ...((child.end ?? parentData?.end) && { end: child.end ?? parentData?.end }),

        // Resource inheritance with smart merging
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
        currentTaskName = 'Creating main task...';
        phase = 'main';
      } else if (main.status === 'success') {
        const creatingChild = children.find((c) => c.status === 'creating');
        if (creatingChild) {
          currentTaskName = `Creating child task: ${creatingChild.data.title || `Task ${creatingChild.index + 1}`}`;
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
      // Initialize abort controller
      abortControllerRef.current = new AbortController();

      // Store parent data for retry operations
      parentDataRef.current = formData;

      const children = formData.child ?? [];
      const totalTasks = 1 + children.length; // main + children

      // Initialize state
      const { child: _, ...mainData } = formData;
      setState({
        main: {
          status: 'creating',
          data: mainData as QuestFormValues, // Remove child from main data
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
        // Step 1: Create main task
        // Pass full formData to formToApi so it can extract static from child, but formToApi will exclude child from output
        const mainTaskData = formToApi(formData); // Auto-detects CREATE (no ID)
        const mainTask = await adminWaitlistTasksControllerCreateTask(
          mainTaskData as CreateTaskDto,
          abortControllerRef.current?.signal,
        );

        result.mainTask = mainTask;

        // Update state after main task creation
        setState((prev) => ({
          ...prev,
          main: {
            ...prev.main,
            status: 'success',
            result: mainTask,
          },
          completedTasks: 1,
        }));

        // Step 2: Create child tasks sequentially
        if (children.length > 0) {
          for (let i = 0; i < children.length; i++) {
            // Check if aborted
            if (abortControllerRef.current?.signal?.aborted) {
              throw new Error('Creation cancelled');
            }

            const child = children[i];

            // Update state to show current child being created
            setState((prev) => ({
              ...prev,
              children: prev.children.map((c, idx) =>
                idx === i ? { ...c, status: 'creating', parentId: mainTask.id } : c,
              ),
            }));

            try {
              const childTaskData = createChildTaskData(child, mainTask.id, formData);
              const childTask = await adminWaitlistTasksControllerCreateTask(
                childTaskData as unknown as CreateTaskDto,
                abortControllerRef.current?.signal,
              );

              result.childTasks.push(childTask);

              // Update state after successful child creation
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
              result.errors.push(`Failed to create child task "${child.title}": ${errorMessage}`);

              // Update state after failed child creation
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

        // Determine overall success
        result.success = result.errors.length === 0;

        // Update final state
        setState((prev) => ({
          ...prev,
          overall: result.success ? 'completed' : 'partial_error',
        }));

        return result;
      } catch (mainError) {
        const errorMessage =
          mainError instanceof Error ? mainError.message : 'Failed to create main task';
        result.errors.push(errorMessage);

        // Update state after main task failure
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
        toast.success(`Quest created successfully with ${result.childTasks.length} child tasks`);
      } else {
        const successCount = result.childTasks.length;
        const errorCount = result.errors.length;
        toast.warning(
          `Quest created with ${successCount} successful and ${errorCount} failed child tasks`,
          {
            description: 'Use the retry button to attempt failed tasks again.',
            duration: 5000,
          },
        );
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to create quest';
      toast.error(message, {
        description: 'The main quest could not be created. Please try again.',
        duration: 5000,
      });
    },
  });

  // Retry failed child tasks
  const retryFailedChildren = useCallback(async () => {
    if (!state.main.result) return;

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
          state.main.result?.id,
          parentDataRef.current ?? undefined,
        );
        const childTask = await adminWaitlistTasksControllerCreateTask(
          childTaskData as unknown as CreateTaskDto,
          abortControllerRef.current?.signal,
        );

        setState((prev) => ({
          ...prev,
          children: prev.children.map((c) =>
            c.index === failedChild.index ? { ...c, status: 'success', result: childTask } : c,
          ),
          completedTasks: prev.completedTasks + 1,
          failedTasks: prev.failedTasks - 1,
        }));

        toast.success(`Child task "${failedChild.data.title}" created successfully`);
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
  }, [state, createChildTaskData, queryClient, queryKey]);

  // Cancel creation
  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setState((prev) => ({ ...prev, overall: 'idle' }));
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setState({
      main: { status: 'pending' },
      children: [],
      overall: 'idle',
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
    });
  }, []);

  return {
    // Mutation
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,

    // State
    state,
    progressInfo: getProgressInfo(state),

    // Actions
    retryFailedChildren,
    cancel,
    reset,

    // Computed
    hasFailedTasks: state.failedTasks > 0,
    canRetry: state.overall === 'partial_error' && state.failedTasks > 0,
    isComplete: state.overall === 'completed',
  };
};
