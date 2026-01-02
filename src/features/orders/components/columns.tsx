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
  IconRefresh,
  IconX,
  IconCreditCard,
  IconCirclePlus,
  IconAlertCircle,
} from '@tabler/icons-react';
import type { CardOrder } from '../types';

const orderTypeConfig = {
  card_creation: {
    label: 'Card Creation',
    icon: IconCreditCard,
    color: 'text-blue-600',
  },
  card_topup: {
    label: 'Card Topup',
    icon: IconCirclePlus,
    color: 'text-green-600',
  },
};

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }> = {
  draft: {
    label: 'Draft',
    variant: 'secondary',
    color: 'text-gray-500',
  },
  pending: {
    label: 'Pending',
    variant: 'secondary',
    color: 'text-gray-600',
  },
  processing: {
    label: 'Processing',
    variant: 'default',
    color: 'text-blue-600',
  },
  partially_paid: {
    label: 'Partially Paid',
    variant: 'secondary',
    color: 'text-yellow-600',
  },
  confirmed: {
    label: 'Confirmed',
    variant: 'default',
    color: 'text-blue-500',
  },
  completed: {
    label: 'Completed',
    variant: 'default',
    color: 'text-green-600',
  },
  failed: {
    label: 'Failed',
    variant: 'destructive',
    color: 'text-red-600',
  },
  expired: {
    label: 'Expired',
    variant: 'outline',
    color: 'text-gray-500',
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'outline',
    color: 'text-orange-600',
  },
};

interface ColumnsProps {
  onRetry: (order: CardOrder) => void;
  onCancel: (order: CardOrder) => void;
}

export const createColumns = ({
  onRetry,
  onCancel,
}: ColumnsProps): ColumnDef<CardOrder>[] => [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order ID" />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">#{row.getValue('id')}</div>;
    },
  },
  {
    accessorKey: 'orderType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const orderType = row.getValue('orderType') as CardOrder['orderType'];
      const config = orderTypeConfig[orderType];
      const Icon = config.icon;

      return (
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${config.color}`} />
          <span className="font-medium">{config.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'userId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
    cell: ({ row }) => {
      const order = row.original;
      const userId = row.getValue('userId') as number;
      const userEmail = order.userEmail || 'No email';
      const userName = order.userName || `User ${userId}`;

      return (
        <div>
          <a
            href={`/users/${userId}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `/users/${userId}`;
            }}
          >
            {userName}
          </a>
          <p className="text-xs text-muted-foreground">{userEmail}</p>
        </div>
      );
    },
  },
  {
    accessorKey: 'cardNumber',
    header: 'Card',
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div>
          {order.cardNumber ? (
            <span className="font-medium">{order.cardNumber}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => {
      const order = row.original;
      if (!order.amount) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <div className="font-medium">
          {order.amount.toFixed(2)} {order.currency || 'USD'}
        </div>
      );
    },
  },
  {
    accessorKey: 'topupSource',
    header: 'Source',
    cell: ({ row }) => {
      const order = row.original;
      if (!order.topupSource) {
        return <span className="text-muted-foreground">—</span>;
      }
      const sourceLabels = {
        master_balance: 'Master Balance',
        external_wallet: 'External Wallet',
      };
      return (
        <span className="text-sm">
          {sourceLabels[order.topupSource]}
        </span>
      );
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as CardOrder['status'];
      const config = statusConfig[status] || {
        label: status,
        variant: 'secondary' as const,
        color: 'text-gray-600',
      };

      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      return new Date(row.getValue('createdAt')).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
  },
  {
    id: 'errorMessage',
    header: 'Error',
    cell: ({ row }) => {
      const order = row.original;
      if (!order.errorMessage) return null;

      return (
        <div className="flex items-center gap-1 text-sm text-destructive">
          <IconAlertCircle className="h-4 w-4" />
          <span className="max-w-[200px] truncate" title={order.errorMessage}>
            {order.errorMessage}
          </span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const order = row.original;
      const canRetry = order.status === 'failed';
      const canCancel = order.status === 'draft' || order.status === 'confirmed';

      if (!canRetry && !canCancel) {
        return null;
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <IconDotsVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {canRetry && (
              <DropdownMenuItem onClick={() => onRetry(order)}>
                <IconRefresh className="mr-2 h-4 w-4" />
                Retry Order
              </DropdownMenuItem>
            )}
            {canCancel && (
              <DropdownMenuItem
                onClick={() => onCancel(order)}
                className="text-destructive"
              >
                <IconX className="mr-2 h-4 w-4" />
                Cancel Order
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
