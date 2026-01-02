import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  IconArrowLeft,
  IconUser,
  IconCopy,
  IconRefresh,
  IconWallet,
  IconArrowsExchange,
  IconArrowDown,
  IconArrowUp,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import {
  useWalletDetails,
  useWalletBalance,
  useWalletTransactions,
  useWalletDeposits,
  useWalletWithdrawals,
} from '@/features/wallet/api/admin-wallet';
import {
  BalanceDisplay,
  TransactionsTable,
} from '@/features/wallet/components';

export const Route = createFileRoute('/_authenticated/wallets/$partnerId')({
  component: WalletDetailsPage,
});

function WalletDetailsPage() {
  const { partnerId } = Route.useParams();

  const { data: wallet, isLoading: walletLoading, refetch: refetchWallet } = useWalletDetails(partnerId);
  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = useWalletBalance(partnerId);
  const { data: transactionsData, isLoading: txLoading } = useWalletTransactions(partnerId);
  const { data: depositsData, isLoading: depositsLoading } = useWalletDeposits(partnerId);
  const { data: withdrawalsData, isLoading: withdrawalsLoading } = useWalletWithdrawals(partnerId);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRefresh = () => {
    refetchWallet();
    refetchBalance();
  };

  if (walletLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="mt-2 h-4 w-48" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-1" />
          <Skeleton className="h-64 lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6">
        <h1 className="text-2xl font-bold">Wallet Not Found</h1>
        <p className="text-muted-foreground">The wallet with partner ID "{partnerId}" was not found.</p>
        <Button asChild>
          <Link to="/wallets">
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back to Wallets
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/wallets">
              <IconArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <IconWallet className="h-6 w-6" />
                {wallet.partnerName || 'Wallet'}
              </h1>
              <Badge variant={wallet.isActive ? 'default' : 'secondary'}>
                {wallet.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1 font-mono">
                <span>{partnerId}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(partnerId, 'Partner ID')}
                >
                  <IconCopy className="h-3 w-3" />
                </Button>
              </div>
              <span>|</span>
              <span>Created {formatDate(wallet.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <IconRefresh className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/users/$userId" params={{ userId: wallet.user.id.toString() }}>
              <IconUser className="h-4 w-4 mr-2" />
              View User
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - Info & Balance */}
        <div className="space-y-6">
          {/* Wallet Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Wallet Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">User ID</span>
                <Link
                  to="/users/$userId"
                  params={{ userId: wallet.user.id.toString() }}
                  className="text-blue-600 hover:underline"
                >
                  #{wallet.user.id}
                </Link>
              </div>
              {wallet.user.email && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="truncate max-w-[150px]">{wallet.user.email}</span>
                </div>
              )}
              {wallet.user.nickname && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nickname</span>
                  <span>{wallet.user.nickname}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deposit Addresses</span>
                <Badge variant="outline">{wallet.depositAddressCount}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="text-sm">{formatDate(wallet.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Balance */}
          <BalanceDisplay balances={balance?.balances} isLoading={balanceLoading} />
        </div>

        {/* Right column - Transactions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <IconArrowsExchange className="h-4 w-4" />
                    All ({transactionsData?.total ?? 0})
                  </TabsTrigger>
                  <TabsTrigger value="deposits" className="flex items-center gap-2">
                    <IconArrowDown className="h-4 w-4" />
                    Deposits ({depositsData?.deposits?.length ?? 0})
                  </TabsTrigger>
                  <TabsTrigger value="withdrawals" className="flex items-center gap-2">
                    <IconArrowUp className="h-4 w-4" />
                    Withdrawals ({withdrawalsData?.withdrawals?.length ?? 0})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4">
                  <TransactionsTable
                    transactions={transactionsData?.transactions}
                    isLoading={txLoading}
                  />
                </TabsContent>
                <TabsContent value="deposits" className="mt-4">
                  {depositsLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : !depositsData?.deposits?.length ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No deposits found
                    </div>
                  ) : (
                    <TransactionsTable
                      transactions={depositsData.deposits.map((d) => ({
                        id: d.id,
                        currency: d.currency,
                        amount: d.amount,
                        direction: 'Income' as const,
                        group: 'Deposit' as const,
                        status: d.status,
                        txHash: d.txHash,
                        createdAt: d.createdAt,
                      }))}
                    />
                  )}
                </TabsContent>
                <TabsContent value="withdrawals" className="mt-4">
                  {withdrawalsLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : !withdrawalsData?.withdrawals?.length ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No withdrawals found
                    </div>
                  ) : (
                    <TransactionsTable
                      transactions={withdrawalsData.withdrawals.map((w) => ({
                        id: w.id,
                        currency: w.currency,
                        amount: w.amount,
                        direction: 'Outgo' as const,
                        group: 'Withdraw' as const,
                        status: w.status,
                        txHash: w.txHash,
                        createdAt: w.createdAt,
                      }))}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
