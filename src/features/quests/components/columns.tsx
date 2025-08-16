/* eslint-disable react-refresh/only-export-components */
import { ColumnDef, Row } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { DataTableColumnHeader } from '@/components/table/data-table-column-header'
import { useToggleVisibility } from '../api'
import { Quest } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

const VisibleCell = ({
  row,
  isAdmin,
}: {
  row: Row<Quest>
  isAdmin: boolean
}) => {
  const toggle = useToggleVisibility()
  const visible = (row.getValue('visible') as boolean | undefined) ?? true
  if (!isAdmin) return <span>{visible ? 'Yes' : 'No'}</span>
  return (
    <Switch
      checked={visible}
      onCheckedChange={(v) =>
        toggle.mutate({ id: row.original.id, visible: v })
      }
    />
  )
}

export const getColumns = (isAdmin: boolean): ColumnDef<Quest>[] => {
  const cols: ColumnDef<Quest>[] = [
    {
      accessorKey: 'visible',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Visible' />
      ),
      cell: (ctx) => <VisibleCell row={ctx.row} isAdmin={isAdmin} />,
      enableSorting: false,
      filterFn: (row, id, value) =>
        value.includes(String(row.getValue(id) ?? true)),
    },
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='ID' />
      ),
      cell: ({ row }) => <div className='w-[80px]'>{row.getValue('id')}</div>,
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Title' />
      ),
      cell: ({ row }) => {
        const q = row.original
        return (
          <div className='flex space-x-2'>
            {q.group && <Badge variant='outline'>{q.group}</Badge>}
            {q.type && <Badge variant='outline'>{q.type}</Badge>}
            <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
              {q.title}
            </span>
          </div>
        )
      },
      filterFn: (row, _id, value) => {
        const q = row.original
        const str = String(value).toLowerCase()
        return [
          q.title,
          q.provider,
          q.resources?.username,
          q.resources?.tweetId,
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(str))
      },
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Type' />
      ),
      cell: ({ row }) => row.getValue('type'),
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'provider',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Provider' />
      ),
      cell: ({ row }) => row.getValue('provider'),
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'group',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Group' />
      ),
      cell: ({ row }) => row.getValue('group'),
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'reward',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Reward' />
      ),
      cell: ({ row }) => row.getValue('reward'),
    },
    {
      accessorKey: 'order_by',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Order' />
      ),
      cell: ({ row }) => row.getValue('order_by'),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => row.getValue('status'),
    },
    {
      id: 'isNew',
      accessorFn: (row) => row.resources?.isNew,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='New' />
      ),
      cell: ({ row }) => (row.getValue('isNew') ? <Badge>New</Badge> : null),
    },
  ]
  if (isAdmin) {
    cols.unshift({
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
          className='translate-y-[2px]'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
          className='translate-y-[2px]'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    })
    cols.push({
      id: 'actions',
      cell: ({ row }) => <DataTableRowActions row={row} />,
    })
  }
  return cols
}
