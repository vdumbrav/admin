import * as React from 'react'
import { useRouter, useSearch } from '@tanstack/react-router'
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
  LS_TABLE_SIZE,
  LS_TABLE_SORT,
  LS_TABLE_VIS,
  loadJSON,
  saveJSON,
} from '@/utils/persist'
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
import { useReorderQuests } from '../api'
import type { Quest } from '../data/schema'
import { DataTableToolbar } from './data-table-toolbar'

interface DataTableProps {
  columns: ColumnDef<Quest>[]
  isAdmin: boolean
}

export const QuestsDataTable = ({ columns, isAdmin }: DataTableProps) => {
  const router = useRouter()
  const searchParams = useSearch({ from: '/_authenticated/quests/' as const })
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
  const pageSizeRef = React.useRef(pagination.pageSize)
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
  const reorder = useReorderQuests()

  const highlightId = searchParams.highlight
    ? Number(searchParams.highlight)
    : null
  const bodyRef = React.useRef<HTMLTableSectionElement>(null)

  React.useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [search, group, type, provider, visible, sorting])

  React.useEffect(() => {
    saveJSON(LS_TABLE_VIS, columnVisibility)
  }, [columnVisibility])

  React.useEffect(() => {
    if (!reorderMode) {
      saveJSON(LS_TABLE_SIZE, pagination.pageSize)
    }
  }, [pagination.pageSize, reorderMode])

  React.useEffect(() => {
    if (!reorderMode) {
      pageSizeRef.current = pagination.pageSize
    }
  }, [pagination.pageSize, reorderMode])

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
    const size = searchParams.limit ?? pageSizeFromStorage
    setPagination({
      pageIndex: (searchParams.page ?? 1) - 1,
      pageSize: size,
    })
    pageSizeRef.current = size
  }, [searchParams, pageSizeFromStorage])

  React.useEffect(() => {
    const next = {
      search,
      group,
      type,
      provider,
      visible,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      sort,
      highlight: searchParams.highlight,
    }
    if (JSON.stringify(next) !== JSON.stringify(searchParams)) {
      router.navigate({ to: '/quests', search: next, replace: true })
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

  React.useEffect(() => {
    if (!reorderMode) {
      setRows((data?.items ?? []) as Quest[])
    }
  }, [data, reorderMode])

  React.useEffect(() => {
    if (!highlightId || !data) return
    const id = setTimeout(() => {
      const el = bodyRef.current?.querySelector<HTMLElement>(
        `[data-row-id='${highlightId}']`
      )
      if (!el) return
      el.scrollIntoView({ block: 'center' })
      const cls = 'animate-[fade-bg_1.5s_ease-in-out]'
      el.classList.add(cls)
      setTimeout(() => {
        el.classList.remove(cls)
      }, 1500)
      router.navigate({
        to: '/quests',
        search: { ...searchParams, highlight: undefined },
        replace: true,
      })
    })
    return () => clearTimeout(id)
  }, [highlightId, data, router, searchParams])

  const handleDragEnd = (e: DragEndEvent) => {
    if (reorder.isPending) return
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
      <DataTableToolbar
        table={table}
        isAdmin={isAdmin}
        reorderMode={reorderMode}
        onToggleReorder={() => {
          setReorderMode((m) => !m)
          setPagination({
            pageIndex: 0,
            pageSize: !reorderMode ? 100 : pageSizeRef.current,
          })
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
          <TableBody ref={bodyRef}>
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
                  <TableRow key={row.id} data-row-id={row.original.id}>
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
      <div
        className={
          reorderMode
            ? 'pointer-events-none cursor-not-allowed opacity-50'
            : undefined
        }
        title={reorderMode ? 'Exit reorder mode to paginate' : undefined}
      >
        <DataTablePagination table={table} />
      </div>
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
      data-row-id={row.original.id}
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
