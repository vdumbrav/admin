import * as React from 'react';
import { useRouter, useSearch } from '@tanstack/react-router';
import type { QuestSearch } from '../default-search';
import { FiltersContext, type FiltersContextType } from '../hooks/use-filters';

interface Props {
  children: React.ReactNode;
}

export function FiltersProvider({ children }: Props) {
  const router = useRouter();
  const searchParams = useSearch({
    from: '/_authenticated/quests/' as const,
  }) as unknown as QuestSearch;

  // Local state for search input with debounce
  const [searchValue, setSearchValue] = React.useState(searchParams.search ?? '');
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  // Update URL with all filters
  const updateFilters = React.useCallback(
    (updates: Partial<QuestSearch>) => {
      void router.navigate({
        to: '/quests',
        search: (prev) => ({
          ...prev,
          ...updates,
        }),
        replace: true,
      });
    },
    [router],
  );

  // Debounced search update
  const setSearch = React.useCallback(
    (value: string) => {
      setSearchValue(value);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        const trimmedSearch = value.trim() || undefined;
        updateFilters({ search: trimmedSearch, page: 1 });
      }, 300);
    },
    [updateFilters],
  );

  // Immediate filter updates
  const setGroup = React.useCallback(
    (value: string) => {
      updateFilters({ group: value === 'all' ? undefined : value, page: 1 });
    },
    [updateFilters],
  );

  const setType = React.useCallback(
    (value: string) => {
      // Handle comma-separated multiple values
      const cleanValue = value ? value.split(',').filter(Boolean).join(',') : undefined;
      updateFilters({ type: cleanValue, page: 1 });
    },
    [updateFilters],
  );

  const setProvider = React.useCallback(
    (value: string) => {
      updateFilters({ provider: value || undefined, page: 1 });
    },
    [updateFilters],
  );

  const setVisible = React.useCallback(
    (value: string) => {
      updateFilters({ visible: value || undefined, page: 1 });
    },
    [updateFilters],
  );

  const setPage = React.useCallback(
    (value: number) => {
      updateFilters({ page: value });
    },
    [updateFilters],
  );

  const setLimit = React.useCallback(
    (value: number) => {
      updateFilters({ limit: value, page: 1 });
    },
    [updateFilters],
  );

  const setSort = React.useCallback(
    (value: string) => {
      updateFilters({ sort: value, page: 1 });
    },
    [updateFilters],
  );

  const resetFilters = React.useCallback(() => {
    setSearchValue('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    updateFilters({
      search: undefined,
      group: undefined,
      type: undefined,
      provider: undefined,
      visible: undefined,
      page: 1,
      limit: 25, // Reset to default page size
    });
  }, [updateFilters]);

  // Sync search input with URL (only from external changes)
  React.useEffect(() => {
    const urlSearch = searchParams.search ?? '';
    if (!timeoutRef.current && urlSearch !== searchValue) {
      setSearchValue(urlSearch);
    }
  }, [searchParams.search, searchValue]);

  // Cleanup timeout
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const value: FiltersContextType = {
    // Current values from URL
    search: searchValue, // Use local state for search input
    group: searchParams.group ?? 'all',
    type: searchParams.type ?? '',
    provider: searchParams.provider ?? '',
    visible: searchParams.visible ?? '',
    page: searchParams.page ?? 1,
    limit: searchParams.limit ?? 25,
    sort: searchParams.sort ?? 'order_by:asc',

    // Actions
    setSearch,
    setGroup,
    setType,
    setProvider,
    setVisible,
    setPage,
    setLimit,
    setSort,
    resetFilters,
  };

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}
