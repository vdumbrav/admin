import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  IconUsers,
  IconCreditCard,
  IconShoppingCart,
  IconBell,
  IconChartBar,
  IconPercentage,
  IconClock,
  IconTrendingUp,
} from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAdminStatisticsControllerGetUserStats,
  useAdminStatisticsControllerGetCardStats,
  useAdminStatisticsControllerGetOrderStats,
  useAdminStatisticsControllerGetTransactionStats,
  useAdminStatisticsControllerGetNotificationStats,
} from '@/lib/api/generated/admin-statistics/admin-statistics';
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Bar, BarChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_authenticated/analytics/')({
  component: AnalyticsPage,
});

interface StatCardProps {
  title: string;
  value: string | number | React.ReactNode;
  description?: string;
  icon: React.ElementType;
  iconColor?: string;
}

function StatCard({ title, value, description, icon: Icon, iconColor = 'text-primary' }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn('h-4 w-4', iconColor)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function AnalyticsPage() {
  const [period, setPeriod] = useState<PeriodOption>('30');

  const { data: userStats, isLoading: isUserStatsLoading } = useAdminStatisticsControllerGetUserStats({
    period,
  });
  const { data: cardStats, isLoading: isCardStatsLoading } = useAdminStatisticsControllerGetCardStats({
    period,
  });
  const { data: orderStats, isLoading: isOrderStatsLoading } = useAdminStatisticsControllerGetOrderStats({
    period,
  });
  const { data: transactionStats, isLoading: isTransactionStatsLoading } =
    useAdminStatisticsControllerGetTransactionStats({ period });
  const { data: notificationStats, isLoading: isNotificationStatsLoading } =
    useAdminStatisticsControllerGetNotificationStats({ period });

  // Type assertions because backend doesn't have DTOs in swagger
  const userStatsData = (userStats as any) || {};
  const cardStatsData = (cardStats as any) || {};
  const orderStatsData = (orderStats as any) || {};
  const transactionStatsData = (transactionStats as any) || {};
  const notificationStatsData = (notificationStats as any) || {};

  // Card status distribution for pie chart
  const cardStatusData = cardStatsData.byStatus
    ? Object.entries(cardStatsData.byStatus).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
      }))
    : [];

  // Order status distribution
  const orderStatusData = orderStatsData.byStatus
    ? Object.entries(orderStatsData.byStatus).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
      }))
    : [];

  // Payment method distribution
  const paymentMethodData = orderStatsData.byPaymentType
    ? Object.entries(orderStatsData.byPaymentType).map(([type, count]) => ({
        name: type,
        count: count,
      }))
    : [];

  const cardChartConfig = {
    count: {
      label: 'Cards',
      color: '#3b82f6',
    },
  } satisfies ChartConfig;

  const orderChartConfig = {
    count: {
      label: 'Orders',
      color: '#10b981',
    },
  } satisfies ChartConfig;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Insights</h1>
          <p className="text-muted-foreground">Deep dive into platform performance and user behavior</p>
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

      {/* User Engagement Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">User Engagement</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="New Users"
            value={
              isUserStatsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                userStatsData.newUsers?.toLocaleString() || 0
              )
            }
            description="Users registered in period"
            icon={IconUsers}
            iconColor="text-blue-600"
          />
          <StatCard
            title="Active Users"
            value={
              isUserStatsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                userStatsData.activeUsers?.toLocaleString() || 0
              )
            }
            description="Users with activity in period"
            icon={IconUsers}
            iconColor="text-green-600"
          />
          <StatCard
            title="Verified Email"
            value={
              isUserStatsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                `${userStatsData.verificationRate?.toFixed(1) || 0}%`
              )
            }
            description="Email verification rate"
            icon={IconPercentage}
            iconColor="text-purple-600"
          />
          <StatCard
            title="Premium Users"
            value={
              isUserStatsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                userStatsData.premiumUsers?.toLocaleString() || 0
              )
            }
            description="Active premium subscriptions"
            icon={IconTrendingUp}
            iconColor="text-orange-600"
          />
        </div>
      </div>

      {/* Card Analytics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Card Performance</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
          <StatCard
            title="Cards Issued"
            value={
              isCardStatsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                cardStatsData.totalIssued?.toLocaleString() || 0
              )
            }
            description="Total cards created in period"
            icon={IconCreditCard}
            iconColor="text-blue-600"
          />
          <StatCard
            title="Avg Cards/User"
            value={
              isCardStatsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                cardStatsData.averagePerUser?.toFixed(2) || '0.00'
              )
            }
            description="Cards per active user"
            icon={IconChartBar}
            iconColor="text-green-600"
          />
          <StatCard
            title="Card Activation"
            value={
              isCardStatsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                `${cardStatsData.activationRate?.toFixed(1) || 0}%`
              )
            }
            description="Percentage of active cards"
            icon={IconPercentage}
            iconColor="text-purple-600"
          />
          <StatCard
            title="Frozen Cards"
            value={
              isCardStatsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                cardStatsData.frozenCount?.toLocaleString() || 0
              )
            }
            description="Currently frozen cards"
            icon={IconCreditCard}
            iconColor="text-orange-600"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Card Status Distribution</CardTitle>
            <CardDescription>Breakdown of all cards by current status</CardDescription>
          </CardHeader>
          <CardContent>
            {isCardStatsLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : cardStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={cardStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {cardStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                No card data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order & Payment Analytics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Order & Payment Insights</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
          <StatCard
            title="Completion Rate"
            value={
              isOrderStatsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                `${orderStatsData.completionRate?.toFixed(1) || 0}%`
              )
            }
            description="Successfully completed orders"
            icon={IconPercentage}
            iconColor="text-green-600"
          />
          <StatCard
            title="Avg Order Value"
            value={
              isOrderStatsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                `$${orderStatsData.averageValue?.toFixed(2) || '0.00'}`
              )
            }
            description="Average order amount"
            icon={IconShoppingCart}
            iconColor="text-blue-600"
          />
          <StatCard
            title="Avg Processing Time"
            value={
              isOrderStatsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                `${orderStatsData.avgProcessingTime || 0}min`
              )
            }
            description="Time to complete order"
            icon={IconClock}
            iconColor="text-purple-600"
          />
          <StatCard
            title="Failed Orders"
            value={
              isOrderStatsLoading ? <Skeleton className="h-8 w-20" /> : orderStatsData.failedCount?.toLocaleString() || 0
            }
            description="Orders that failed"
            icon={IconShoppingCart}
            iconColor="text-red-600"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Status Breakdown</CardTitle>
              <CardDescription>Distribution of orders by status</CardDescription>
            </CardHeader>
            <CardContent>
              {isOrderStatsLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : orderStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                  No order data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Orders by payment type</CardDescription>
            </CardHeader>
            <CardContent>
              {isOrderStatsLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : paymentMethodData.length > 0 ? (
                <ChartContainer config={orderChartConfig} className="h-[300px] w-full">
                  <BarChart data={paymentMethodData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="fill-muted-foreground" fontSize={12} />
                    <YAxis className="fill-muted-foreground" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                  No payment data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transaction & Notification Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Insights</CardTitle>
            <CardDescription>Transaction volume and patterns</CardDescription>
          </CardHeader>
          <CardContent>
            {isTransactionStatsLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Volume</span>
                  <span className="text-2xl font-bold">
                    ${transactionStatsData.totalVolume?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Average Transaction</span>
                  <span className="text-xl font-semibold text-blue-600">
                    ${transactionStatsData.averageAmount?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Success Rate</span>
                  <span className="text-xl font-semibold text-green-600">
                    {transactionStatsData.successRate?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Failed Transactions</span>
                  <span className="text-xl font-semibold text-red-600">
                    {transactionStatsData.failedCount?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Analytics</CardTitle>
            <CardDescription>User engagement with notifications</CardDescription>
          </CardHeader>
          <CardContent>
            {isNotificationStatsLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Sent</span>
                  <span className="text-2xl font-bold">
                    {notificationStatsData.totalSent?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Read Rate</span>
                  <span className="text-xl font-semibold text-blue-600">
                    {notificationStatsData.readRate?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Click Rate</span>
                  <span className="text-xl font-semibold text-green-600">
                    {notificationStatsData.clickRate?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Unread</span>
                  <span className="text-xl font-semibold text-orange-600">
                    {notificationStatsData.unreadCount?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
