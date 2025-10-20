import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { UsersTable } from '@/features/users/components/users-table';
import type { User } from '@/features/users/types';

export const Route = createFileRoute('/_authenticated/users/')({
  component: UsersPage,
});

// Mock data - will be replaced with API call
const mockUsers: User[] = [
  {
    id: 1,
    uid: 'auth0|123456789',
    email: 'john.doe@example.com',
    nickname: 'johndoe',
    name: 'John Doe',
    firstName: 'John',
    lastName: 'Doe',
    role: 'Client',
    avatarUri: null,
    emailVerified: true,
    referrerId: null,
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    createdAt: new Date(2024, 0, 15).toISOString(),
    updatedAt: new Date().toISOString(),
    matrixId: null,
    cardEmail: 'john.doe@example.com',
  },
  {
    id: 2,
    uid: 'auth0|987654321',
    email: 'jane.smith@example.com',
    nickname: 'janesmith',
    name: 'Jane Smith',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'Admin',
    avatarUri: null,
    emailVerified: true,
    referrerId: null,
    lastLogin: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    createdAt: new Date(2024, 1, 20).toISOString(),
    updatedAt: new Date().toISOString(),
    matrixId: '@jane:matrix.org',
    cardEmail: 'jane.smith@example.com',
  },
  {
    id: 3,
    uid: 'auth0|456789123',
    email: 'bob.wilson@example.com',
    nickname: 'bobw',
    name: 'Bob Wilson',
    firstName: 'Bob',
    lastName: 'Wilson',
    role: 'Client',
    avatarUri: null,
    emailVerified: false,
    referrerId: 1,
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    createdAt: new Date(2024, 2, 10).toISOString(),
    updatedAt: new Date().toISOString(),
    matrixId: null,
    cardEmail: null,
  },
  {
    id: 4,
    uid: 'auth0|789123456',
    email: 'alice.johnson@example.com',
    nickname: 'alicej',
    name: 'Alice Johnson',
    firstName: 'Alice',
    lastName: 'Johnson',
    role: 'Moderator',
    avatarUri: null,
    emailVerified: true,
    referrerId: null,
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    createdAt: new Date(2024, 1, 5).toISOString(),
    updatedAt: new Date().toISOString(),
    matrixId: '@alice:matrix.org',
    cardEmail: 'alice.johnson@example.com',
  },
  {
    id: 5,
    uid: 'auth0|321654987',
    email: 'charlie.brown@example.com',
    nickname: null,
    name: null,
    firstName: 'Charlie',
    lastName: 'Brown',
    role: 'Client',
    avatarUri: null,
    emailVerified: false,
    referrerId: 2,
    lastLogin: null,
    createdAt: new Date(2024, 3, 1).toISOString(),
    updatedAt: new Date().toISOString(),
    matrixId: null,
    cardEmail: null,
  },
];

function UsersPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Users Management</h1>
        <p className="text-muted-foreground">
          Manage platform users and their data
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <UsersTable users={mockUsers} />
        </CardContent>
      </Card>
    </div>
  );
}
