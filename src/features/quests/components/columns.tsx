/* eslint-disable react-refresh/only-export-components */
import { ColumnDef, Row } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { DataTableColumnHeader } from '@/components/table/data-table-column-header'
import { useToggleVisibility } from '../api'
import type { Quest } from '../data/types'
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
      filterFn: (row, id, value) => {
        const v = String(row.getValue(id) ?? true).toLowerCase()
        const selected = (Array.isArray(value) ? value : [value]).map((x) =>
          String(x).toLowerCase()
        )
        return selected.includes(v)
      },
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
      cell: ({ row }) => row.getValue('title'),
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Type' />
      ),
      cell: ({ row }) => {
        const types = row.getValue('type') as string[]
        return types?.join(', ') || ''
      },
      filterFn: (row, id, value) => {
        const types = row.getValue(id) as string[]
        return types?.some((type) => value.includes(type)) || false
      },
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
      id: 'isNew',
      accessorFn: (row) => row.resources?.isNew,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='New' />
      ),
      cell: ({ row }) => (row.getValue('isNew') ? <Badge>New</Badge> : null),
    },
  ]
  if (isAdmin) {
    cols.push({
      id: 'actions',
      cell: ({ row }) => <DataTableRowActions row={row} />,
    })
  }
  return cols
}
