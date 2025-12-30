import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IconCrown, IconGift, IconTrendingUp, IconUsers } from '@tabler/icons-react';
import { usePremiumControllerGetPremiumBundles } from '@/lib/api/generated/premium/premium';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export function PremiumPage() {
  const { data: bundles, isLoading } = usePremiumControllerGetPremiumBundles('waitlist');

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Premium Bundles</h1>
        <p className="text-muted-foreground">
          Manage premium subscription bundles and pricing
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bundles</CardTitle>
            <IconCrown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-12" /> : bundles?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">See Metabase</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">See Metabase</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <IconGift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">See Metabase</p>
          </CardContent>
        </Card>
      </div>

      {/* Bundles List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Bundles</CardTitle>
          <CardDescription>Premium subscription packages for Walme Waitlist</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4">
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
            </div>
          ) : bundles && bundles.length > 0 ? (
            <div className="space-y-4">
              {bundles.map((bundle) => (
                <div key={bundle.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{bundle.title}</h3>
                      {bundle.bestChoose && <Badge>Best Choice</Badge>}
                      {bundle.free && <Badge variant="secondary">Free</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      View detailed features and pricing information in Metabase analytics
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No premium bundles found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
