import * as React from 'react'
import { useSearch } from '@tanstack/react-router'

interface UseQuestSearchOptions<Path extends string> {
  from: Path
}

export const useQuestSearch = <Path extends string>(
  options: UseQuestSearchOptions<Path>
) => {
  const search = useSearch(options)
  return React.useMemo(() => {
    const { page, sort, ...rest } = search
    const result: Record<string, unknown> = { ...rest }
    if (page && page !== 1) result.page = page
    if (sort && sort !== 'order_by:asc') result.sort = sort
    return result
  }, [search])
}
