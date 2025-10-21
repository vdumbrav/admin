import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconBell, IconSend, IconHistory } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useStatisticsControllerGetNotifications } from '@/lib/api/generated/statistics/statistics';

export const Route = createFileRoute('/_authenticated/notifications/')({
  component: NotificationsPage,
});

function NotificationsPage() {
  const { data: stats, isLoading } = useStatisticsControllerGetNotifications();

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Send push notifications and manage notification campaigns
          </p>
        </div>
        <Button>
          <IconSend className="mr-2 h-4 w-4" />
          Send Notification
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent Today</CardTitle>
            <IconBell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.sentToday || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Check FCM Console
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <IconSend className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.deliveryRate || 0}%</div>
            )}
            <p className="text-xs text-muted-foreground">
              Check FCM Console
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <IconHistory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.openRate || 0}%</div>
            )}
            <p className="text-xs text-muted-foreground">
              Check FCM Console
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <IconBell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>
            Latest notifications sent to users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { title: 'Welcome Bonus Available', status: 'delivered', users: 1234, date: '2 hours ago' },
              { title: 'New Quest Available', status: 'delivered', users: 5678, date: '5 hours ago' },
              { title: 'Card Activation Reminder', status: 'delivered', users: 234, date: '1 day ago' },
            ].map((notif, idx) => (
              <div key={idx} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <IconBell className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{notif.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sent to {notif.users.toLocaleString()} users • {notif.date}
                  </p>
                </div>
                <Badge variant="outline">
                  {notif.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FCM Integration Notice */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <IconBell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">FCM Notification System</h3>
            <p className="text-sm text-muted-foreground">
              Full notification composer with templates, scheduling, and targeting will be available here.
              <br />
              Contact support for advanced notification campaigns.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
