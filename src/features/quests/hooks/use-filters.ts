import * as React from 'react';

export interface FiltersContextType {
  // Current filter values
  search: string;
  group: string;
  type: string;
  provider: string;
  visible: string;
  page: number;
  limit: number;
  sort: string;

  // Actions
  setSearch: (value: string) => void;
  setGroup: (value: string) => void;
  setType: (value: string) => void;
  setProvider: (value: string) => void;
  setVisible: (value: string) => void;
  setPage: (value: number) => void;
  setLimit: (value: number) => void;
  setSort: (value: string) => void;
  resetFilters: () => void;
}

export const FiltersContext = React.createContext<FiltersContextType | null>(null);

export function useFilters() {
  const context = React.useContext(FiltersContext);
  if (!context) {
    throw new Error('useFilters must be used within a FiltersProvider');
  }
  return context;
}
