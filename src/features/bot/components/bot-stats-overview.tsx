import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBotStats } from '../api/admin-bot';
import { Users, MessageSquare, Globe, Send, Link2 } from 'lucide-react';
import type { BotStats } from '../types';

export function BotStatsOverview() {
  const { data, isLoading, error } = useBotStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error loading stats</CardTitle>
          <CardDescription>Failed to fetch bot statistics from the backend</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Cast to correct type
  const stats = data as BotStats | undefined;

  const statCards = [
    {
      title: 'Requests Today',
      value: stats?.today?.totalRequests ?? 0,
      description: 'Total API requests',
      icon: MessageSquare,
      color: 'text-green-500',
    },
    {
      title: 'Active Users',
      value: stats?.today?.uniqueUsers ?? 0,
      description: 'Unique users today',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Matrix Users',
      value: stats?.today?.matrixUsers ?? 0,
      description: 'Active Matrix users',
      icon: Globe,
      color: 'text-purple-500',
    },
    {
      title: 'Telegram Users',
      value: stats?.today?.telegramUsers ?? 0,
      description: 'Active Telegram users',
      icon: Send,
      color: 'text-cyan-500',
    },
    {
      title: 'Room Mappings',
      value: (stats?.mappings?.telegramChats ?? 0) + (stats?.mappings?.matrixRooms ?? 0),
      description: `${stats?.mappings?.telegramChats ?? 0} TG / ${stats?.mappings?.matrixRooms ?? 0} Matrix`,
      icon: Link2,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
