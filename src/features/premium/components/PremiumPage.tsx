import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconCrown, IconCheck, IconRefresh, IconEdit } from '@tabler/icons-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Mock data for premium bundles
const premiumBundles = [
  {
    id: 'basic',
    name: 'Basic Premium',
    service: 'waitlist',
    price: 4.99,
    duration: 30,
    features: ['Ad-free experience', 'Priority support', 'Badge on profile'],
    active: true,
  },
  {
    id: 'standard',
    name: 'Standard Premium',
    service: 'waitlist',
    price: 9.99,
    duration: 30,
    features: ['All Basic features', 'Advanced analytics', 'Custom themes', 'Early access'],
    active: true,
  },
  {
    id: 'premium',
    name: 'Premium Plus',
    service: 'waitlist',
    price: 19.99,
    duration: 30,
    features: ['All Standard features', 'Exclusive content', 'API access', '1-on-1 support'],
    active: true,
  },
];

export function PremiumPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Premium Bundles</h1>
          <p className="text-muted-foreground">
            Manage premium subscription tiers and pricing
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <IconRefresh className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button>
            <IconCrown className="mr-2 h-4 w-4" />
            Create Bundle
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <IconCrown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,543</div>
            <p className="text-xs text-muted-foreground">
              +180 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <IconCrown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <IconCrown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.2%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <IconCrown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.5%</div>
            <p className="text-xs text-muted-foreground">
              -0.5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Premium Bundles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Premium Bundles</CardTitle>
          <CardDescription>
            Manage pricing, features, and availability of premium tiers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {premiumBundles.map((bundle) => (
                <TableRow key={bundle.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <IconCrown className="h-4 w-4 text-yellow-500" />
                      {bundle.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{bundle.service}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    ${bundle.price.toFixed(2)}
                  </TableCell>
                  <TableCell>{bundle.duration} days</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {bundle.features.slice(0, 2).map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-1 text-xs">
                          <IconCheck className="h-3 w-3 text-green-600" />
                          <span>{feature}</span>
                        </div>
                      ))}
                      {bundle.features.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{bundle.features.length - 2} more
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={bundle.active ? 'default' : 'secondary'}>
                      {bundle.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <IconEdit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Feature Management Notice */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <IconCrown className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Advanced Features Coming Soon</h3>
            <p className="text-sm text-muted-foreground">
              Bundle creation, feature editing, and pricing management tools will be available here.
              <br />
              Contact support for bundle configuration changes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
