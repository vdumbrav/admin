import * as React from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableFacetedFilter } from '@/components/table/data-table-faceted-filter'
import { DataTableViewOptions } from '@/components/table/data-table-view-options'
import { groups, types, providers, visibilities } from '../data/data'
import { Quest } from '../data/schema'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  isAdmin: boolean
  onBulk: (ids: number[], action: 'hide' | 'show' | 'delete') => void
  reorderMode: boolean
  onToggleReorder: () => void
  bulkPending: boolean
}

export const DataTableToolbar = <TData,>({
  table,
  isAdmin,
  onBulk,
  reorderMode,
  onToggleReorder,
  bulkPending,
}: DataTableToolbarProps<TData>) => {
  const isFiltered = table.getState().columnFilters.length > 0
  const selected = table
    .getFilteredSelectedRowModel()
    .rows.map((r) => (r.original as Quest).id)
  const filterValue =
    (table.getColumn('title')?.getFilterValue() as string) ?? ''
  const [search, setSearch] = React.useState(filterValue)

  React.useEffect(() => {
    setSearch(filterValue)
  }, [filterValue])

  React.useEffect(() => {
    const id = setTimeout(() => {
      table.getColumn('title')?.setFilterValue(search)
    }, 250)
    return () => clearTimeout(id)
  }, [search, table])

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        {isAdmin && (
          <div className='flex items-center gap-2'>
            {selected.length > 0 && (
              <span className='text-sm text-muted-foreground'>
                {selected.length} selected
              </span>
            )}
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                onBulk(selected, 'hide')
                table.toggleAllPageRowsSelected(false)
              }}
              aria-label='Hide selected'
              disabled={selected.length === 0 || bulkPending}
            >
              Hide
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                onBulk(selected, 'show')
                table.toggleAllPageRowsSelected(false)
              }}
              aria-label='Show selected'
              disabled={selected.length === 0 || bulkPending}
            >
              Show
            </Button>
            <Button
              variant='destructive'
              size='sm'
              onClick={() => {
                onBulk(selected, 'delete')
                table.toggleAllPageRowsSelected(false)
              }}
              aria-label='Delete selected'
              disabled={selected.length === 0 || bulkPending}
            >
              Delete
            </Button>
          </div>
        )}
        <Input
          placeholder='Search by title...'
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className='h-8 w-[150px] lg:w-[250px]'
          disabled={reorderMode}
          title={reorderMode ? 'Exit reorder mode to search' : undefined}
        />
        <div
          className={`flex gap-x-2${
            reorderMode
              ? ' pointer-events-none cursor-not-allowed opacity-50'
              : ''
          }`}
          title={reorderMode ? 'Exit reorder mode to filter' : undefined}
        >
          {table.getColumn('group') && (
            <DataTableFacetedFilter
              column={table.getColumn('group')}
              title='Group'
              options={groups}
              multiple={false}
            />
          )}
          {table.getColumn('type') && (
            <DataTableFacetedFilter
              column={table.getColumn('type')}
              title='Type'
              options={types}
              multiple={false}
            />
          )}
          {table.getColumn('provider') && (
            <DataTableFacetedFilter
              column={table.getColumn('provider')}
              title='Provider'
              options={providers}
              multiple={false}
            />
          )}
          {table.getColumn('visible') && (
            <DataTableFacetedFilter
              column={table.getColumn('visible')}
              title='Visible'
              options={visibilities}
              multiple={false}
            />
          )}
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => table.resetColumnFilters()}
            className='h-8 px-2 lg:px-3'>
            Reset
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <div className='flex items-center gap-2'>
        {isAdmin && (
          <Button
            variant='outline'
            size='sm'
            onClick={onToggleReorder}
            aria-label='Toggle reorder mode'
          >
            {reorderMode ? 'Done' : 'Reorder'}
          </Button>
        )}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
