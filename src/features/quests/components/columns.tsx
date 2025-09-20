/* eslint-disable react-refresh/only-export-components */
import { Link } from '@tanstack/react-router';
import { type ColumnDef, type Row } from '@tanstack/react-table';
import { IconCheck, IconStar, IconStarFilled } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { useToggleVisibility } from '../api';
import type { Quest } from '../data/types';
import { useQuestSearch } from '../use-quest-search';
import { getBadgeClasses, getBadgeVariant } from '../utils/badge-variants';
import { formatDateDMY, formatNumberShort, formatXp } from '../utils/format';
import { getProviderIcon } from '../utils/provider-icons';
import { DataTableRowActions } from './data-table-row-actions';

const VisibleCell = ({ row, isAdmin }: { row: Row<Quest>; isAdmin: boolean }) => {
  const toggle = useToggleVisibility();
  const visible = Boolean(row.getValue('visible') ?? true);
  if (!isAdmin) return <span>{visible ? 'Yes' : 'No'}</span>;
  return (
    <Switch
      checked={visible}
      onCheckedChange={(v) => toggle.mutate({ id: row.original.id, visible: v })}
      aria-label={`Toggle visibility for ${String(row.original.title ?? 'quest')}`}
    />
  );
};

export const getColumns = (isAdmin: boolean): ColumnDef<Quest>[] => {
  const TitleCell = ({ row }: { row: Row<Quest> }) => {
    const search = useQuestSearch({ from: '/_authenticated/quests/' as const });
    return (
      <Link
        to='/quests/$id'
        params={{ id: String(row.original.id) }}
        search={search}
        title={`Edit ${String(row.original.title)}`}
        className='line-clamp-1 font-medium'
      >
        {String(row.original.title)}
      </Link>
    );
  };
  const cols: ColumnDef<Quest>[] = [
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
        return <Badge className={getBadgeClasses(variant)}>{group}</Badge>;
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
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
      size: 400,
      minSize: 320,
      maxSize: 500,
    },
    // 4. Type
    {
      accessorKey: 'type',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
      cell: ({ row }) => {
        const types = row.original.type as unknown;
        return Array.isArray(types) ? types.join(', ') : String(types ?? '');
      },
      filterFn: (row, id, value) => {
        const types = row.getValue(id);
        return Array.isArray(types) ? types.some((type: string) => value.includes(type)) : false;
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
            <span>{provider}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
      size: 140,
      minSize: 140,
      maxSize: 140,
    },
    // 6. Reward
    {
      accessorKey: 'reward',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Reward' />,
      cell: ({ row }) =>
        formatXp((row.original as Partial<Quest> & { reward?: number | null }).reward),
      size: 100,
      minSize: 100,
      maxSize: 100,
    },
    // 7. Visible (switch)
    {
      accessorKey: 'visible',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Visible' />,
      cell: (ctx) => <VisibleCell row={ctx.row} isAdmin={isAdmin} />,
      enableSorting: false,
      filterFn: (row, id, value) => {
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
      accessorKey: 'usersCount',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Users' />,
      cell: ({ row }) => formatNumberShort(row.original.usersCount),
      size: 120,
      minSize: 120,
      maxSize: 120,
    },
    // 9. Total XP
    {
      accessorKey: 'totalXp',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Total XP' />,
      cell: ({ row }) => formatNumberShort(row.original.totalXp),
      size: 120,
      minSize: 120,
      maxSize: 120,
    },
    // 10. New (check / –)
    {
      id: 'isNew',
      accessorFn: (row) => row.resources?.isNew,
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
      accessorKey: 'startDate',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Start date' />,
      cell: ({ row }) => formatDateDMY(row.original.startDate),
      size: 160,
      minSize: 160,
      maxSize: 160,
    },
    // 13. End date
    {
      accessorKey: 'endDate',
      header: ({ column }) => <DataTableColumnHeader column={column} title='End date' />,
      cell: ({ row }) => formatDateDMY(row.original.endDate),
      size: 160,
      minSize: 160,
      maxSize: 160,
    },
    // 14. Web
    {
      accessorKey: 'webEnabled',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Web' />,
      cell: ({ row }) =>
        row.original.webEnabled ? (
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
      accessorKey: 'tmaEnabled',
      header: ({ column }) => <DataTableColumnHeader column={column} title='TMA' />,
      cell: ({ row }) =>
        row.original.tmaEnabled ? (
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
