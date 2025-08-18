import * as React from 'react'
import { useSearch } from '@tanstack/react-router'
import { QuestSearch, defaultQuestSearch } from './default-search'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
