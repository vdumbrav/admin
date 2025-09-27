/**
 * Types for multi-task creation flow
 * Handles sequential creation of main task + child tasks with progress tracking
 */
import type { TaskResponseDto } from '@/lib/api/generated/model';
import type { ChildFormValues, QuestFormValues } from './form-types';

export type TaskCreationStatus = 'pending' | 'creating' | 'success' | 'error' | 'skipped';

export interface MainTaskState {
  status: TaskCreationStatus;
  data?: Omit<QuestFormValues, 'child'>; // Main task without children
  result?: TaskResponseDto;
  error?: string;
}

export interface ChildTaskState {
  status: TaskCreationStatus;
  data: ChildFormValues;
  result?: TaskResponseDto;
  error?: string;
  parentId?: number;
  index: number;
}

export interface MultiTaskCreationState {
  main: MainTaskState;
  children: ChildTaskState[];
  overall: 'idle' | 'creating' | 'completed' | 'partial_error';
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
}

export interface MultiTaskCreationResult {
  success: boolean;
  mainTask?: TaskResponseDto;
  childTasks: TaskResponseDto[];
  errors: string[];
}

export interface MultiTaskProgressInfo {
  current: number;
  total: number;
  currentTaskName: string;
  percentage: number;
  phase: 'main' | 'children';
}
