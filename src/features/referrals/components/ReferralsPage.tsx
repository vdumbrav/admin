import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IconGift, IconUsers, IconTrendingUp } from '@tabler/icons-react';

export function ReferralsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Referral Program</h1>
        <p className="text-muted-foreground">
          Manage and track referral program statistics
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <IconGift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">See Metabase for details</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Referrers</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">See Metabase for details</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">See Metabase for details</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral System Info */}
      <Card>
        <CardHeader>
          <CardTitle>Referral System</CardTitle>
          <CardDescription>How the referral program works</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Rewards</h4>
              <p className="text-muted-foreground">
                Users earn rewards when their referrals complete qualifying actions
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Tracking</h4>
              <p className="text-muted-foreground">
                All referral activity is tracked and displayed in Metabase analytics
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Analytics</h4>
              <p className="text-muted-foreground">
                View detailed referral metrics, conversion funnels, and performance data in the Metabase dashboard
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
