import * as React from 'react'
import { Spinner } from '@radix-ui/themes'
import { Link, useRouter, useSearch } from '@tanstack/react-router'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  PaginationState,
  Updater,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { TaskGroup } from '@/types/tasks'
import {
  LS_TABLE_SIZE,
  LS_TABLE_SORT,
  LS_TABLE_VIS,
  loadJSON,
  saveJSON,
} from '@/utils/persist'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/table/data-table-pagination'
import { useQuests } from '../api'
import type { Quest } from '../data/schema'
import { DataTableToolbar } from './data-table-toolbar'

interface DataTableProps {
  columns: ColumnDef<Quest>[]
  isAdmin: boolean
}

export const QuestsDataTable = ({ columns, isAdmin }: DataTableProps) => {
  const router = useRouter()
  const searchParams = useSearch({ from: '/_authenticated/quests/' as const })
  const memoColumns = React.useMemo(() => columns, [columns])
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(() => loadJSON(LS_TABLE_VIS, {}))
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    () => {
      const init: ColumnFiltersState = []
      if (searchParams.search)
        init.push({ id: 'title', value: searchParams.search })
      if (searchParams.group && searchParams.group !== 'all')
        init.push({ id: 'group', value: [searchParams.group] })
      if (searchParams.type)
        init.push({ id: 'type', value: [searchParams.type] })
      if (searchParams.provider)
        init.push({ id: 'provider', value: [searchParams.provider] })
      if (searchParams.visible)
        init.push({ id: 'visible', value: [searchParams.visible] })
      return init
    }
  )
  const [sorting, setSorting] = React.useState<SortingState>(() => {
    const s = searchParams.sort ?? loadJSON(LS_TABLE_SORT, 'order_by:asc')
    const [id, dir] = s.split(':')
    return [{ id, desc: dir === 'desc' }]
  })
  const pageSizeFromStorage = loadJSON(LS_TABLE_SIZE, 20)
  const [pagination, setPagination] = React.useState({
    pageIndex: (searchParams.page ?? 1) - 1,
    pageSize: searchParams.limit ?? pageSizeFromStorage,
  })

  const pickSingle = (id: string, fallback = ''): string => {
    const raw = columnFilters.find((f) => f.id === id)?.value as unknown
    if (Array.isArray(raw)) return (raw[0] ?? fallback) as string
    if (typeof raw === 'string') return raw
    return fallback
  }

  const search = pickSingle('title').trim()
  const group = pickSingle('group', 'all') as TaskGroup | 'all'
  const type = pickSingle('type', '')
  const provider = pickSingle('provider', '')
  const visible = pickSingle('visible', '')
  const sort = sorting[0]
    ? `${sorting[0].id}:${sorting[0].desc ? 'desc' : 'asc'}`
    : 'order_by:asc'

  const { data, isFetching, isLoading } = useQuests({
    search,
    group,
    type,
    provider,
    visible,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sort,
  })

  React.useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [search, group, type, provider, visible, sorting])

  React.useEffect(() => {
    saveJSON(LS_TABLE_VIS, columnVisibility)
  }, [columnVisibility])

  React.useEffect(() => {
    saveJSON(LS_TABLE_SIZE, pagination.pageSize)
  }, [pagination.pageSize])

  React.useEffect(() => {
    saveJSON(LS_TABLE_SORT, sort)
  }, [sort])

  React.useEffect(() => {
    const nextFilters: ColumnFiltersState = []
    if (searchParams.search)
      nextFilters.push({ id: 'title', value: searchParams.search })
    if (searchParams.group && searchParams.group !== 'all')
      nextFilters.push({ id: 'group', value: [searchParams.group] })
    if (searchParams.type)
      nextFilters.push({ id: 'type', value: [searchParams.type] })
    if (searchParams.provider)
      nextFilters.push({ id: 'provider', value: [searchParams.provider] })
    if (searchParams.visible)
      nextFilters.push({ id: 'visible', value: [searchParams.visible] })
    setColumnFilters(nextFilters)
    const s = searchParams.sort ?? 'order_by:asc'
    const [id, dir] = s.split(':')
    setSorting([{ id, desc: dir === 'desc' }])
    setPagination({
      pageIndex: (searchParams.page ?? 1) - 1,
      pageSize: searchParams.limit ?? pageSizeFromStorage,
    })
  }, [searchParams, pageSizeFromStorage])

  React.useEffect(() => {
    const next: Record<string, any> = {
      search,
      group,
      type,
      provider,
      visible,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sort,
    }
    if (next.page === 1) delete next.page
    if (next.sort === 'order_by:asc') delete next.sort
    if (JSON.stringify(next) !== JSON.stringify(searchParams)) {
      router.navigate({ to: '/quests', search: next as any, replace: true })
    }
  }, [
    search,
    group,
    type,
    provider,
    visible,
    pagination,
    sort,
    router,
    searchParams,
  ])

  const table = useReactTable({
    data: (data?.items ?? []) as Quest[],
    columns: memoColumns,
    pageCount: data ? Math.ceil(data.total / pagination.pageSize) : -1,
    state: { sorting, columnVisibility, columnFilters, pagination },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater: Updater<PaginationState>) => {
      setPagination((old) => {
        const next =
          typeof updater === 'function'
            ? (updater as (s: PaginationState) => PaginationState)(old)
            : updater
        return {
          pageIndex: next.pageSize !== old.pageSize ? 0 : next.pageIndex,
          pageSize: next.pageSize,
        }
      })
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

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
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={memoColumns.length}
                  className='h-24 text-center'
                >
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
                          <Link to='/quests/new' search={searchParams}>Create quest</Link>
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
  )
}
