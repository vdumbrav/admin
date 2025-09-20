import * as React from 'react';
import { Spinner } from '@radix-ui/themes';
import { Link, useRouter, useSearch } from '@tanstack/react-router';
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import { loadJSON, LS_TABLE_SIZE, LS_TABLE_SORT, LS_TABLE_VIS, saveJSON } from '@/utils/persist';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from '@/components/table/data-table-pagination';
import { useQuests } from '../api';
import type { Quest, TaskGroup } from '../data/types';
import { DataTableToolbar } from './data-table-toolbar';

interface DataTableProps {
  columns: ColumnDef<Quest>[];
  isAdmin: boolean;
}

const getSafePageCount = (total: number | undefined, size: number) =>
  Math.max(1, Math.ceil((total ?? 0) / size));

export const QuestsDataTable = ({ columns, isAdmin }: DataTableProps) => {
  const isEqualJSON = React.useCallback((a: unknown, b: unknown) => {
    return JSON.stringify(a) === JSON.stringify(b);
  }, []);
  const isEqualSorting = React.useCallback((a: SortingState, b: SortingState) => {
    return a.length === b.length && a.every((s, i) => s.id === b[i]?.id && s.desc === b[i]?.desc);
  }, []);

  const router = useRouter();
  const searchParams = useSearch({ from: '/_authenticated/quests/' as const });
  const memoColumns = React.useMemo(() => columns, [columns]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(() =>
    loadJSON(LS_TABLE_VIS, {}),
  );
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(() => {
    const init: ColumnFiltersState = [];
    if (searchParams.search) init.push({ id: 'title', value: searchParams.search });
    if (searchParams.group && searchParams.group !== 'all')
      init.push({ id: 'group', value: [searchParams.group] });
    if (searchParams.type) init.push({ id: 'type', value: [searchParams.type] });
    if (searchParams.provider) init.push({ id: 'provider', value: [searchParams.provider] });
    if (searchParams.visible) init.push({ id: 'visible', value: [searchParams.visible] });
    return init;
  });
  const [sorting, setSorting] = React.useState<SortingState>(() => {
    const s = searchParams.sort ?? loadJSON(LS_TABLE_SORT, 'order_by:asc');
    const [id, dir] = s.split(':');
    return [{ id, desc: dir === 'desc' }];
  });
  const pageSizeFromStorage = loadJSON(LS_TABLE_SIZE, 20);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: (searchParams.page ?? 1) - 1,
    pageSize: searchParams.limit ?? pageSizeFromStorage,
  });

  const pickSingle = (id: string, fallback = ''): string => {
    const raw = columnFilters.find((f) => f.id === id)?.value;
    if (Array.isArray(raw)) return (raw[0] ?? fallback) as string;
    if (typeof raw === 'string') return raw;
    return fallback;
  };

  const search = pickSingle('title').trim();
  const group = pickSingle('group', 'all') as TaskGroup | 'all';
  const type = pickSingle('type', '');
  const provider = pickSingle('provider', '');
  const visibleParam = pickSingle('visible', '');
  const visible = visibleParam === 'true' ? true : visibleParam === 'false' ? false : undefined;
  const sort = sorting[0] ? `${sorting[0].id}:${sorting[0].desc ? 'desc' : 'asc'}` : 'order_by:asc';

  const { data, isFetching, isLoading } = useQuests({
    search,
    group,
    type,
    provider,
    visible,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sort,
  });

  React.useEffect(() => {
    saveJSON(LS_TABLE_VIS, columnVisibility);
  }, [columnVisibility]);

  React.useEffect(() => {
    saveJSON(LS_TABLE_SIZE, pagination.pageSize);
  }, [pagination.pageSize]);

  React.useEffect(() => {
    saveJSON(LS_TABLE_SORT, sort);
  }, [sort]);

  React.useEffect(() => {
    const nextFilters: ColumnFiltersState = [];
    if (searchParams.search) nextFilters.push({ id: 'title', value: searchParams.search });
    if (searchParams.group && searchParams.group !== 'all')
      nextFilters.push({ id: 'group', value: [searchParams.group] });
    if (searchParams.type) nextFilters.push({ id: 'type', value: [searchParams.type] });
    if (searchParams.provider) nextFilters.push({ id: 'provider', value: [searchParams.provider] });
    if (searchParams.visible) nextFilters.push({ id: 'visible', value: [searchParams.visible] });
    setColumnFilters((prev) => (isEqualJSON(prev, nextFilters) ? prev : nextFilters));
    const s = searchParams.sort ?? 'order_by:asc';
    const [id, dir] = s.split(':');
    const nextSorting: SortingState = [{ id, desc: dir === 'desc' }];
    setSorting((prev) => (isEqualSorting(prev, nextSorting) ? prev : nextSorting));
    const nextPag = {
      pageIndex: (searchParams.page ?? 1) - 1,
      pageSize: searchParams.limit ?? pageSizeFromStorage,
    };
    setPagination((prev) =>
      prev.pageIndex === nextPag.pageIndex && prev.pageSize === nextPag.pageSize ? prev : nextPag,
    );
  }, [searchParams, pageSizeFromStorage, isEqualJSON, isEqualSorting]);

  React.useEffect(() => {
    const next = {
      search,
      group,
      type,
      provider,
      visible: visible === undefined ? '' : visible.toString(),
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sort,
      showForm: false, // Always false for data table navigation
    };
    const same =
      next.search === searchParams.search &&
      next.group === searchParams.group &&
      next.type === searchParams.type &&
      next.provider === searchParams.provider &&
      next.visible === searchParams.visible &&
      next.page === searchParams.page &&
      next.limit === searchParams.limit &&
      next.sort === searchParams.sort;
    if (!same) {
      void router.navigate({
        to: '/quests',
        search: next,
        replace: true,
      });
    }
  }, [search, group, type, provider, visible, pagination, sort, router, searchParams]);

  const table = useReactTable({
    data: data?.items ?? [],
    columns: memoColumns,
    pageCount: getSafePageCount(data?.total, pagination.pageSize),
    state: { sorting, columnVisibility, columnFilters, pagination },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: (updater) =>
      setSorting((old) => {
        const next = typeof updater === 'function' ? updater(old) : updater;
        const changed = !isEqualSorting(old, next);
        if (changed) {
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }
        return changed ? next : old;
      }),
    onColumnFiltersChange: (updater) =>
      setColumnFilters((old) => {
        const next = typeof updater === 'function' ? updater(old) : updater;
        const changed = !isEqualJSON(old, next);
        if (changed) {
          setPagination((p) => ({ ...p, pageIndex: 0 }));
        }
        return changed ? next : old;
      }),
    autoResetPageIndex: false,
    onPaginationChange: (updater) =>
      setPagination((old) => {
        const raw = typeof updater === 'function' ? updater(old) : updater;
        const next = {
          pageIndex: raw.pageIndex ?? old.pageIndex,
          pageSize: raw.pageSize ?? old.pageSize,
        };
        if (next.pageSize === old.pageSize && next.pageIndex === old.pageIndex) return old;
        return {
          pageIndex: next.pageSize !== old.pageSize ? 0 : next.pageIndex,
          pageSize: next.pageSize,
        };
      }),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  React.useEffect(() => {
    if (typeof data?.total !== 'number' || Number.isNaN(data.total)) return;
    const totalPages = getSafePageCount(data.total, pagination.pageSize);
    if (pagination.pageIndex > totalPages - 1) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: Math.max(totalPages - 1, 0),
      }));
    }
  }, [data?.total, pagination.pageSize, pagination.pageIndex, setPagination]);

  return (
    <div className='space-y-4'>
      <DataTableToolbar table={table} />
      <div className='relative overflow-hidden rounded-md border'>
        {isFetching && (
          <div className='bg-background/50 absolute inset-0 z-10 flex items-center justify-center'>
            <Spinner />
          </div>
        )}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? null : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={memoColumns.length} className='h-24 text-center'>
                  {table.getState().columnFilters.length ? (
                    <div className='flex flex-col items-center gap-2'>
                      <p>No results match filters</p>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => table.resetColumnFilters()}
                      >
                        Clear filters
                      </Button>
                    </div>
                  ) : (
                    <div className='flex flex-col items-center gap-2'>
                      <p>No quests</p>
                      {isAdmin && (
                        <Button asChild size='sm'>
                          <Link to='/quests/new' search={searchParams}>
                            Create quest
                          </Link>
                        </Button>
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
};
