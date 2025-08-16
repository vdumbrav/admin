import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/table/data-table-pagination'
import { useQuests, useBulkAction } from '../api'
import type { Quest } from '../data/schema'
import { DataTableToolbar } from './data-table-toolbar'

interface DataTableProps {
  columns: ColumnDef<Quest>[]
  isAdmin: boolean
}

export const QuestsDataTable = ({ columns, isAdmin }: DataTableProps) => {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'order_by', desc: false },
  ])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 20,
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

  const { data } = useQuests({
    search,
    group,
    type,
    provider,
    visible,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sort,
  })
  const bulk = useBulkAction()

  React.useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [search, group, type, provider, visible, sorting])

  const table = useReactTable({
    data: (data?.items ?? []) as Quest[],
    columns,
    pageCount: data ? Math.ceil(data.total / pagination.pageSize) : -1,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    enableRowSelection: isAdmin,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className='space-y-4'>
      <DataTableToolbar
        table={table}
        isAdmin={isAdmin}
        onBulk={(ids, action) => bulk.mutate({ ids, action })}
      />
      <div className='overflow-hidden rounded-md border'>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
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
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
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
