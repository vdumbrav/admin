import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { IconCopy, IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { toast } from 'sonner';
import type { WalletTransaction } from '../types';

// Get token icon URL from CDN
const getTokenIconUrl = (currency: string): string => {
  const symbol = currency?.toUpperCase()
    .replace('_TRC20', '').replace('_ERC20', '').replace('_BSC', '')
    .replace('_TON', '').replace('TRC20', '').replace('ERC20', '')
    .replace('BSC', '').replace('TON', '') || 'UNKNOWN';
  return `https://cdn.walme.io/icons/coins/${symbol.toLowerCase()}@3x.png`;
};

// Square token icon component
const TokenIcon = ({ currency }: { currency: string }) => {
  const symbol = currency?.toUpperCase()
    .replace('_TRC20', '').replace('_ERC20', '').replace('_BSC', '')
    .replace('_TON', '').replace('TRC20', '').replace('ERC20', '')
    .replace('BSC', '').replace('TON', '') || '?';

  return (
    <Avatar className="h-5 w-5 rounded-sm">
      <AvatarImage src={getTokenIconUrl(currency)} alt={symbol} className="rounded-sm object-cover" />
      <AvatarFallback className="text-[10px] rounded-sm bg-muted">{symbol.slice(0, 2)}</AvatarFallback>
    </Avatar>
  );
};

interface TransactionsTableProps {
  transactions?: WalletTransaction[];
  isLoading?: boolean;
}

const getStatusBadgeVariant = (status?: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (!status) return 'outline';
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === 'completed' || lowerStatus === 'success' || lowerStatus === 'confirmed') {
    return 'default';
  }
  if (lowerStatus === 'pending' || lowerStatus === 'processing') {
    return 'secondary';
  }
  if (lowerStatus === 'failed' || lowerStatus === 'error' || lowerStatus === 'rejected') {
    return 'destructive';
  }
  return 'outline';
};

const getGroupBadgeVariant = (group: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (group) {
    case 'Deposit':
      return 'default';
    case 'Withdraw':
      return 'destructive';
    case 'Send':
      return 'secondary';
    case 'Receive':
      return 'default';
    default:
      return 'outline';
  }
};

const formatAmount = (amount: string | number) => {
  const num = Math.abs(typeof amount === 'string' ? parseFloat(amount) : amount);
  if (num < 0.00001) return num.toExponential(4);
  if (num < 1) return num.toFixed(8);
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 });
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const shortenHash = (hash: string) => {
  if (!hash) return '-';
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
};

export function TransactionsTable({ transactions, isLoading }: TransactionsTableProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Direction</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>TX Hash</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                {tx.direction === 'Income' ? (
                  <IconArrowDown className="h-4 w-4 text-green-600" />
                ) : (
                  <IconArrowUp className="h-4 w-4 text-red-600" />
                )}
                <span className={tx.direction === 'Income' ? 'text-green-600' : 'text-red-600'}>
                  {tx.direction}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={getGroupBadgeVariant(tx.group)}>
                {tx.group}
              </Badge>
            </TableCell>
            <TableCell className="font-mono">
              <div className="flex items-center gap-2">
                <TokenIcon currency={tx.currency} />
                <span className={tx.direction === 'Income' ? 'text-green-600' : 'text-red-600'}>
                  {tx.direction === 'Income' ? '+' : '-'}
                  {formatAmount(tx.amount)} {tx.currency?.toUpperCase() || 'N/A'}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(tx.status)}>
                {tx.status || 'Unknown'}
              </Badge>
            </TableCell>
            <TableCell>
              {tx.txHash ? (
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs">{shortenHash(tx.txHash)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(tx.txHash!)}
                  >
                    <IconCopy className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDate(tx.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
