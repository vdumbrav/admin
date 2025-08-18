import * as React from 'react'
import { useSearch } from '@tanstack/react-router'
import { QuestSearch, defaultQuestSearch } from './default-search'

export const useQuestSearch = (options: any) => {
  const search = useSearch(options) as QuestSearch
  return React.useMemo(() => {
    const result: QuestSearch = {
      ...defaultQuestSearch,
      ...search,
    }
    return result
  }, [search])
}
