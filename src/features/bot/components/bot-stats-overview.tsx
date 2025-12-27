import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBotStats } from '../api/admin-bot';
import { Users, MessageSquare, Activity, Globe, Send, Link2 } from 'lucide-react';

export function BotStatsOverview() {
  const { data: stats, isLoading } = useBotStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {[...Array(6)].map((_, i) => (
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

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Total Messages',
      value: stats?.totalMessages ?? 0,
      icon: MessageSquare,
      color: 'text-green-500',
    },
    {
      title: 'Active Today',
      value: stats?.activeToday ?? 0,
      icon: Activity,
      color: 'text-yellow-500',
    },
    {
      title: 'Matrix Users',
      value: stats?.matrixUsers ?? 0,
      icon: Globe,
      color: 'text-purple-500',
    },
    {
      title: 'Telegram Users',
      value: stats?.telegramUsers ?? 0,
      icon: Send,
      color: 'text-cyan-500',
    },
    {
      title: 'Bridged Users',
      value: stats?.bridgedUsers ?? 0,
      icon: Link2,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
