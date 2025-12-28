import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  IconShieldCheck,
  IconAlertTriangle,
  IconUsers,
  IconRefresh,
  IconExternalLink,
  IconBrain,
  IconTrendingUp,
} from '@tabler/icons-react';
import { useFraudStats } from '@/features/fraud-detection/api/fraud';
import { useUsers } from '@/features/users/api/users';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/security/')({
  component: SecurityCenterPage,
});

function SecurityCenterPage() {
  const { data: fraudStats, isLoading: fraudLoading, refetch: refetchFraud } = useFraudStats();
  const { data: usersData, isLoading: usersLoading } = useUsers({
    page: 1,
    limit: 100,
  });

  const handleRefresh = () => {
    refetchFraud();
  };

  const stats = fraudStats?.stats;

  // Calculate high-risk users from users data
  const users = usersData?.users || [];
  const highRiskUsers = users.filter((u: any) => (u.risk_score || 0) >= 70);
  const mediumRiskUsers = users.filter((u: any) => (u.risk_score || 0) >= 40 && (u.risk_score || 0) < 70);
  const lowRiskUsers = users.filter((u: any) => (u.risk_score || 0) < 40 || !u.risk_score);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <IconShieldCheck className="h-8 w-8 text-primary" />
            Security Center
          </h1>
          <p className="text-muted-foreground">
            Unified security monitoring and risk analysis
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={fraudLoading}>
          <IconRefresh className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Incidents
                </p>
                <p className="text-2xl font-bold">
                  {fraudLoading ? '...' : stats?.totalIncidents || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <IconAlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Last 24 Hours
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {fraudLoading ? '...' : stats?.recentIncidents24h || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <IconTrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  High Risk Users
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {usersLoading ? '...' : highRiskUsers.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                <IconUsers className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Avg Risk Score
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {fraudLoading ? '...' : stats?.averageFraudScore || '0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <IconBrain className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>User Risk Distribution</CardTitle>
          <CardDescription>Overview of users by risk level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-950/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">High Risk (70+)</span>
                <Badge variant="destructive">{highRiskUsers.length}</Badge>
              </div>
              <Progress value={(highRiskUsers.length / Math.max(users.length, 1)) * 100} className="h-2 bg-red-200" />
            </div>

            <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Medium Risk (40-69)</span>
                <Badge variant="secondary" className="bg-yellow-500 text-white">{mediumRiskUsers.length}</Badge>
              </div>
              <Progress value={(mediumRiskUsers.length / Math.max(users.length, 1)) * 100} className="h-2 bg-yellow-200" />
            </div>

            <div className="p-4 rounded-lg border border-green-200 bg-green-50/50 dark:bg-green-950/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Low Risk (0-39)</span>
                <Badge variant="secondary" className="bg-green-500 text-white">{lowRiskUsers.length}</Badge>
              </div>
              <Progress value={(lowRiskUsers.length / Math.max(users.length, 1)) * 100} className="h-2 bg-green-200" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconShieldCheck className="h-5 w-5" />
              Fraud Detection
            </CardTitle>
            <CardDescription>AI-powered fraud monitoring and incidents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link to="/fraud">
                  <IconExternalLink className="mr-2 h-4 w-4" />
                  View Incidents
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconBrain className="h-5 w-5" />
              System Logs
            </CardTitle>
            <CardDescription>AI analysis of application logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link to="/logs">
                  <IconExternalLink className="mr-2 h-4 w-4" />
                  View Logs
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High Risk Users List */}
      {highRiskUsers.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <IconAlertTriangle className="h-5 w-5" />
              High Risk Users
            </CardTitle>
            <CardDescription>Users requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {highRiskUsers.slice(0, 10).map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
                  <div>
                    <p className="font-medium">{user.nickname || user.email || `User #${user.id}`}</p>
                    <p className="text-xs text-muted-foreground">ID: {user.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Risk: {user.risk_score}</Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/users/${user.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
              {highRiskUsers.length > 10 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  +{highRiskUsers.length - 10} more high risk users
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
