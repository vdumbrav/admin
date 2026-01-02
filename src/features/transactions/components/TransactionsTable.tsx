import { useState, useEffect, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type VisibilityState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { DataTableViewOptions } from '@/components/table/data-table-view-options';
import { loadJSON, saveJSON } from '@/utils/persist';
import {
  IconArrowUp,
  IconArrowDown,
  IconExternalLink,
  IconCopy,
} from '@tabler/icons-react';
import type { TransactionItemDto } from '../types';

const LS_TRANSACTIONS_TABLE_VIS = 'transactions-table-visibility';

interface TransactionsTableProps {
  transactions?: TransactionItemDto[];
  isLoading?: boolean;
}

// Actual ETransactionStatuses: pending, success, failed
const statusConfig: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  pending: { label: 'Pending', variant: 'outline' },
  success: { label: 'Completed', variant: 'default' },
  failed: { label: 'Failed', variant: 'destructive' },
};

// Actual ETransactionGroups enum values
const typeLabels: Record<string, string> = {
  premium: 'Premium',
  referral: 'Referral',
  on_ramp: 'Deposit',
  off_ramp: 'Withdrawal',
  send: 'Send',
  receive: 'Receive',
  withdraw: 'Withdraw',
  swap: 'Swap',
  fee: 'Fee',
  cards: 'Cards',
  payment: 'Payment',
  topup: 'Card Topup',
  system: 'System',
  refund: 'Refund',
  card_issue: 'Card Issue',
  processing: 'Processing',
  declined: 'Declined',
};

// Actual ETransactionSources enum values
const sourceLabels: Record<string, string> = {
  system: 'System',
  self: 'Self',
  invoice: 'Invoice',
  user: 'User',
  paybis: 'Paybis',
  blockchain: 'Blockchain',
};

// Truncate hash for display
const truncateHash = (hash?: string): string => {
  if (!hash) return '-';
  if (hash.length <= 14) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
};

// Copy to clipboard helper
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export function TransactionsTable({
  transactions = [],
  isLoading,
}: TransactionsTableProps) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() =>
    loadJSON(LS_TRANSACTIONS_TABLE_VIS, {})
  );

  useEffect(() => {
    saveJSON(LS_TRANSACTIONS_TABLE_VIS, columnVisibility);
  }, [columnVisibility]);

  const columns: ColumnDef<TransactionItemDto>[] = useMemo(
    () => [
      {
        id: 'id',
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }) => (
          <span className="font-medium">#{row.original.id}</span>
        ),
      },
      {
        id: 'type',
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => (
          <Badge variant="outline">
            {typeLabels[row.original.type] || row.original.type}
          </Badge>
        ),
      },
      {
        id: 'amount',
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => {
          const tx = row.original;
          const isIncoming = tx.direction === 'income' || tx.direction === 'accrual';
          return (
            <div className="flex items-center gap-2">
              {isIncoming ? (
                <IconArrowDown className="h-4 w-4 text-green-600" />
              ) : (
                <IconArrowUp className="h-4 w-4 text-red-600" />
              )}
              <span
                className={`font-semibold ${
                  isIncoming ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isIncoming ? '+' : '-'}
                {tx.amount.toFixed(2)} {tx.currency}
              </span>
            </div>
          );
        },
      },
      {
        id: 'direction',
        accessorKey: 'direction',
        header: 'Direction',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground capitalize">
            {row.original.direction}
          </span>
        ),
      },
      {
        id: 'source',
        accessorKey: 'source',
        header: 'Source',
        cell: ({ row }) => (
          <Badge variant="secondary">
            {sourceLabels[row.original.source] || row.original.source}
          </Badge>
        ),
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const statusInfo = statusConfig[row.original.status] || statusConfig.pending;
          return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
        },
      },
      {
        id: 'walletId',
        accessorKey: 'walletId',
        header: 'Wallet ID',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            #{row.original.walletId}
          </span>
        ),
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleString()}
          </span>
        ),
      },
      {
        id: 'txHash',
        accessorKey: 'txHash',
        header: 'TX Hash',
        cell: ({ row }) => {
          const txHash = row.original.txHash;
          if (!txHash || typeof txHash !== 'string') {
            return <span className="text-sm text-muted-foreground">-</span>;
          }
          return (
            <div className="flex items-center gap-1">
              <a
                href={`https://etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline font-mono"
                title={txHash}
              >
                {truncateHash(txHash)}
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(txHash)}
                title="Copy hash"
              >
                <IconCopy className="h-3 w-3" />
              </Button>
              <a
                href={`https://etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                title="View on Explorer"
              >
                <IconExternalLink className="h-3 w-3 text-muted-foreground" />
              </a>
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: transactions,
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <p className="text-muted-foreground">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar with View options */}
      <div className="flex items-center justify-end">
        <DataTableViewOptions table={table} />
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
