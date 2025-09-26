/* eslint-disable react-refresh/only-export-components */
import { Link } from '@tanstack/react-router';
import { type ColumnDef, type Row } from '@tanstack/react-table';
import { IconCheck, IconStar, IconStarFilled } from '@tabler/icons-react';
import type { TaskResponseDto } from '@/lib/api/generated/model';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { useToggleEnabled } from '../api';
import { getBadgeClasses, getBadgeStyle, getBadgeVariant } from '../utils/badge-variants';
import { formatDateDMY, formatNumberShort, formatXp } from '../utils/format';
import { getProviderIcon } from '../utils/provider-icons';
import { DataTableRowActions } from './data-table-row-actions';

const EnabledCell = ({ row, isAdmin }: { row: Row<TaskResponseDto>; isAdmin: boolean }) => {
  const toggle = useToggleEnabled();
  const enabled = row.getValue('enabled') !== false;
  if (!isAdmin) return <span>{enabled ? 'Visible' : 'Hidden'}</span>;
  return (
    <Switch
      checked={enabled}
      onCheckedChange={(v) => toggle.mutate({ id: row.original.id, enabled: v })}
      aria-label={`Toggle visibility for ${String(row.original.title)}`}
    />
  );
};

export const getColumns = (isAdmin: boolean): ColumnDef<TaskResponseDto>[] => {
  const TitleCell = ({ row }: { row: Row<TaskResponseDto> }) => {
    return (
      <Link
        to='/quests/$id'
        params={{ id: String(row.original.id) }}
        search={{
          search: '',
          group: '',
          type: '',
          provider: '',
          enabled: '',
          page: 1,
          limit: 20,
          sort: '',
          showForm: false,
        }}
        title={`Edit ${String(row.original.title)}`}
        className='line-clamp-1 font-medium'
      >
        {String(row.original.title)}
      </Link>
    );
  };
  const cols: ColumnDef<TaskResponseDto>[] = [
    // 1. Pin indicator
    {
      id: 'pin',
      header: () => <span className='sr-only'>Pinned</span>,
      enableSorting: false,
      cell: ({ row }) =>
        row.original.pinned ? (
          <IconStarFilled size={16} className='text-[--warning]' aria-hidden />
        ) : (
          <IconStar size={16} className='text-muted-foreground' aria-hidden />
        ),
      size: 56,
      minSize: 56,
      maxSize: 56,
    },
    // 2. Group badge
    {
      accessorKey: 'group',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Group' />,
      cell: ({ row }) => {
        const group = String(row.original.group);
        const variant = getBadgeVariant(group);
        return (
          <Badge className={getBadgeClasses(variant)} style={getBadgeStyle(variant)}>
            {group.charAt(0).toUpperCase() + group.slice(1).toLowerCase()}
          </Badge>
        );
      },
      size: 120,
      minSize: 120,
      maxSize: 120,
    },
    // 3. Title (clickable)
    {
      accessorKey: 'title',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Title' />,
      cell: ({ row }) => <TitleCell row={row} />,
      filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
      size: 400,
      minSize: 320,
      maxSize: 500,
    },
    // 4. Type
    {
      accessorKey: 'type',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
      cell: ({ row }) => {
        const type = row.original.type;
        const typeStr = String(type);
        return typeStr.charAt(0).toUpperCase() + typeStr.slice(1).toLowerCase();
      },
      filterFn: (row, id, value: string[]) => {
        const type = row.getValue(id);
        return value.includes(String(type));
      },
      size: 120,
      minSize: 120,
      maxSize: 120,
    },
    // 5. Provider (icon + label)
    {
      accessorKey: 'provider',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Provider' />,
      cell: ({ row }) => {
        const provider = String(row.original.provider ?? '');
        return (
          <div className='flex items-center gap-2' title={provider}>
            {getProviderIcon(provider)}
            <span>{provider.charAt(0).toUpperCase() + provider.slice(1).toLowerCase()}</span>
          </div>
        );
      },
      filterFn: (row, id, value: string[]) => value.includes(row.getValue(id)),
      size: 140,
      minSize: 140,
      maxSize: 140,
    },
    // 6. Reward
    {
      accessorKey: 'reward',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Reward' />,
      cell: ({ row }) => formatXp(row.original.reward),
      size: 100,
      minSize: 100,
      maxSize: 100,
    },
    // 7. Enabled (switch)
    {
      accessorKey: 'enabled',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Visible' />,
      cell: (ctx) => <EnabledCell row={ctx.row} isAdmin={isAdmin} />,
      enableSorting: false,
      filterFn: (row, id, value: string | string[]) => {
        const v = String(row.getValue(id) ?? true).toLowerCase();
        const selected = (Array.isArray(value) ? value : [value]).map((x) =>
          String(x).toLowerCase(),
        );
        return selected.includes(v);
      },
      size: 100,
      minSize: 100,
      maxSize: 100,
    },
    // 8. Users (short)
    {
      accessorKey: 'total_users',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Users' />,
      cell: ({ row }) => formatNumberShort(row.original.total_users),
      size: 120,
      minSize: 120,
      maxSize: 120,
    },
    // 9. Total XP
    {
      accessorKey: 'total_reward',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Total XP' />,
      cell: ({ row }) => formatNumberShort(row.original.total_reward),
      size: 120,
      minSize: 120,
      maxSize: 120,
    },
    // 10. New (check / –)
    {
      id: 'isNew',
      accessorFn: (row) => row.resource?.isNew,
      header: ({ column }) => <DataTableColumnHeader column={column} title='New' />,
      cell: ({ row }) =>
        row.getValue('isNew') ? (
          <IconCheck size={16} className='text-[--success]' />
        ) : (
          <span className='text-muted-foreground'>–</span>
        ),
      size: 80,
      minSize: 80,
      maxSize: 80,
    },
    // 11. ID
    {
      accessorKey: 'id',
      header: ({ column }) => <DataTableColumnHeader column={column} title='ID' />,
      cell: ({ row }) => <div>{row.getValue('id')}</div>,
      size: 80,
      minSize: 80,
      maxSize: 80,
    },
    // 12. Start date
    {
      accessorKey: 'started_at',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Start date' />,
      cell: ({ row }) => {
        const date = row.original.started_at;
        return date ? formatDateDMY(date) : '–';
      },
      size: 160,
      minSize: 160,
      maxSize: 160,
    },
    // 13. End date
    {
      accessorKey: 'completed_at',
      header: ({ column }) => <DataTableColumnHeader column={column} title='End date' />,
      cell: ({ row }) => {
        const date = row.original.completed_at;
        return date ? formatDateDMY(date) : '–';
      },
      size: 160,
      minSize: 160,
      maxSize: 160,
    },
    // 14. Web
    {
      accessorKey: 'web',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Web' />,
      cell: ({ row }) =>
        row.original.web ? (
          <IconCheck size={16} className='text-[--success]' />
        ) : (
          <span className='text-muted-foreground'>–</span>
        ),
      size: 80,
      minSize: 80,
      maxSize: 80,
    },
    // 15. TMA
    {
      accessorKey: 'twa',
      header: ({ column }) => <DataTableColumnHeader column={column} title='TMA' />,
      cell: ({ row }) =>
        row.original.twa ? (
          <IconCheck size={16} className='text-[--success]' />
        ) : (
          <span className='text-muted-foreground'>–</span>
        ),
      size: 80,
      minSize: 80,
      maxSize: 80,
    },
  ];
  if (isAdmin) {
    cols.push({
      id: 'actions',
      cell: ({ row }) => <DataTableRowActions row={row} />,
      size: 64,
      minSize: 64,
      maxSize: 64,
    });
  }
  return cols;
};
