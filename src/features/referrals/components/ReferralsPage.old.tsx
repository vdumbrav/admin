import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconRefresh, IconCopy, IconUsers, IconGift } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';

export function ReferralsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Referral Program</h1>
          <p className="text-muted-foreground">
            Manage referral codes and track referral statistics
          </p>
        </div>
        <Button variant="outline">
          <IconRefresh className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <IconGift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">892</div>
            <p className="text-xs text-muted-foreground">
              72.3% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <IconGift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,450 XP</div>
            <p className="text-xs text-muted-foreground">
              Distributed to users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+234</div>
            <p className="text-xs text-muted-foreground">
              New referrals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral System Info */}
      <Card>
        <CardHeader>
          <CardTitle>Referral System</CardTitle>
          <CardDescription>
            Overview of the referral program configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Referrer Reward</span>
                <Badge>100 XP</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Reward given to the user who shares the referral code
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Referee Reward</span>
                <Badge>50 XP</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Reward given to the user who uses the referral code
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Code Format</span>
                <Badge variant="outline">8 characters</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Alphanumeric codes, auto-generated per user
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Code Renewal</span>
                <Badge variant="outline">Enabled</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Users can renew their referral code anytime
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Button variant="outline">
              <IconCopy className="mr-2 h-4 w-4" />
              View All Referral Codes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <IconGift className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Referral Management Coming Soon</h3>
            <p className="text-sm text-muted-foreground">
              Advanced referral tracking, analytics, and management features will be available here.
              <br />
              Contact support for manual referral code management.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
