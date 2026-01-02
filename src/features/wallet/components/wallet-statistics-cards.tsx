import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  IconWallet,
  IconMapPin,
  IconCalendarPlus,
  IconCalendarWeek,
} from '@tabler/icons-react';
import type { WalletStatistics } from '../types';

interface WalletStatisticsCardsProps {
  statistics?: WalletStatistics;
  isLoading?: boolean;
}

export function WalletStatisticsCards({ statistics, isLoading }: WalletStatisticsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-1 h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Wallets',
      value: statistics?.totalWallets ?? 0,
      description: `${statistics?.activeWallets ?? 0} active`,
      icon: IconWallet,
      color: 'text-blue-600',
    },
    {
      title: 'Deposit Addresses',
      value: statistics?.totalDepositAddresses ?? 0,
      description: 'Generated addresses',
      icon: IconMapPin,
      color: 'text-green-600',
    },
    {
      title: 'Created This Week',
      value: statistics?.createdThisWeek ?? 0,
      description: `${statistics?.createdThisMonth ?? 0} this month`,
      icon: IconCalendarWeek,
      color: 'text-purple-600',
    },
    {
      title: 'Created Today',
      value: statistics?.createdToday ?? 0,
      description: 'New wallets today',
      icon: IconCalendarPlus,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
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
