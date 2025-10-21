import { createFileRoute } from '@tanstack/react-router';
import {
  IconUsers,
  IconCreditCard,
  IconShoppingCart,
  IconTrendingUp,
  IconArrowUp,
  IconArrowDown,
} from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminStatisticsControllerGetDashboard } from '@/lib/api/generated/admin-statistics/admin-statistics';

export const Route = createFileRoute('/_authenticated/dashboard/')({
  component: DashboardPage,
});

interface MetricCardProps {
  title: string;
  value: string | number | React.ReactNode;
  change?: number;
  icon: React.ElementType;
  iconColor?: string;
}

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-primary',
}: MetricCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p
            className={`text-xs flex items-center gap-1 ${
              isPositive
                ? 'text-green-600'
                : isNegative
                  ? 'text-red-600'
                  : 'text-muted-foreground'
            }`}
          >
            {isPositive && <IconArrowUp className="h-3 w-3" />}
            {isNegative && <IconArrowDown className="h-3 w-3" />}
            <span>
              {isPositive && '+'}
              {change}% from last month
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardPage() {
  const { data: dashboard, isLoading } = useAdminStatisticsControllerGetDashboard();

  const metrics = {
    totalUsers: dashboard?.users?.total || 0,
    totalUsersChange: dashboard?.users?.change || 0,
    activeCards: dashboard?.cards?.active || 0,
    activeCardsChange: dashboard?.cards?.change || 0,
    pendingOrders: dashboard?.orders?.pending || 0,
    pendingOrdersChange: dashboard?.orders?.change || 0,
    totalTransactions: dashboard?.transactions?.total || 0,
    totalTransactionsChange: dashboard?.transactions?.change || 0,
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your platform metrics and activity
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={isLoading ? <Skeleton className="h-8 w-20" /> : metrics.totalUsers.toLocaleString()}
          change={metrics.totalUsersChange}
          icon={IconUsers}
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Active Cards"
          value={isLoading ? <Skeleton className="h-8 w-20" /> : metrics.activeCards.toLocaleString()}
          change={metrics.activeCardsChange}
          icon={IconCreditCard}
          iconColor="text-green-600"
        />
        <MetricCard
          title="Pending Orders"
          value={isLoading ? <Skeleton className="h-8 w-20" /> : metrics.pendingOrders.toLocaleString()}
          change={metrics.pendingOrdersChange}
          icon={IconShoppingCart}
          iconColor="text-orange-600"
        />
        <MetricCard
          title="Total Transactions"
          value={isLoading ? <Skeleton className="h-8 w-20" /> : metrics.totalTransactions.toLocaleString()}
          change={metrics.totalTransactionsChange}
          icon={IconTrendingUp}
          iconColor="text-purple-600"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Activity chart will be implemented here...
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Quick action buttons will be implemented here...
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Top users list will be implemented here...
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Recent orders list will be implemented here...
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
