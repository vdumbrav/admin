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
import type { Row } from '@tanstack/react-table'
import type { TaskGroup } from '@/types/tasks'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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
import { useReorderQuests } from '../api'
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
  const [reorderMode, setReorderMode] = React.useState(false)
  const [rows, setRows] = React.useState<Quest[]>([])
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
  const reorder = useReorderQuests()

  React.useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [search, group, type, provider, visible, sorting])

  React.useEffect(() => {
    if (!reorderMode) {
      setRows((data?.items ?? []) as Quest[])
    }
  }, [data, reorderMode])

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = rows.findIndex((r) => r.id === Number(active.id))
    const newIndex = rows.findIndex((r) => r.id === Number(over.id))
    const newRows = arrayMove(rows, oldIndex, newIndex)
    setRows(newRows)
    const payload = newRows.map((r, i) => ({ id: r.id, order_by: i }))
    reorder.mutate({ rows: payload }, { onError: () => setRows(rows) })
  }

  const table = useReactTable({
    data: (reorderMode ? rows : (data?.items ?? [])) as Quest[],
    columns,
    pageCount: data ? Math.ceil(data.total / pagination.pageSize) : -1,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    enableRowSelection: isAdmin && !reorderMode,
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
        reorderMode={reorderMode}
        onToggleReorder={() => {
          setReorderMode((m) => !m)
          setPagination({ pageIndex: 0, pageSize: !reorderMode ? 100 : 20 })
        }}
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
              reorderMode ? (
                <DndContext onDragEnd={handleDragEnd}>
                  <SortableContext
                    items={table.getRowModel().rows.map((r) => r.original.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <SortableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                </DndContext>
              ) : (
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
              )
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
      {!reorderMode && <DataTablePagination table={table} />}
    </div>
  )
}

const SortableRow = ({ row }: { row: Row<Quest> }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.original.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'cursor-move opacity-60' : 'cursor-move'}
      data-state={row.getIsSelected() && 'selected'}
      {...attributes}
      {...listeners}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}
