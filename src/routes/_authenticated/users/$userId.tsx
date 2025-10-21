import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  IconMail,
  IconCalendar,
  IconShield,
  IconUser,
  IconBrandMatrix,
  IconCreditCard,
  IconCrown,
  IconTrophy,
  IconUsers,
  IconCoin,
  IconListCheck,
  IconReceipt,
} from '@tabler/icons-react';
import { useAdminUserDetails } from '@/features/users/api/admin-users';

export const Route = createFileRoute('/_authenticated/users/$userId')({
  component: UserDetailsPage,
});

function UserDetailsPage() {
  const { userId } = Route.useParams();
  const { data: user, isLoading, error } = useAdminUserDetails(userId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64 md:col-span-2" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">User Not Found</h1>
          <p className="text-muted-foreground">The requested user could not be found.</p>
        </div>
      </div>
    );
  }

  const displayName = user.name || user.nickname || user.email || `User ${user.id}`;
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">User Details</h1>
        <p className="text-muted-foreground">
          Comprehensive information for {displayName}
        </p>
      </div>

      {/* Profile and Basic Info */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatarUri || undefined} alt={displayName} />
              <AvatarFallback className="text-2xl">
                {user.avatarUri ? <IconUser className="h-12 w-12" /> : initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-bold">{displayName}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant={user.role === 'Administrator' ? 'destructive' : 'default'}>
                <IconShield className="mr-1 h-3 w-3" />
                {user.role}
              </Badge>
              {user.premiumStatus.isActive && (
                <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
                  <IconCrown className="mr-1 h-3 w-3" />
                  Premium L{user.premiumStatus.bundle?.level}
                </Badge>
              )}
            </div>
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
                  <p className="text-sm text-muted-foreground">{user.email || 'Not provided'}</p>
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
                    {' '}({user.activityStats.daysOnPlatform} days ago)
                  </p>
                </div>
              </div>

              {user.lastLogin && (
                <>
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
                </>
              )}

              {user.matrixId && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <IconBrandMatrix className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Matrix ID</p>
                      <p className="text-sm text-muted-foreground font-mono text-xs">
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

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <IconTrophy className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total XP</p>
                <p className="text-xl font-bold">{user.xp.totalXp.toLocaleString()}</p>
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
                <p className="text-xs text-muted-foreground">Quests</p>
                <p className="text-xl font-bold">{user.completedQuests.length}</p>
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
                <p className="text-xs text-muted-foreground">Cards</p>
                <p className="text-xl font-bold">{user.cards.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2">
                <IconUsers className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Referrals</p>
                <p className="text-xl font-bold">{user.referralStats.totalReferrals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Premium Status & XP */}
      <div className="grid gap-6 md:grid-cols-2">
        {user.premiumStatus.isActive && user.premiumStatus.bundle && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconCrown className="h-5 w-5 text-amber-500" />
                Premium Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Bundle</p>
                <p className="text-lg font-bold">{user.premiumStatus.bundle.title}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Level</p>
                  <p className="text-sm font-bold">{user.premiumStatus.bundle.level}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Boost</p>
                  <p className="text-sm font-bold">{user.premiumStatus.bundle.boost}x</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="text-sm font-bold">${user.premiumStatus.bundle.price}</p>
                </div>
              </div>
              {user.premiumStatus.activeFrom && user.premiumStatus.activeTo && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">Active Period</p>
                  <p className="text-sm">
                    {new Date(user.premiumStatus.activeFrom).toLocaleDateString()} - {new Date(user.premiumStatus.activeTo).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCoin className="h-5 w-5 text-blue-500" />
              XP Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(user.xp.byType).length > 0 ? (
                Object.entries(user.xp.byType).map(([type, amount]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{type}</span>
                    <span className="text-sm font-bold">{amount.toLocaleString()} XP</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No XP earned yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUsers className="h-5 w-5 text-amber-500" />
            Referral Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Referrals</p>
              <p className="text-2xl font-bold">{user.referralStats.totalReferrals}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-bold">{user.referralStats.totalEarnings} XP</p>
            </div>
            {user.referralStats.referredBy && (
              <div>
                <p className="text-sm text-muted-foreground">Referred By</p>
                <p className="text-sm font-medium">
                  {user.referralStats.referredBy.email || user.referralStats.referredBy.nickname || `User ${user.referralStats.referredBy.id}`}
                </p>
              </div>
            )}
          </div>
          {user.referralStats.referrals.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-sm font-medium mb-3">Recent Referrals</p>
                <div className="space-y-2">
                  {user.referralStats.referrals.slice(0, 10).map((referral) => (
                    <div key={referral.id} className="flex justify-between items-center text-sm">
                      <span>{referral.email || referral.nickname || `User ${referral.id}`}</span>
                      <span className="text-muted-foreground text-xs">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Cards and Quests */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCreditCard className="h-5 w-5 text-purple-500" />
              Cards ({user.cards.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.cards.length > 0 ? (
              <div className="space-y-3">
                {user.cards.slice(0, 10).map((card) => (
                  <div key={card.id} className="flex justify-between items-center p-3 rounded-lg border">
                    <div>
                      <p className="font-mono text-sm font-medium">{card.cardMasked}</p>
                      {card.cardName && <p className="text-xs text-muted-foreground">{card.cardName}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{card.balance} {card.currency}</p>
                      <Badge variant={card.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {card.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No cards found
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconListCheck className="h-5 w-5 text-green-500" />
              Completed Quests ({user.completedQuests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.completedQuests.length > 0 ? (
              <div className="space-y-3">
                {user.completedQuests.slice(0, 10).map((quest) => (
                  <div key={quest.id} className="flex justify-between items-center p-3 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{quest.taskTitle}</p>
                      {quest.completedAt && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(quest.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {quest.reward && (
                      <div className="text-right">
                        <p className="text-sm font-bold text-blue-600">+{quest.reward} XP</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No completed quests
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconReceipt className="h-5 w-5 text-indigo-500" />
            Recent Transactions ({user.recentTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.recentTransactions.length > 0 ? (
            <div className="space-y-2">
              {user.recentTransactions.slice(0, 20).map((tx) => (
                <div key={tx.id} className="flex justify-between items-center p-3 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium capitalize">{tx.type}</p>
                      {tx.merchant && (
                        <span className="text-xs text-muted-foreground">· {tx.merchant}</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleString()}
                      {tx.category && ` · ${tx.category}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{tx.amount} {tx.currency}</p>
                    <Badge variant="secondary" className="text-xs">
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No transactions found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
