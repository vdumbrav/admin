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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  IconDotsVertical,
  IconUser,
  IconCopy,
  IconWallet,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import type { WalletListItem } from '../types';

interface WalletsTableProps {
  wallets: WalletListItem[];
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function WalletsTable({
  wallets,
  page,
  totalPages,
  total,
  onPageChange,
}: WalletsTableProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
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

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Partner ID</TableHead>
            <TableHead>Partner Name</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {wallets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No wallets found.
              </TableCell>
            </TableRow>
          ) : (
            wallets.map((wallet) => (
              <TableRow key={wallet.id}>
                <TableCell className="font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-[150px]">{wallet.partnerId}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(wallet.partnerId, 'Partner ID')}
                    >
                      <IconCopy className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>{wallet.partnerName || '-'}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <Link
                      to="/users/$userId"
                      params={{ userId: wallet.user.id.toString() }}
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <IconUser className="h-3 w-3" />
                      <span>{wallet.user.nickname || wallet.user.email || `User #${wallet.user.id}`}</span>
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      ID: {wallet.user.id}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={wallet.isActive ? 'default' : 'secondary'}>
                    {wallet.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(wallet.createdAt)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <IconDotsVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          to="/wallets/$partnerId"
                          params={{ partnerId: wallet.partnerId }}
                          className="flex items-center gap-2"
                        >
                          <IconWallet className="h-4 w-4" />
                          View Wallet
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          to="/users/$userId"
                          params={{ userId: wallet.user.id.toString() }}
                          className="flex items-center gap-2"
                        >
                          <IconUser className="h-4 w-4" />
                          View User
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => copyToClipboard(wallet.partnerId, 'Partner ID')}
                      >
                        <IconCopy className="h-4 w-4 mr-2" />
                        Copy Partner ID
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Showing {wallets.length} of {total.toLocaleString()} wallets
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
