import * as React from 'react';
import { Link } from '@tanstack/react-router';
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
import type { TaskResponseDto } from '@/lib/api/generated/model';
import { cn } from '@/lib/utils';
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
import { TableLoadingRow } from '@/components/table/table-loading-row';
import { useQuests } from '../api';
import { createQuestSearch } from '../default-search';
import { useFilters } from '../hooks/use-filters';
import { DataTableToolbar } from './data-table-toolbar';

interface DataTableProps {
  columns: ColumnDef<TaskResponseDto>[];
  isAdmin: boolean;
}

const getSafePageCount = (total: number | undefined, size: number) =>
  Math.max(1, Math.ceil((total ?? 0) / size));

export const QuestsDataTable = ({ columns, isAdmin }: DataTableProps) => {
  const {
    search,
    group,
    type,
    provider,
    enabled,
    page,
    limit,
    sort,
    setPage,
    setLimit,
    setSort,
    resetFilters,
  } = useFilters();

  const memoColumns = React.useMemo(() => columns, [columns]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(() =>
    loadJSON(LS_TABLE_VIS, {}),
  );

  // Convert filters from context to table format
  const [columnFilters, _setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 25,
  });

  // Convert enabled string to boolean for API
  const enabledFilter = enabled === 'true' ? true : enabled === 'false' ? false : undefined;

  const { data, isFetching, isLoading } = useQuests({
    search,
    group,
    type,
    provider,
    enabled: enabledFilter,
    page,
    limit,
    sort,
  });

  // Maintain current sort but move pinned items to the top while keeping relative order
  const rows = React.useMemo(() => {
    const items = data?.items ?? [];
    const pinned: TaskResponseDto[] = [];
    const others: TaskResponseDto[] = [];
    for (const it of items) {
      if (it.pinned) pinned.push(it);
      else others.push(it);
    }
    return [...pinned, ...others];
  }, [data?.items]);

  // Sync local state with context
  React.useEffect(() => {
    const [sortId, sortDir] = sort.split(':');
    setSorting([{ id: sortId, desc: sortDir === 'desc' }]);
  }, [sort]);

  React.useEffect(() => {
    setPagination({ pageIndex: page - 1, pageSize: limit });
  }, [page, limit]);

  React.useEffect(() => {
    saveJSON(LS_TABLE_VIS, columnVisibility);
  }, [columnVisibility]);

  React.useEffect(() => {
    saveJSON(LS_TABLE_SIZE, limit);
  }, [limit]);

  React.useEffect(() => {
    saveJSON(LS_TABLE_SORT, sort);
  }, [sort]);

  const table = useReactTable({
    data: rows,
    columns: memoColumns,
    pageCount: getSafePageCount(data?.total, limit),
    state: { sorting, columnVisibility, columnFilters, pagination },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      if (next[0]) {
        const newSort = `${next[0].id}:${next[0].desc ? 'desc' : 'asc'}`;
        setSort(newSort);
      }
    },
    onColumnFiltersChange: () => {
      // Column filters are now handled by context
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater;
      if (next.pageSize !== limit) {
        setLimit(next.pageSize);
      }
      if (next.pageIndex !== page - 1) {
        setPage(next.pageIndex + 1);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  React.useEffect(() => {
    if (typeof data?.total !== 'number' || Number.isNaN(data.total)) return;
    const totalPages = getSafePageCount(data.total, limit);
    if (page > totalPages) {
      setPage(Math.max(totalPages, 1));
    }
  }, [data?.total, limit, page, setPage]);

  return (
    <div className='space-y-4'>
      <DataTableToolbar table={table} />
      <div className='relative rounded-md border' aria-busy={isFetching}>
        <Table>
          <TableHeader className='bg-background sticky top-0 z-10'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan} className='px-3 py-2'>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading || isFetching ? (
              <TableLoadingRow colSpan={memoColumns.length} message='Loading quests...' />
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn('h-11 hover:bg-[--row-hover]', {
                    'bg-background': row.index % 2 === 0,
                    'bg-muted/20': row.index % 2 !== 0,
                  })}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className='px-3 py-2'>
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
                      <p>No results. Try clearing filters.</p>
                      <Button variant='outline' size='sm' onClick={resetFilters}>
                        Clear all
                      </Button>
                    </div>
                  ) : (
                    <div className='flex flex-col items-center gap-2'>
                      <p>No quests yet</p>
                      {isAdmin && (
                        <Button asChild size='sm'>
                          <Link to='/quests/new' search={() => createQuestSearch()}>
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
