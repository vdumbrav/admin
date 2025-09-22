import type { TaskResponseDto } from '@/lib/api/generated/model';

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

export type Quest = TaskResponseDto & {
  usersCount?: number; // Display-only field
  totalXp?: number; // Display-only field
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

export interface LocalSortConfig {
  field: keyof Quest;
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
