import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
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
import {
  useAdminStatisticsControllerGetDashboard,
  useAdminStatisticsControllerGetActivity,
  useAdminStatisticsControllerGetTopUsers,
  useAdminStatisticsControllerGetRecentOrders,
} from '@/lib/api/generated/admin-statistics/admin-statistics';
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

export const Route = createFileRoute('/_authenticated/analytics/')({
  component: AnalyticsPage,
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
              {change}% from last period
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

type PeriodOption = '7' | '30' | '90';

const PERIOD_OPTIONS = [
  { value: '7' as PeriodOption, label: '7 days' },
  { value: '30' as PeriodOption, label: '30 days' },
  { value: '90' as PeriodOption, label: '90 days' },
];

function AnalyticsPage() {
  const [period, setPeriod] = useState<PeriodOption>('30');

  const { data: dashboard, isLoading } = useAdminStatisticsControllerGetDashboard({ period });
  const { data: activityData, isLoading: isActivityLoading } = useAdminStatisticsControllerGetActivity({ period });
  const { data: topUsersData, isLoading: isTopUsersLoading } = useAdminStatisticsControllerGetTopUsers();
  const { data: recentOrdersData, isLoading: isRecentOrdersLoading } = useAdminStatisticsControllerGetRecentOrders();

  // Type assertion needed because backend doesn't have response DTO in swagger
  const dashboardData = dashboard as any;
  const activity = (activityData as any) || [];
  const topUsers = (topUsersData as any) || [];
  const recentOrders = (recentOrdersData as any) || [];

  const metrics = {
    totalUsers: dashboardData?.users?.total || 0,
    totalUsersChange: dashboardData?.users?.change || 0,
    activeCards: dashboardData?.cards?.active || 0,
    activeCardsChange: dashboardData?.cards?.change || 0,
    pendingOrders: dashboardData?.orders?.pending || 0,
    pendingOrdersChange: dashboardData?.orders?.change || 0,
    totalTransactions: dashboardData?.transactions?.total || 0,
    totalTransactionsChange: dashboardData?.transactions?.change || 0,
  };

  const chartConfig = {
    users: {
      label: 'Users',
      color: '#3b82f6', // blue-500
    },
    transactions: {
      label: 'Transactions',
      color: '#10b981', // green-500
    },
  } satisfies ChartConfig;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Insights</h1>
          <p className="text-muted-foreground">
            Platform performance metrics and user statistics
          </p>
        </div>
        <div className="flex gap-2">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setPeriod(option.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                period === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
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
            <CardTitle>User Growth & Transaction Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isActivityLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : activity.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <AreaChart data={activity}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    className="fill-muted-foreground"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <defs>
                    <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="fillTransactions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#3b82f6"
                    fill="url(#fillUsers)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="transactions"
                    stroke="#10b981"
                    fill="url(#fillTransactions)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                No activity data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Users</CardTitle>
          </CardHeader>
          <CardContent>
            {isTopUsersLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : topUsers.length > 0 ? (
              <div className="space-y-3">
                {topUsers.slice(0, 5).map((user: any, idx: number) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          #{idx + 1}
                        </span>
                        <span className="font-medium text-sm truncate max-w-[150px]">
                          {user.nickname && user.nickname !== 'Anonymous' ? user.nickname : user.email}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {user.transactionCount} transactions
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-600">
                        ${user.balance.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                No users data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isRecentOrdersLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-2 border-b pb-3 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(order.reference)}
                        className="font-mono text-xs font-medium hover:text-primary transition-colors"
                        title="Click to copy reference"
                      >
                        {order.reference}
                      </button>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'confirmed'
                              ? 'bg-blue-100 text-blue-700'
                              : order.status === 'failed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {order.amount} {order.currency}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{order.user.nickname && order.user.nickname !== 'Anonymous' ? order.user.nickname : order.user.email}</span>
                    <span className="flex items-center gap-1">
                      {order.paymentType} • {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              No orders data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
