import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/layout/page-header';
import { useAppAuth } from '@/auth/hooks';
import { getUserDisplayData } from '@/utils/user';
import {
  IconUser,
  IconActivity,
  IconSettings,
  IconShield,
  IconCalendar,
  IconMail,
  IconClock,
  IconTrendingUp,
  IconUsers,
  IconCreditCard,
  IconListCheck,
  IconEdit,
  IconKey,
  IconDevices,
  IconBell,
  IconWorld,
  IconBrandMatrix,
} from '@tabler/icons-react';

export const Route = createFileRoute('/_authenticated/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const auth = useAppAuth();
  const { showName, userInitials, role } = getUserDisplayData(auth.user?.profile, auth.user);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - будет заменено на реальные данные
  const stats = {
    usersManaged: 147,
    cardsManaged: 89,
    questsCreated: 12,
    actionsToday: 23,
  };

  const recentActions = [
    { id: 1, action: 'Changed user role', user: 'john@example.com', from: 'Client', to: 'Support', timestamp: '2 hours ago' },
    { id: 2, action: 'Froze card', card: '**** 1234', user: 'jane@example.com', timestamp: '4 hours ago' },
    { id: 3, action: 'Created quest', quest: 'Twitter Follow', timestamp: '1 day ago' },
  ];

  const loginHistory = [
    { id: 1, ip: '192.168.1.1', location: 'Kyiv, Ukraine', device: 'Chrome on macOS', timestamp: '2 hours ago', current: true },
    { id: 2, ip: '192.168.1.2', location: 'Kyiv, Ukraine', device: 'Safari on iPhone', timestamp: '1 day ago', current: false },
    { id: 3, ip: '192.168.1.1', location: 'Kyiv, Ukraine', device: 'Chrome on macOS', timestamp: '2 days ago', current: false },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Admin Profile"
        description="Manage your profile settings and view your activity"
        showBackButton={false}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <IconUser className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <IconActivity className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <IconSettings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <IconShield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile Card */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={auth.user?.profile?.picture} alt={showName} />
                  <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-xl font-bold">{showName}</h2>
                  <p className="text-sm text-muted-foreground">{auth.user?.profile?.email}</p>
                </div>
                <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                  <IconShield className="mr-1 h-3 w-3" />
                  {role}
                </Badge>
                <Button variant="outline" size="sm" className="w-full">
                  <IconEdit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Basic Info Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <IconMail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{auth.user?.profile?.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <IconUser className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">User ID</p>
                    <p className="text-sm text-muted-foreground font-mono">{auth.user?.profile?.sub}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <IconCalendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Login</p>
                    <p className="text-sm text-muted-foreground">
                      {auth.user?.profile?.updated_at ? new Date(auth.user.profile.updated_at * 1000).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <IconBrandMatrix className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Session</p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-2">
                    <IconUsers className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Users Managed</p>
                    <p className="text-xl font-bold">{stats.usersManaged}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-500/10 p-2">
                    <IconCreditCard className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cards Managed</p>
                    <p className="text-xl font-bold">{stats.cardsManaged}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-500/10 p-2">
                    <IconListCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Quests Created</p>
                    <p className="text-xl font-bold">{stats.questsCreated}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500/10 p-2">
                    <IconTrendingUp className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Actions Today</p>
                    <p className="text-xl font-bold">{stats.actionsToday}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconClock className="h-5 w-5 text-indigo-500" />
                Recent Actions
              </CardTitle>
              <CardDescription>Your latest administrative actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActions.map((action) => (
                  <div key={action.id} className="flex items-start justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{action.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {action.user && `User: ${action.user}`}
                        {action.card && `Card: ${action.card}`}
                        {action.quest && `Quest: ${action.quest}`}
                        {action.from && ` • ${action.from} → ${action.to}`}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {action.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Activity History</CardTitle>
                  <CardDescription>Complete log of all your administrative actions</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  Export to CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Action
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Target
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Details
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Mock data - будет заменено на реальные данные из API */}
                      <tr className="border-b">
                        <td className="p-4">
                          <Badge variant="default">Role Changed</Badge>
                        </td>
                        <td className="p-4">
                          <span className="font-medium">john@example.com</span>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          Client → Support
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">2 hours ago</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4">
                          <Badge variant="secondary">Card Frozen</Badge>
                        </td>
                        <td className="p-4">
                          <span className="font-medium">**** 1234</span>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          User: jane@example.com
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">4 hours ago</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4">
                          <Badge variant="destructive">Card Blocked</Badge>
                        </td>
                        <td className="p-4">
                          <span className="font-medium">**** 5678</span>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          User: bob@example.com
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">6 hours ago</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4">
                          <Badge variant="default" className="bg-green-500">Quest Created</Badge>
                        </td>
                        <td className="p-4">
                          <span className="font-medium">Twitter Follow</span>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          Reward: 100 XP
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">1 day ago</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-4">
                          <Badge variant="secondary">Card Unfrozen</Badge>
                        </td>
                        <td className="p-4">
                          <span className="font-medium">**** 9012</span>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          User: alice@example.com
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">1 day ago</td>
                      </tr>
                      <tr>
                        <td className="p-4">
                          <Badge variant="default">Role Changed</Badge>
                        </td>
                        <td className="p-4">
                          <span className="font-medium">mark@example.com</span>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          Support → Administrator
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">2 days ago</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing 6 of 147 actions
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6 mt-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    placeholder="Enter your display name"
                    defaultValue={showName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    defaultValue={auth.user?.profile?.email}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">Email is managed by Keycloak</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar-url">Avatar URL</Label>
                <Input
                  id="avatar-url"
                  placeholder="https://example.com/avatar.jpg"
                  defaultValue={auth.user?.profile?.picture}
                />
                <p className="text-xs text-muted-foreground">You can also upload an avatar via Keycloak</p>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button disabled>
                  <IconEdit className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconWorld className="h-5 w-5" />
                Preferences
              </CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ru">Русский</SelectItem>
                    <SelectItem value="uk">Українська</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="europe/kiev">
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="europe/kiev">Europe/Kiev (UTC+2)</SelectItem>
                    <SelectItem value="europe/london">Europe/London (UTC+0)</SelectItem>
                    <SelectItem value="america/new_york">America/New York (UTC-5)</SelectItem>
                    <SelectItem value="asia/tokyo">Asia/Tokyo (UTC+9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="items-per-page">Items per page</Label>
                <Select defaultValue="50">
                  <SelectTrigger id="items-per-page">
                    <SelectValue placeholder="Select items per page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconBell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about important changes
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>User Activity Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when users perform critical actions
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Card Management Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications for card freezes, blocks, and topups
                  </p>
                </div>
                <Switch />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Quest Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about quest completions and issues
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconDevices className="h-5 w-5" />
                Login History
              </CardTitle>
              <CardDescription>Recent login activity and sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loginHistory.map((login) => (
                  <div key={login.id} className="flex items-start justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{login.device}</p>
                        {login.current && (
                          <Badge variant="default" className="text-xs">Current Session</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {login.ip} • {login.location}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {login.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconKey className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" disabled>
                <IconKey className="mr-2 h-4 w-4" />
                Change Password (via Keycloak)
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                <IconShield className="mr-2 h-4 w-4" />
                Enable Two-Factor Authentication
              </Button>
              <Button variant="destructive" className="w-full justify-start" disabled>
                <IconDevices className="mr-2 h-4 w-4" />
                Sign Out All Devices
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
