import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  IconCoins,
  IconCheck,
  IconWorld,
  IconDeviceMobile,
  IconBrandTelegram,
  IconArrowDown,
  IconArrowUp,
  IconArrowsExchange,
  IconNetwork,
} from '@tabler/icons-react';
import type { TokenStatistics } from '../types';

interface TokenStatsCardsProps {
  statistics?: TokenStatistics;
  isLoading: boolean;
}

export function TokenStatsCards({ statistics, isLoading }: TokenStatsCardsProps) {
  const stats = [
    {
      title: 'Total Tokens',
      value: statistics?.totalTokens || 0,
      icon: IconCoins,
      description: 'Total token configurations',
    },
    {
      title: 'Active Tokens',
      value: statistics?.activeTokens || 0,
      icon: IconCheck,
      description: 'Currently active tokens',
    },
    {
      title: 'Visible on Web',
      value: statistics?.visibleOnWeb || 0,
      icon: IconWorld,
      description: 'Visible on web platform',
    },
    {
      title: 'Visible on Mobile',
      value: statistics?.visibleOnMobile || 0,
      icon: IconDeviceMobile,
      description: 'Visible on mobile apps',
    },
    {
      title: 'Visible on Telegram',
      value: statistics?.visibleOnTelegram || 0,
      icon: IconBrandTelegram,
      description: 'Visible in Telegram bot',
    },
    {
      title: 'Deposit Enabled',
      value: statistics?.depositEnabled || 0,
      icon: IconArrowDown,
      description: 'Tokens with deposit enabled',
    },
    {
      title: 'Withdraw Enabled',
      value: statistics?.withdrawEnabled || 0,
      icon: IconArrowUp,
      description: 'Tokens with withdraw enabled',
    },
    {
      title: 'Exchange Enabled',
      value: statistics?.exchangeEnabled || 0,
      icon: IconArrowsExchange,
      description: 'Tokens with exchange enabled',
    },
    {
      title: 'Networks',
      value: statistics?.uniqueNetworks || 0,
      icon: IconNetwork,
      description: 'Unique blockchain networks',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px]" />
              <Skeleton className="h-3 w-[120px] mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
      {stats.slice(0, 5).map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TokenFeatureCards({ statistics, isLoading }: TokenStatsCardsProps) {
  const featureStats = [
    {
      title: 'Deposit Enabled',
      value: statistics?.depositEnabled || 0,
      total: statistics?.activeTokens || 0,
      icon: IconArrowDown,
      color: 'text-green-500',
    },
    {
      title: 'Withdraw Enabled',
      value: statistics?.withdrawEnabled || 0,
      total: statistics?.activeTokens || 0,
      icon: IconArrowUp,
      color: 'text-blue-500',
    },
    {
      title: 'Exchange Enabled',
      value: statistics?.exchangeEnabled || 0,
      total: statistics?.activeTokens || 0,
      icon: IconArrowsExchange,
      color: 'text-purple-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[80px]" />
              <Skeleton className="h-2 w-full mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {featureStats.map((stat) => {
        const percentage = stat.total > 0 ? Math.round((stat.value / stat.total) * 100) : 0;

        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value.toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  / {stat.total.toLocaleString()}
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-secondary">
                <div
                  className={`h-2 rounded-full bg-primary`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{percentage}% of active tokens</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
