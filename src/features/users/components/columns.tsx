import { type ColumnDef } from '@tanstack/react-table';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  IconMail,
  IconMailCheck,
  IconShield,
  IconUser,
  IconDotsVertical,
  IconArrowsExchange,
  IconEye,
  IconBrandGoogle,
  IconBrandTelegram,
  IconBrandX,
  IconBrandMatrix,
  IconBrandDiscord,
  IconKey,
  IconWallet,
  IconCurrencySolana,
  IconCurrencyEthereum,
  IconCrown,
  IconCreditCard,
  IconUsers,
  IconStar,
  IconCopy,
  IconCheck,
  IconBan,
  IconLoader2,
} from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useBlockUser } from '../api/admin-users';
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

// Get provider icon component
const getProviderIcon = (provider: string) => {
  const iconClass = 'h-4 w-4 transition-colors';

  switch (provider.toLowerCase()) {
    case 'google-oauth2':
    case 'google':
      return <IconBrandGoogle className={`${iconClass} text-red-500`} />;
    case 'telegram':
      return <IconBrandTelegram className={`${iconClass} text-blue-500`} />;
    case 'twitter':
    case 'x':
      return <IconBrandX className={`${iconClass} text-foreground`} />;
    case 'matrix':
      return <IconBrandMatrix className={`${iconClass} text-green-500`} />;
    case 'discord':
      return <IconBrandDiscord className={`${iconClass} text-indigo-500`} />;
    case 'keycloak':
      return <IconKey className={`${iconClass} text-orange-500`} />;
    case 'evm':
      return <IconCurrencyEthereum className={`${iconClass} text-indigo-500`} />;
    case 'solana':
      return <IconCurrencySolana className={`${iconClass} text-purple-500`} />;
    default:
      return <IconWallet className={`${iconClass} text-muted-foreground`} />;
  }
};

const getProviderLabel = (provider: string) => {
  switch (provider.toLowerCase()) {
    case 'google-oauth2': return 'Google';
    case 'telegram': return 'Telegram';
    case 'twitter':
    case 'x': return 'X (Twitter)';
    case 'matrix': return 'Matrix';
    case 'discord': return 'Discord';
    case 'keycloak': return 'Keycloak';
    case 'evm': return 'EVM Wallet';
    case 'solana': return 'Solana';
    default: return provider;
  }
};

function ConnectedAccountBadge({ identity }: { identity: AuthIdentity }) {
  const displayValue = identity.authName || identity.authId;
  // Truncate long values (addresses)
  const truncated = displayValue.length > 16 ? displayValue.slice(0, 6) + '...' + displayValue.slice(-4) : displayValue;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border bg-muted/50 hover:bg-muted transition-colors cursor-default">
            {getProviderIcon(identity.provider)}
            <span className="text-xs font-medium text-muted-foreground">{truncated}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="font-semibold">{getProviderLabel(identity.provider)}</p>
          <p className="text-xs text-muted-foreground font-mono">{displayValue}</p>
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
    accessorKey: 'premium',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Premium" />,
    cell: ({ row }) => {
      const premium = row.original.premium;
      if (!premium?.isActive) {
        return <span className="text-xs text-muted-foreground">-</span>;
      }
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="default" className="gap-1 bg-amber-500 hover:bg-amber-600">
                <IconCrown className="h-3 w-3" />
                L{premium.level || 1}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-semibold">{premium.bundleTitle}</p>
              {premium.expiresAt && (
                <p className="text-xs text-muted-foreground">
                  Expires: {new Date(premium.expiresAt).toLocaleDateString()}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: 'cardsCount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Cards" />,
    cell: ({ row }) => {
      const count = row.original.cardsCount || 0;
      if (count === 0) {
        return <span className="text-xs text-muted-foreground">0</span>;
      }
      return (
        <div className="flex items-center gap-1">
          <IconCreditCard className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">{count}</span>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'referralsCount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Referrals" />,
    cell: ({ row }) => {
      const count = row.original.referralsCount || 0;
      if (count === 0) {
        return <span className="text-xs text-muted-foreground">0</span>;
      }
      return (
        <div className="flex items-center gap-1">
          <IconUsers className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">{count}</span>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'totalXp',
    header: ({ column }) => <DataTableColumnHeader column={column} title="XP" />,
    cell: ({ row }) => {
      const xp = row.original.totalXp || 0;
      if (xp === 0) {
        return <span className="text-xs text-muted-foreground">0</span>;
      }
      return (
        <div className="flex items-center gap-1">
          <IconStar className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">{xp.toLocaleString()}</span>
        </div>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: 'uid',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ref Code" />,
    cell: function RefCodeCell({ row }) {
      const [copied, setCopied] = useState(false);
      const uid = row.original.uid;

      const handleCopy = async () => {
        try {
          await navigator.clipboard.writeText(uid);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      };

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 hover:bg-muted transition-colors font-mono text-xs"
              >
                {uid.slice(0, 8)}...
                {copied ? (
                  <IconCheck className="h-3 w-3 text-green-500" />
                ) : (
                  <IconCopy className="h-3 w-3 text-muted-foreground" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-mono text-xs">{uid}</p>
              <p className="text-xs text-muted-foreground">Click to copy</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableSorting: false,
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
    cell: function ActionsCell({ row }) {
      const user = row.original;
      const navigate = useNavigate();
      const blockUser = useBlockUser();

      const handleBlockUser = () => {
        if (!confirm(`Are you sure you want to block user ${user.email || user.nickname || user.id}?`)) {
          return;
        }
        blockUser.mutate(
          { userId: user.id },
          {
            onSuccess: () => {
              toast.success('User blocked successfully');
            },
            onError: (error: Error) => {
              toast.error(`Failed to block user: ${error.message}`);
            },
          }
        );
      };

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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleBlockUser}
                disabled={blockUser.isPending}
              >
                {blockUser.isPending ? (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <IconBan className="mr-2 h-4 w-4" />
                )}
                Block User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
