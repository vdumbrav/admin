import * as React from 'react';
import { Cross2Icon } from '@radix-ui/react-icons';
import { type Column, type Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { DataTableFacetedFilter } from '@/components/table/data-table-faceted-filter';
import { DataTableViewOptions } from '@/components/table/data-table-view-options';
import { useQuests } from '../api';
import { enabledOptions, groups, providers, types } from '../data/data';
import { useFilters } from '../hooks/use-filters';
import { createVirtualColumn } from '../utils/virtual-column-helper';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export const DataTableToolbar = <TData,>({ table }: DataTableToolbarProps<TData>) => {
  const {
    group,
    type,
    provider,
    enabled,
    resetFilters,
    setGroup,
    setType,
    setProvider,
    setEnabled,
  } = useFilters();

  // Get all data without filters for counting
  const { data: allData } = useQuests({
    search: '',
    group: undefined,
    type: undefined,
    provider: undefined,
    enabled: undefined,
    page: 1,
    limit: 1000, // Get all items for counting
    sort: 'order_by:asc',
  });

  // Count functions for real data
  const getGroupCounts = React.useMemo(() => {
    if (!allData?.items) return new Map();
    const counts = new Map<string, number>();

    allData.items.forEach((item) => {
      const groupValue = item.group;
      counts.set(groupValue, (counts.get(groupValue) ?? 0) + 1);
    });

    return counts;
  }, [allData?.items]);

  const getTypeCounts = React.useMemo(() => {
    if (!allData?.items) return new Map();
    const counts = new Map<string, number>();

    allData.items.forEach((item) => {
      const type = item.type;
      counts.set(type, (counts.get(type) ?? 0) + 1);
    });

    return counts;
  }, [allData?.items]);

  const getProviderCounts = React.useMemo(() => {
    if (!allData?.items) return new Map();
    const counts = new Map<string, number>();

    allData.items.forEach((item) => {
      if (item.provider) {
        const providerValue = item.provider;
        counts.set(providerValue, (counts.get(providerValue) ?? 0) + 1);
      }
    });

    return counts;
  }, [allData?.items]);

  const getEnabledCounts = React.useMemo(() => {
    if (!allData?.items) return new Map();
    const counts = new Map<string, number>();

    allData.items.forEach((item) => {
      if (item.enabled !== undefined) {
        const enabledValue = item.enabled.toString();
        counts.set(enabledValue, (counts.get(enabledValue) ?? 0) + 1);
      }
    });

    return counts;
  }, [allData?.items]);

  // Create virtual columns using the helper
  const virtualGroupColumn = React.useMemo(
    () =>
      createVirtualColumn({
        currentValue: group,
        setValue: setGroup,
        getCounts: () => getGroupCounts,
        isMultiple: true,
      }),
    [group, setGroup, getGroupCounts],
  );

  const virtualTypeColumn = React.useMemo(
    () =>
      createVirtualColumn({
        currentValue: type,
        setValue: setType,
        getCounts: () => getTypeCounts,
        isMultiple: true,
      }),
    [type, setType, getTypeCounts],
  );

  const virtualProviderColumn = React.useMemo(
    () =>
      createVirtualColumn({
        currentValue: provider,
        setValue: setProvider,
        getCounts: () => getProviderCounts,
        isMultiple: true,
      }),
    [provider, setProvider, getProviderCounts],
  );

  const virtualEnabledColumn = React.useMemo(
    () =>
      createVirtualColumn({
        currentValue: enabled,
        setValue: setEnabled,
        getCounts: () => getEnabledCounts,
        isMultiple: false,
      }),
    [enabled, setEnabled, getEnabledCounts],
  );

  const hasFilters = group || type || provider || enabled;

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <div className='flex gap-x-2'>
          <DataTableFacetedFilter
            column={virtualGroupColumn as Column<unknown, unknown>} // TODO: P2 - Create proper typed virtual column interface
            title='Group'
            options={groups}
            multiple={true}
          />
          <DataTableFacetedFilter
            column={virtualTypeColumn as Column<unknown, unknown>} // TODO: P2 - Create proper typed virtual column interface
            title='Type'
            options={types}
            multiple={true}
          />
          <DataTableFacetedFilter
            column={virtualProviderColumn as Column<unknown, unknown>} // TODO: P2 - Create proper typed virtual column interface
            title='Provider'
            options={providers}
            multiple={true}
          />
          <DataTableFacetedFilter
            column={virtualEnabledColumn as Column<unknown, unknown>} // TODO: P2 - Create proper typed virtual column interface
            title='Visible'
            options={enabledOptions}
            multiple={false}
          />
        </div>
        {hasFilters && (
          <Button
            variant='ghost'
            onClick={resetFilters}
            className='h-8 px-2 text-sm leading-5 font-medium lg:px-3'
            aria-label='Clear all filters'
          >
            Reset
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <div className='flex items-center gap-2'>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
};
