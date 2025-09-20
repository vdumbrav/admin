import * as React from 'react';
import { Cross2Icon } from '@radix-ui/react-icons';
import { type Column, type Table } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { DataTableFacetedFilter } from '@/components/table/data-table-faceted-filter';
import { DataTableViewOptions } from '@/components/table/data-table-view-options';
import { useQuests } from '../api';
import { groups, providers, types, visibilities } from '../data/data';
import { useFilters } from '../hooks/use-filters';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export const DataTableToolbar = <TData,>({ table }: DataTableToolbarProps<TData>) => {
  const {
    group,
    type,
    provider,
    visible,
    resetFilters,
    setGroup,
    setType,
    setProvider,
    setVisible,
  } = useFilters();

  // Get all data without filters for counting
  const { data: allData } = useQuests({
    search: '',
    group: undefined,
    type: undefined,
    provider: undefined,
    visible: undefined,
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

    // Add 'all' count
    counts.set('all', allData.items.length);

    return counts;
  }, [allData?.items]);

  const getTypeCounts = React.useMemo(() => {
    if (!allData?.items) return new Map();
    const counts = new Map<string, number>();

    allData.items.forEach((item) => {
      if (item.type && Array.isArray(item.type)) {
        item.type.forEach((t) => {
          counts.set(t, (counts.get(t) ?? 0) + 1);
        });
      }
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

  const getVisibleCounts = React.useMemo(() => {
    if (!allData?.items) return new Map();
    const counts = new Map<string, number>();

    allData.items.forEach((item) => {
      if (item.visible !== undefined && item.visible !== null) {
        const visibleValue = item.visible.toString();
        counts.set(visibleValue, (counts.get(visibleValue) ?? 0) + 1);
      }
    });

    return counts;
  }, [allData?.items]);

  // Create virtual columns for the filters
  const virtualGroupColumn = React.useMemo(
    () => ({
      getFilterValue: () => (group === 'all' ? undefined : [group]),
      setFilterValue: (value: unknown) => {
        const arr = value as string[];
        if (!arr || arr.length === 0) {
          setGroup('all');
        } else {
          setGroup(arr[0]);
        }
      },
      getFacetedUniqueValues: () => getGroupCounts,
    }),
    [group, setGroup, getGroupCounts],
  );

  const virtualTypeColumn = React.useMemo(
    () => ({
      getFilterValue: () => (type ? type.split(',') : undefined),
      setFilterValue: (value: unknown) => {
        const arr = value as string[];
        if (!arr || arr.length === 0) {
          setType('');
        } else {
          setType(arr.join(','));
        }
      },
      getFacetedUniqueValues: () => getTypeCounts,
    }),
    [type, setType, getTypeCounts],
  );

  const virtualProviderColumn = React.useMemo(
    () => ({
      getFilterValue: () => (provider ? [provider] : undefined),
      setFilterValue: (value: unknown) => {
        const arr = value as string[];
        if (!arr || arr.length === 0) {
          setProvider('');
        } else {
          setProvider(arr[0]);
        }
      },
      getFacetedUniqueValues: () => getProviderCounts,
    }),
    [provider, setProvider, getProviderCounts],
  );

  const virtualVisibleColumn = React.useMemo(
    () => ({
      getFilterValue: () => (visible ? [visible] : undefined),
      setFilterValue: (value: unknown) => {
        const arr = value as string[];
        if (!arr || arr.length === 0) {
          setVisible('');
        } else {
          setVisible(arr[0]);
        }
      },
      getFacetedUniqueValues: () => getVisibleCounts,
    }),
    [visible, setVisible, getVisibleCounts],
  );

  const hasFilters = group !== 'all' || type || provider || visible;

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <div className='flex gap-x-2'>
          <DataTableFacetedFilter
            column={virtualGroupColumn as Column<unknown, unknown>}
            title='Group'
            options={groups}
            multiple={false}
          />
          <DataTableFacetedFilter
            column={virtualTypeColumn as Column<unknown, unknown>}
            title='Type'
            options={types}
            multiple={true}
          />
          <DataTableFacetedFilter
            column={virtualProviderColumn as Column<unknown, unknown>}
            title='Provider'
            options={providers}
            multiple={false}
          />
          <DataTableFacetedFilter
            column={virtualVisibleColumn as Column<unknown, unknown>}
            title='Visible'
            options={visibilities}
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
