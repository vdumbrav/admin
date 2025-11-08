import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trophy, Users, PlayCircle, Ban, Clock, Target } from 'lucide-react';
import { useStatistics } from '../api';

export const CameraQuestStatistics = () => {
  const { data: stats, isLoading } = useStatistics();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Sessions',
      value: stats.totalSessions,
      icon: PlayCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Sessions',
      value: stats.activeSessions,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Completed Sessions',
      value: stats.completedSessions,
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Cancelled Sessions',
      value: stats.cancelledSessions,
      icon: Ban,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Expired Sessions',
      value: stats.expiredSessions,
      icon: Clock,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    {
      title: 'Average Score',
      value: stats.averageScore.toFixed(1),
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const prizeCards = [
    {
      title: 'Total Prize Cards',
      value: stats.totalPrizeCards,
      color: 'text-blue-600',
    },
    {
      title: 'Available',
      value: stats.availablePrizeCards,
      color: 'text-green-600',
    },
    {
      title: 'Reserved',
      value: stats.reservedPrizeCards,
      color: 'text-yellow-600',
    },
    {
      title: 'Distributed',
      value: stats.distributedPrizeCards,
      color: 'text-gray-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Sessions Overview</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Prize Cards Overview</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {prizeCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-2">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>High Score</CardTitle>
          <CardDescription>Highest score achieved in Camera Quest</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-4xl font-bold text-yellow-600">{stats.highestScore}</p>
              <p className="text-sm text-muted-foreground">pipes passed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
