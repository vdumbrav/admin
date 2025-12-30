import { type ColumnDef } from '@tanstack/react-table';
import { Link, useNavigate } from '@tanstack/react-router';
import { IconMail, IconMailCheck, IconShield, IconUser, IconDotsVertical, IconArrowsExchange, IconEye, IconBrandGoogle, IconBrandTelegram, IconBrandTwitter, IconKey, IconWallet, IconCurrencySolana } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import type { User, AuthIdentity } from '../types';

// Provider icons and colors
const providerConfig: Record<string, { icon: typeof IconBrandGoogle; label: string; className: string }> = {
  'google-oauth2': { icon: IconBrandGoogle, label: 'Google', className: 'bg-red-100 text-red-700 hover:bg-red-200' },
  'telegram': { icon: IconBrandTelegram, label: 'Telegram', className: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  'twitter': { icon: IconBrandTwitter, label: 'Twitter', className: 'bg-sky-100 text-sky-700 hover:bg-sky-200' },
  'matrix': { icon: IconUser, label: 'Matrix', className: 'bg-green-100 text-green-700 hover:bg-green-200' },
  'keycloak': { icon: IconKey, label: 'Keycloak', className: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
  'evm': { icon: IconWallet, label: 'EVM', className: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
  'solana': { icon: IconCurrencySolana, label: 'Solana', className: 'bg-violet-100 text-violet-700 hover:bg-violet-200' },
};

function ConnectedAccountBadge({ identity }: { identity: AuthIdentity }) {
  const config = providerConfig[identity.provider] || { icon: IconUser, label: identity.provider, className: 'bg-gray-100 text-gray-700' };
  const Icon = config.icon;
  const displayValue = identity.authName || identity.authId;
  // Truncate long values
  const truncated = displayValue.length > 20 ? displayValue.slice(0, 8) + '...' + displayValue.slice(-6) : displayValue;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`gap-1 text-xs cursor-default ${config.className}`}>
            <Icon className="h-3 w-3" />
            {truncated}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{config.label}</p>
          <p className="text-xs text-muted-foreground">{displayValue}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

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
    filterFn: (row, id, value) => {
      return row.getValue(id) === value;
    },
  },
  {
    accessorKey: 'authIdentities',
    header: 'Connected',
    cell: ({ row }) => {
      const identities = row.original.authIdentities || [];
      if (identities.length === 0) {
        return <span className="text-xs text-muted-foreground">None</span>;
      }
      return (
        <div className="flex flex-wrap gap-1 max-w-[300px]">
          {identities.map((identity, idx) => (
            <ConnectedAccountBadge key={idx} identity={identity} />
          ))}
        </div>
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
      const navigate = useNavigate();

      return (
        <div className="flex justify-end gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/users/$userId" params={{ userId: user.id.toString() }}>
              <IconEye className="mr-1 h-4 w-4" />
              View
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  navigate({
                    to: '/transactions',
                    search: { userId: user.id },
                  })
                }
              >
                <IconArrowsExchange className="mr-2 h-4 w-4" />
                View Transactions
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
