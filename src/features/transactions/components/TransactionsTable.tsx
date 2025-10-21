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
import {
  IconArrowUp,
  IconArrowDown,
  IconExternalLink,
} from '@tabler/icons-react';
import type { TransactionItemDto } from '../types';

interface TransactionsTableProps {
  transactions?: TransactionItemDto[];
  isLoading?: boolean;
}

const statusConfig: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  pending: { label: 'Pending', variant: 'outline' },
  completed: { label: 'Completed', variant: 'default' },
  failed: { label: 'Failed', variant: 'destructive' },
  cancelled: { label: 'Cancelled', variant: 'secondary' },
};

const typeLabels: Record<string, string> = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  swap: 'Swap',
  transfer: 'Transfer',
  purchase: 'Purchase',
  refund: 'Refund',
};

const sourceLabels: Record<string, string> = {
  internal: 'Internal',
  external: 'External',
  card: 'Card',
  crypto: 'Crypto',
  fiat: 'Fiat',
};

export function TransactionsTable({
  transactions,
  isLoading,
}: TransactionsTableProps) {
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
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Direction</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Wallet ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>TX Hash</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => {
            const statusInfo = statusConfig[tx.status] || statusConfig.pending;
            const isIncoming = String(tx.direction) === 'incoming';

            return (
              <TableRow key={tx.id}>
                <TableCell className="font-medium">#{tx.id}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {typeLabels[tx.type] || tx.type}
                  </Badge>
                </TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground capitalize">
                    {tx.direction}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {sourceLabels[tx.source] || tx.source}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  #{tx.walletId}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(tx.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  {tx.txHash ? (
                    <a
                      href={`https://etherscan.io/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    >
                      {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
                      <IconExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
