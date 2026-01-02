import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  IconWallet,
  IconArrowsExchange,
  IconArrowDown,
  IconArrowUp,
  IconUsers,
  IconActivity,
  IconChartBar,
  IconCoin,
  IconUser,
  IconExternalLink,
} from '@tabler/icons-react';
import type { ExtendedWalletStatistics, RecentTransaction } from '../types';

interface WalletDashboardProps {
  statistics?: ExtendedWalletStatistics;
  isLoading?: boolean;
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
const formatAmount = (amount: number | string, _currency: string): string => {
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
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get transaction type badge
const getTransactionBadge = (group: string) => {
  const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof IconArrowDown }> = {
    Deposit: { variant: 'default', icon: IconArrowDown },
    Withdraw: { variant: 'destructive', icon: IconArrowUp },
    Exchange: { variant: 'secondary', icon: IconArrowsExchange },
    Send: { variant: 'outline', icon: IconArrowUp },
    Receive: { variant: 'outline', icon: IconArrowDown },
  };

  const config = variants[group] || { variant: 'outline' as const, icon: IconActivity };

  return (
    <Badge variant={config.variant} className="gap-1">
      <config.icon className="h-3 w-3" />
      {group}
    </Badge>
  );
};

export function WalletDashboard({ statistics, isLoading }: WalletDashboardProps) {
  if (isLoading) {
    return <WalletDashboardSkeleton />;
  }

  if (!statistics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">Failed to load statistics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Wallets"
          value={statistics.totalWallets}
          description={`${statistics.activeWallets} active`}
          icon={IconWallet}
          color="text-blue-500"
          progress={(statistics.activeWallets / Math.max(statistics.totalWallets, 1)) * 100}
        />
        <StatsCard
          title="Transactions"
          value={statistics.totalTransactions}
          description={`${statistics.transactionsToday} today`}
          icon={IconActivity}
          color="text-green-500"
          badge={statistics.transactionsThisWeek > 0 ? `+${statistics.transactionsThisWeek} this week` : undefined}
        />
        <StatsCard
          title="Exchanges"
          value={statistics.totalExchanges}
          description={`${statistics.exchangesToday} today`}
          icon={IconArrowsExchange}
          color="text-purple-500"
        />
        <StatsCard
          title="Deposit Addresses"
          value={statistics.totalDepositAddresses}
          description="Generated addresses"
          icon={IconCoin}
          color="text-orange-500"
        />
      </div>

      {/* Second Row - Volume and New Wallets */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Volume 24h */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Volume (24h)</CardTitle>
              <IconChartBar className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statistics.depositVolume24h.length === 0 && statistics.withdrawalVolume24h.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity in the last 24h</p>
              ) : (
                <>
                  {/* Deposits */}
                  {statistics.depositVolume24h.map((v) => (
                    <div key={`dep-${v.currency}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{getCryptoEmoji(v.currency)}</span>
                        <span className="text-sm font-medium">{v.currency}</span>
                        <Badge variant="default" className="text-xs">Deposits</Badge>
                      </div>
                      <span className="text-sm font-mono text-green-600">
                        +{formatAmount(v.amount, v.currency)}
                      </span>
                    </div>
                  ))}
                  {/* Withdrawals */}
                  {statistics.withdrawalVolume24h.map((v) => (
                    <div key={`wit-${v.currency}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{getCryptoEmoji(v.currency)}</span>
                        <span className="text-sm font-medium">{v.currency}</span>
                        <Badge variant="destructive" className="text-xs">Withdrawals</Badge>
                      </div>
                      <span className="text-sm font-mono text-red-600">
                        -{formatAmount(v.amount, v.currency)}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* New Wallets Stats */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">New Wallets</CardTitle>
              <IconUsers className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Today</span>
                <span className="text-2xl font-bold">{statistics.createdToday}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">This Week</span>
                <span className="text-lg font-semibold">{statistics.createdThisWeek}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">This Month</span>
                <span className="text-lg font-semibold">{statistics.createdThisMonth}</span>
              </div>
              <Progress
                value={(statistics.createdThisWeek / Math.max(statistics.createdThisMonth, 1)) * 100}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Button variant="outline" size="sm" className="justify-start" asChild>
                <Link to="/wallets">
                  <IconWallet className="h-4 w-4 mr-2" />
                  View All Wallets
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="justify-start" asChild>
                <Link to="/wallets" search={{ tab: 'transactions' }}>
                  <IconActivity className="h-4 w-4 mr-2" />
                  All Transactions
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="justify-start" asChild>
                <Link to="/users">
                  <IconUsers className="h-4 w-4 mr-2" />
                  Manage Users
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest transactions across all wallets</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/wallets" search={{ tab: 'transactions' }}>
                View All
                <IconExternalLink className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {statistics.recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent transactions
            </div>
          ) : (
            <div className="space-y-4">
              {statistics.recentTransactions.map((tx) => (
                <RecentTransactionRow key={tx.id} transaction={tx} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: typeof IconWallet;
  color: string;
  progress?: number;
  badge?: string;
}

function StatsCard({ title, value, description, icon: Icon, color, progress, badge }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">{description}</p>
          {badge && (
            <Badge variant="secondary" className="text-xs">{badge}</Badge>
          )}
        </div>
        {progress !== undefined && (
          <Progress value={progress} className="h-1 mt-2" />
        )}
      </CardContent>
    </Card>
  );
}

// Recent Transaction Row
interface RecentTransactionRowProps {
  transaction: RecentTransaction;
}

function RecentTransactionRow({ transaction }: RecentTransactionRowProps) {
  const isIncome = transaction.direction === 'Income';
  const amount = parseFloat(transaction.amount);

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-xl">{getCryptoEmoji(transaction.currency)}</span>
        <div>
          <div className="flex items-center gap-2">
            {getTransactionBadge(transaction.group)}
            <span className="text-sm font-medium">{transaction.currency}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {transaction.user?.id && (
              <Link
                to="/users/$userId"
                params={{ userId: transaction.user.id.toString() }}
                className="hover:underline flex items-center gap-1"
              >
                <IconUser className="h-3 w-3" />
                {transaction.user.nickname || `User #${transaction.user.id}`}
              </Link>
            )}
            <span>•</span>
            <span>{formatDate(transaction.createdAt)}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <span className={`font-mono font-medium ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
          {isIncome ? '+' : '-'}{formatAmount(Math.abs(amount), transaction.currency)} {transaction.currency}
        </span>
        <div className="text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs">{transaction.status}</Badge>
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton
function WalletDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
