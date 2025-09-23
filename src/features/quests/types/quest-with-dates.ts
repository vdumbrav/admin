/**
 * Temporary extension of TaskResponseDto to include date fields
 * Until API schema includes started_at/completed_at fields
 */
import type { TaskResponseDto } from '@/lib/api/generated/model';

export interface QuestWithDates extends TaskResponseDto {
  /** Task start date */
  started_at?: string;
  /** Task completion date */
  completed_at?: string;
}

/**
 * Type guard to check if a quest has date fields
 */
export function isQuestWithDates(_quest: TaskResponseDto): _quest is QuestWithDates {
  return true; // All quests can potentially have dates
}

/**
 * Safely get start date from quest
 */
export function getQuestStartDate(quest: TaskResponseDto): string | undefined {
  return (quest as QuestWithDates).started_at;
}

/**
 * Safely get end date from quest
 */
export function getQuestEndDate(quest: TaskResponseDto): string | undefined {
  return (quest as QuestWithDates).completed_at;
}
