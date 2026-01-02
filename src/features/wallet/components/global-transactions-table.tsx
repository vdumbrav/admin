import { Link } from '@tanstack/react-router';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  IconUser,
  IconExternalLink,
  IconArrowDown,
  IconArrowUp,
  IconArrowsExchange,
  IconActivity,
} from '@tabler/icons-react';
import type { GlobalTransactionItem, TransactionFilterParams } from '../types';

interface GlobalTransactionsTableProps {
  transactions: GlobalTransactionItem[];
  page: number;
  totalPages: number;
  total: number;
  isLoading?: boolean;
  filters?: TransactionFilterParams;
  onPageChange: (page: number) => void;
  onFilterChange: (filters: TransactionFilterParams) => void;
}

// Crypto icons mapping
const getCryptoEmoji = (currency: string): string => {
  const map: Record<string, string> = {
    BTC: '🟠',
    ETH: '🔷',
    USDT: '🟢',
    USDC: '🔵',
    TRX: '🔴',
    SOL: '🟣',
    BNB: '🟡',
    MATIC: '🟪',
    DOGE: '🐕',
  };
  return map[currency?.toUpperCase()] || '🪙';
};

// Format amount with appropriate decimals
const formatAmount = (amount: number | string, currency: string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';

  if (num === 0) return '0';
  if (num < 0.0001) return num.toExponential(2);
  if (num < 1) return num.toFixed(6);
  if (num < 1000) return num.toFixed(4);
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

// Format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get transaction icon
const getTransactionIcon = (group: string) => {
  switch (group) {
    case 'Deposit':
      return <IconArrowDown className="h-4 w-4 text-green-500" />;
    case 'Withdraw':
      return <IconArrowUp className="h-4 w-4 text-red-500" />;
    case 'Exchange':
      return <IconArrowsExchange className="h-4 w-4 text-purple-500" />;
    case 'Send':
      return <IconArrowUp className="h-4 w-4 text-orange-500" />;
    case 'Receive':
      return <IconArrowDown className="h-4 w-4 text-blue-500" />;
    default:
      return <IconActivity className="h-4 w-4 text-gray-500" />;
  }
};

// Get status badge variant
const getStatusBadge = (status: string) => {
  const statusLower = status?.toLowerCase() || '';
  if (statusLower === 'completed' || statusLower === 'success') {
    return <Badge variant="default">{status}</Badge>;
  }
  if (statusLower === 'pending' || statusLower === 'processing') {
    return <Badge variant="secondary">{status}</Badge>;
  }
  if (statusLower === 'failed' || statusLower === 'error') {
    return <Badge variant="destructive">{status}</Badge>;
  }
  return <Badge variant="outline">{status}</Badge>;
};

export function GlobalTransactionsTable({
  transactions,
  page,
  totalPages,
  total,
  isLoading,
  filters,
  onPageChange,
  onFilterChange,
}: GlobalTransactionsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select
          value={filters?.direction || 'all'}
          onValueChange={(value) =>
            onFilterChange({
              ...filters,
              direction: value === 'all' ? undefined : (value as 'Income' | 'Outgo'),
            })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Directions</SelectItem>
            <SelectItem value="Income">Income</SelectItem>
            <SelectItem value="Outgo">Outgo</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters?.group || 'all'}
          onValueChange={(value) =>
            onFilterChange({
              ...filters,
              group: value === 'all' ? undefined : value,
            })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Deposit">Deposits</SelectItem>
            <SelectItem value="Withdraw">Withdrawals</SelectItem>
            <SelectItem value="Exchange">Exchanges</SelectItem>
            <SelectItem value="Send">Sends</SelectItem>
            <SelectItem value="Receive">Receives</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters?.currency || 'all'}
          onValueChange={(value) =>
            onFilterChange({
              ...filters,
              currency: value === 'all' ? undefined : value,
            })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Currencies</SelectItem>
            <SelectItem value="BTC">BTC</SelectItem>
            <SelectItem value="ETH">ETH</SelectItem>
            <SelectItem value="USDT">USDT</SelectItem>
            <SelectItem value="USDC">USDC</SelectItem>
            <SelectItem value="TRX">TRX</SelectItem>
            <SelectItem value="SOL">SOL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Type</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No transactions found.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((tx) => {
              const isIncome = tx.direction === 'Income';
              const amount = Math.abs(parseFloat(tx.amount));

              return (
                <TableRow key={tx.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTransactionIcon(tx.group)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{getCryptoEmoji(tx.currency)}</span>
                      <span className="font-medium">{tx.currency}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-mono ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                      {isIncome ? '+' : '-'}{formatAmount(amount, tx.currency)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {tx.user?.id ? (
                      <Link
                        to="/users/$userId"
                        params={{ userId: tx.user.id.toString() }}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <IconUser className="h-3 w-3" />
                        {tx.user.nickname || tx.user.email || `User #${tx.user.id}`}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(tx.status)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(tx.createdAt)}
                  </TableCell>
                  <TableCell>
                    {tx.txHash && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a
                          href={`https://etherscan.io/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View on Explorer"
                        >
                          <IconExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Showing {transactions.length} of {total.toLocaleString()} transactions
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
