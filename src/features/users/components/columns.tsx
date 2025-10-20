import { type ColumnDef } from '@tanstack/react-table';
import { Link } from '@tanstack/react-router';
import { IconMail, IconMailCheck, IconShield, IconUser } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import type { User } from '../types';

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'Admin':
      return 'destructive';
    case 'Moderator':
      return 'default';
    default:
      return 'secondary';
  }
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => <div className="w-12">{row.getValue('id')}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
    cell: ({ row }) => {
      const user = row.original;
      const displayName = user.name || user.nickname || user.email || 'Unknown';
      const initials = displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUri || undefined} alt={displayName} />
            <AvatarFallback>
              <IconUser className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{displayName}</span>
            {user.email && (
              <span className="text-xs text-muted-foreground">{user.email}</span>
            )}
          </div>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'role',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      return (
        <Badge variant={getRoleBadgeVariant(role)} className="gap-1">
          <IconShield className="h-3 w-3" />
          {role}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'emailVerified',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email Status" />
    ),
    cell: ({ row }) => {
      const verified = row.getValue('emailVerified') as boolean;
      return (
        <Badge variant={verified ? 'default' : 'secondary'} className="gap-1">
          {verified ? (
            <>
              <IconMailCheck className="h-3 w-3" />
              Verified
            </>
          ) : (
            <>
              <IconMail className="h-3 w-3" />
              Not Verified
            </>
          )}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'lastLogin',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Login" />
    ),
    cell: ({ row }) => {
      const lastLogin = row.getValue('lastLogin') as string | null;
      if (!lastLogin) {
        return <span className="text-sm text-muted-foreground">Never</span>;
      }
      const date = new Date(lastLogin);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) {
        return <span className="text-sm text-green-600">Today</span>;
      } else if (days === 1) {
        return <span className="text-sm text-muted-foreground">Yesterday</span>;
      } else if (days < 7) {
        return (
          <span className="text-sm text-muted-foreground">{days} days ago</span>
        );
      } else {
        return (
          <span className="text-sm text-muted-foreground">
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        );
      }
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex justify-end">
          <Button asChild variant="ghost" size="sm">
            <Link to="/users/$userId" params={{ userId: user.id.toString() }}>
              View Details
            </Link>
          </Button>
        </div>
      );
    },
  },
];
