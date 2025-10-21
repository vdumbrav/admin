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
import { IconX, IconQrcode, IconCopy } from '@tabler/icons-react';
import { useCancelTrcTopup } from '../hooks/useTrcTopups';
import type { TrcTopupData, TrcTopupStatus } from '../types/api';
import { toast } from 'sonner';

interface TopupsTableProps {
  topups?: TrcTopupData[];
  isLoading?: boolean;
  authToken: string;
}

const statusConfig: Record<
  TrcTopupStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  pending: { label: 'Pending', variant: 'outline' },
  success: { label: 'Success', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'secondary' },
  failed: { label: 'Failed', variant: 'destructive' },
};

export function TopupsTable({ topups, isLoading, authToken }: TopupsTableProps) {
  const cancelTopup = useCancelTrcTopup(authToken);

  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this topup?')) {
      return;
    }

    try {
      await cancelTopup.mutateAsync(id);
      toast.success('Topup cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel topup');
      console.error('Cancel topup error:', error);
    }
  };

  const handleCopyWallet = (wallet: string) => {
    navigator.clipboard.writeText(wallet);
    toast.success('Wallet address copied to clipboard');
  };

  const handleViewQR = (qr: string) => {
    window.open(qr, '_blank');
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!topups || topups.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">No topups found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Wallet</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topups.map((topup) => {
            const statusInfo = statusConfig[topup.status];
            return (
              <TableRow key={topup.id}>
                <TableCell className="font-medium">#{topup.id}</TableCell>
                <TableCell className="font-semibold">
                  ${topup.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {topup.wallet.slice(0, 6)}...{topup.wallet.slice(-4)}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleCopyWallet(topup.wallet)}
                      className="h-7 w-7"
                    >
                      <IconCopy className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(topup.created_at).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {topup.qr && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewQR(topup.qr!)}
                      >
                        <IconQrcode className="h-4 w-4 mr-1" />
                        QR Code
                      </Button>
                    )}
                    {topup.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleCancel(topup.id)}
                        disabled={cancelTopup.isPending}
                      >
                        <IconX className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
