import type { TaskResponseDto } from '@/lib/api/generated/model';

export { type TaskResponseDto as Quest } from '@/lib/api/generated/model';

// Temporary: Quest with date fields until API supports them
export type { QuestWithDates } from '../types/quest-with-dates';

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

// ============================================================================
// Utility types
// ============================================================================

export interface DropdownOption {
  value: string;
  label: string;
}

export interface QuestsResponse {
  items: TaskResponseDto[];
  total: number;
}

export interface LocalSortConfig {
  field: keyof TaskResponseDto;
  direction: 'asc' | 'desc';
}

export interface QuestQuery {
  // Client-side filtering - no server-side filtering needed
  search?: string;
  group?: string;
  type?: string;
  provider?: string;
  enabled?: boolean;

  // Client-side pagination (small dataset ~50-200 items)
  page?: number;
  limit?: number;

  // Client-side sorting - no server support needed
  sort?: string;
}
