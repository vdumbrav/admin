import type {
  AdminWaitlistTasksResponseDto,
  AdminWaitlistTasksResponseDtoGroup,
  AdminWaitlistTasksResponseDtoProvider,
  AdminWaitlistTasksResponseDtoStatus,
  AdminWaitlistTasksResponseDtoTypeItem,
} from '@/lib/api/generated/model';

// ============================================================================
// UI-specific types for form compatibility
// ============================================================================

export interface PopUp {
  name: string;
  button: string;
  description: string;
  static?: string;
  'additional-title'?: string;
  'additional-description'?: string;
}

export interface UIResources {
  'pop-up'?: PopUp;
  button: string;
}

export interface AdsGramResource {
  type: 'task' | 'reward';
  subtype?: 'video-ad' | 'post-style-image';
}

export interface Resources {
  ui?: UIResources;
  icon?: string;
  tweetId?: string;
  username?: string;
  isNew?: boolean;
  block_id?: string;
  adsgram?: AdsGramResource;
}

export interface IteratorDaily {
  day: number;
  days: number;
  reward_map: number[];
  reward_max: number;
  reward: number;
  tick?: number;
}

// ============================================================================
// Form-compatible types (derived from API types where possible)
// ============================================================================

// Using API type directly where possible
export type TaskType = AdminWaitlistTasksResponseDtoTypeItem;
export type TaskGroup = Exclude<AdminWaitlistTasksResponseDtoGroup, 'all'>; // Form type excludes 'all'
export type UIGroup = AdminWaitlistTasksResponseDtoGroup; // UI type includes 'all' from API
export type TaskProvider = AdminWaitlistTasksResponseDtoProvider;
export type TaskStatus = AdminWaitlistTasksResponseDtoStatus;

// Form-compatible Task interface (mixing API types with form requirements)
export interface Task {
  id?: number;
  type: TaskType;
  title: string;
  description: string | null;
  blocking_task?: number | null;
  reward?: number;
  level?: number;
  group: TaskGroup;
  order_by: number;
  provider?: TaskProvider;
  uri?: string | null;
  status?: TaskStatus;
  error?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  next_tick?: string | null;
  resources?: Resources | null;
  child?: Array<Task> | null;
  iterable?: boolean | null;
  iterator?: IteratorDaily | null;
  providerCapitalized?: string;
  visible?: boolean;
}

// ============================================================================
// API-compatible types
// ============================================================================

// Extended Quest type with additional UI fields
export type Quest = AdminWaitlistTasksResponseDto & {
  visible?: boolean; // UI-only field for visibility toggle
  pinned?: boolean;
  usersCount?: number;
  totalXp?: number;
  startDate?: string | null;
  endDate?: string | null;
  webEnabled?: boolean;
  tmaEnabled?: boolean;
  locked?: boolean;
};

// ============================================================================
// Utility types
// ============================================================================

export interface DropdownOption {
  value: string;
  label: string;
}

export interface QuestsResponse {
  items: Quest[];
  total: number;
}

// ============================================================================
// Query types
// ============================================================================

// ============================================================================
// Frontend-only query and sorting types (no server-side support needed)
// ============================================================================

export interface LocalSortConfig {
  field: keyof Quest;
  direction: 'asc' | 'desc';
}

export interface LocalPaginationConfig {
  page: number;
  limit: number;
}

export interface LocalFilterConfig {
  search?: string;
  group?: UIGroup;
  type?: string;
  provider?: string;
  visible?: boolean;
}

export interface QuestQuery extends LocalFilterConfig, Partial<LocalPaginationConfig> {
  sort?: string; // Format: "field:direction" e.g., "title:asc", "order_by:desc"
}
