import { useSearch } from '@tanstack/react-router'

interface UseQuestSearchOptions<Path extends string> {
  from: Path
}

export const useQuestSearch = <Path extends string>(
  options: UseQuestSearchOptions<Path>
) => {
  const { highlight: _highlight, ...search } = useSearch(options)
  return search
}
