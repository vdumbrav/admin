import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { UsersTable } from '@/features/users/components/users-table';
import { useAdminUsers } from '@/features/users/api/admin-users';
import { Skeleton } from '@/components/ui/skeleton';

export const Route = createFileRoute('/_authenticated/users/')({
  component: UsersPage,
});

function UsersPage() {
  const { data, isLoading } = useAdminUsers(1, 100);

  const users = data?.users || [];
  const total = data?.total || 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Users Management</h1>
        <p className="text-muted-foreground">
          {total > 0 ? `Manage ${total} platform users and their data` : 'Manage platform users and their data'}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : users.length > 0 ? (
            <UsersTable users={users} />
          ) : (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              No users data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
