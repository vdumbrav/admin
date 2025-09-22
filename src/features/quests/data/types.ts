import type {
  TaskResponseDto,
  TaskResponseDtoGroup,
  TaskResponseDtoProvider,
  TaskResponseDtoStatus,
  TaskResponseDtoTypeItem,
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
export type TaskType = TaskResponseDtoTypeItem;
export type TaskGroup = Exclude<TaskResponseDtoGroup, 'all'>; // Form type excludes 'all'
export type UIGroup = TaskResponseDtoGroup; // UI type includes 'all' from API
export type TaskProvider = TaskResponseDtoProvider;
export type TaskStatus = TaskResponseDtoStatus;

// ============================================================================
// API-compatible types
// ============================================================================

// Quest extends API response with additional fields not yet in API
export type Quest = TaskResponseDto & {
  usersCount?: number;
  totalXp?: number;
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
  enabled?: boolean;
}

export interface QuestQuery extends LocalFilterConfig, Partial<LocalPaginationConfig> {
  sort?: string; // Format: "field:direction" e.g., "title:asc", "order_by:desc"
}
