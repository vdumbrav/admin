import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from '@/components/table/data-table-view-options'
import { DataTableFacetedFilter } from '@/components/table/data-table-faceted-filter'
import { groups, types, providers, visibilities } from '../data/data'
import { Quest } from '../data/schema'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  isAdmin: boolean
  onBulk: (ids: number[], action: 'hide' | 'show' | 'delete') => void
}

export const DataTableToolbar = <TData,>({
  table,
  isAdmin,
  onBulk,
}: DataTableToolbarProps<TData>) => {
  const isFiltered = table.getState().columnFilters.length > 0
  const selected = table.getFilteredSelectedRowModel().rows.map(
    (r) => (r.original as Quest).id,
  )

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        {isAdmin && selected.length > 0 && (
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                onBulk(selected, 'hide')
                table.toggleAllPageRowsSelected(false)
              }}
              aria-label='Hide selected'
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
            >
              Delete
            </Button>
          </div>
        )}
        <Input
          placeholder='Search quests...'
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('title')?.setFilterValue(event.target.value)
          }
          className='h-8 w-[150px] lg:w-[250px]'
        />
        <div className='flex gap-x-2'>
          {table.getColumn('group') && (
            <DataTableFacetedFilter
              column={table.getColumn('group')}
              title='Group'
              options={groups}
            />
          )}
          {table.getColumn('type') && (
            <DataTableFacetedFilter
              column={table.getColumn('type')}
              title='Type'
              options={types}
            />
          )}
          {table.getColumn('provider') && (
            <DataTableFacetedFilter
              column={table.getColumn('provider')}
              title='Provider'
              options={providers}
            />
          )}
          {table.getColumn('visible') && (
            <DataTableFacetedFilter
              column={table.getColumn('visible')}
              title='Visible'
              options={visibilities}
            />
          )}
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => table.resetColumnFilters()}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
