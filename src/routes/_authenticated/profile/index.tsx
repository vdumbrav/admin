import { createFileRoute } from '@tanstack/react-router';
import { useAppAuth } from '@/auth/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export const Route = createFileRoute('/_authenticated/profile/')({
  component: ProfilePage,
});

function ProfilePage() {
  const auth = useAppAuth();
  const user = auth.user;
  const roles = auth.roles;

  // Get initials from user name or email
  const getInitials = () => {
    if (user?.profile?.name) {
      return user.profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.profile?.email) {
      return user.profile.email.slice(0, 2).toUpperCase();
    }
    return 'AD';
  };

  if (auth.isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile settings and view your activity
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">
                  {user?.profile?.name || user?.profile?.email || 'Admin User'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {user?.profile?.email || 'No email available'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">User ID:</span>
                <span className="font-mono">{user?.profile?.sub || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Email Verified:</span>
                <span>
                  {user?.profile?.email_verified ? (
                    <Badge variant="default">Verified</Badge>
                  ) : (
                    <Badge variant="secondary">Not Verified</Badge>
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roles & Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Roles & Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Assigned Roles</h4>
              <div className="flex flex-wrap gap-2">
                {roles && roles.length > 0 ? (
                  roles.map((role) => (
                    <Badge key={role} variant="outline">
                      {role}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No roles assigned</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Access Level</h4>
              <div className="space-y-2">
                {auth.isAdmin && (
                  <div className="flex items-center gap-2">
                    <Badge>Administrator Access</Badge>
                  </div>
                )}
                {auth.isSupport && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Support Access</Badge>
                  </div>
                )}
                {!auth.isAdmin && !auth.isSupport && auth.hasAllowedRole && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Limited Access</Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Information */}
        <Card>
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Logged In:</span>
              <span>{auth.isAuthenticated ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Token Issued:</span>
              <span className="font-mono text-xs">
                {user?.issuedAt
                  ? new Date(user.issuedAt * 1000).toLocaleString()
                  : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Token Expires:</span>
              <span className="font-mono text-xs">
                {user?.expiresAt
                  ? new Date(user.expiresAt * 1000).toLocaleString()
                  : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
