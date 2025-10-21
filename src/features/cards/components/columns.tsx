import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import {
  IconDotsVertical,
  IconCreditCard,
  IconLock,
  IconSnowflake,
  IconCirclePlus,
  IconArrowsExchange,
} from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import type { Card } from '../types';

const statusConfig = {
  active: {
    label: 'Active',
    variant: 'default' as const,
    icon: IconCreditCard,
    color: 'text-green-600',
  },
  frozen: {
    label: 'Frozen',
    variant: 'secondary' as const,
    icon: IconSnowflake,
    color: 'text-blue-600',
  },
  blocked: {
    label: 'Blocked',
    variant: 'destructive' as const,
    icon: IconLock,
    color: 'text-red-600',
  },
};

interface ColumnsProps {
  onTopup: (card: Card) => void;
  onFreeze: (card: Card) => void;
  onUnfreeze: (card: Card) => void;
  onBlock: (card: Card) => void;
}

export const createColumns = ({
  onTopup,
  onFreeze,
  onUnfreeze,
  onBlock,
}: ColumnsProps): ColumnDef<Card>[] => [
  {
    accessorKey: 'cardNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Card Number" />
    ),
    cell: ({ row }) => {
      const card = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <IconCreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-medium">{card.cardNumber}</div>
            <div className="text-sm text-muted-foreground">
              {card.cardholderName}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'userId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User ID" />
    ),
  },
  {
    accessorKey: 'balance',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Balance" />
    ),
    cell: ({ row }) => {
      const card = row.original;
      return (
        <div className="font-medium">
          {card.balance.toFixed(2)} {card.currency}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as Card['status'];
      const config = statusConfig[status];
      const Icon = config.icon;

      return (
        <Badge variant={config.variant}>
          <Icon className="mr-1 h-3 w-3" />
          {config.label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'bin',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="BIN" />
    ),
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      return new Date(row.getValue('createdAt')).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
  },
  {
    accessorKey: 'lastUsed',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Used" />
    ),
    cell: ({ row }) => {
      const lastUsed = row.getValue('lastUsed') as string | null;
      if (!lastUsed) {
        return <span className="text-muted-foreground">Never</span>;
      }
      return new Date(lastUsed).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const card = row.original;
      const canFreeze = card.status === 'active';
      const canUnfreeze = card.status === 'frozen';
      const canBlock = card.status !== 'blocked';
      const navigate = useNavigate();

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTopup(card)}
            disabled={card.status === 'blocked'}
          >
            <IconCirclePlus className="mr-1 h-4 w-4" />
            Topup
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  navigate({
                    to: '/transactions',
                    search: { cardId: card.id },
                  })
                }
              >
                <IconArrowsExchange className="mr-2 h-4 w-4" />
                View Transactions
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {canFreeze && (
                <DropdownMenuItem onClick={() => onFreeze(card)}>
                  <IconSnowflake className="mr-2 h-4 w-4" />
                  Freeze Card
                </DropdownMenuItem>
              )}
              {canUnfreeze && (
                <DropdownMenuItem onClick={() => onUnfreeze(card)}>
                  <IconSnowflake className="mr-2 h-4 w-4" />
                  Unfreeze Card
                </DropdownMenuItem>
              )}
              {canBlock && (
                <DropdownMenuItem
                  onClick={() => onBlock(card)}
                  className="text-destructive"
                >
                  <IconLock className="mr-2 h-4 w-4" />
                  Block Card
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
