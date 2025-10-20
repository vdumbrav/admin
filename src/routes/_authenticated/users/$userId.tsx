import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  IconMail,
  IconCalendar,
  IconShield,
  IconUser,
  IconBrandMatrix,
  IconCreditCard,
} from '@tabler/icons-react';

export const Route = createFileRoute('/_authenticated/users/$userId')({
  component: UserDetailsPage,
});

function UserDetailsPage() {
  const { userId } = Route.useParams();

  // Mock user data - will be replaced with API call
  const user = {
    id: parseInt(userId),
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Client',
    emailVerified: true,
    avatarUri: null,
    createdAt: new Date(2024, 0, 15).toISOString(),
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    matrixId: '@john:matrix.org',
    cardEmail: 'john.doe@example.com',
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">User Details</h1>
        <p className="text-muted-foreground">View and manage user information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatarUri || undefined} alt={user.name} />
              <AvatarFallback className="text-2xl">
                <IconUser className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Badge variant={user.role === 'Admin' ? 'destructive' : 'default'}>
              <IconShield className="mr-1 h-3 w-3" />
              {user.role}
            </Badge>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <IconMail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                {user.emailVerified && (
                  <Badge variant="default" className="ml-auto">
                    Verified
                  </Badge>
                )}
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <IconCalendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Joined</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <IconCalendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Login</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.lastLogin).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {user.matrixId && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <IconBrandMatrix className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Matrix ID</p>
                      <p className="text-sm text-muted-foreground">
                        {user.matrixId}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {user.cardEmail && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <IconCreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Card Email</p>
                      <p className="text-sm text-muted-foreground">
                        {user.cardEmail}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              User cards will be displayed here...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quests Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Completed quests will be displayed here...
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Recent transactions will be displayed here...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
