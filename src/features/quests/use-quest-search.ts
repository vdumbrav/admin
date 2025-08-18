import { useSearch } from '@tanstack/react-router'
import type { QuestSearch } from './default-search'

interface UseQuestSearchOptions {
  from:
    | '/_authenticated/quests/'
    | '/_authenticated/quests/new'
    | '/_authenticated/quests/$id'
}

export const useQuestSearch = (options: UseQuestSearchOptions): QuestSearch => {
  return useSearch(options) as QuestSearch
}
