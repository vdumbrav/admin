import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  IconClock,
  IconSettings,
  IconBan,
  IconUserPlus,
  IconKey,
  IconActivity,
  IconSnowflake,
  IconLock,
  IconLockOpen,
} from '@tabler/icons-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  useAdminUserDetails,
  useUpdateUserRole,
  useFreezeCard,
  useUnfreezeCard,
  useBlockCard,
} from '@/features/users/api/admin-users';
import { useState } from 'react';

export const Route = createFileRoute('/_authenticated/users/$userId')({
  component: UserDetailsPage,
});

function UserDetailsPage() {
  const { userId } = Route.useParams();
  const { data: user, isLoading, error } = useAdminUserDetails(userId);
  const updateRoleMutation = useUpdateUserRole();
  const freezeCardMutation = useFreezeCard();
  const unfreezeCardMutation = useUnfreezeCard();
  const blockCardMutation = useBlockCard();

  const [activeTab, setActiveTab] = useState('overview');
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [cardActionDialog, setCardActionDialog] = useState<{
    open: boolean;
    action: 'freeze' | 'unfreeze' | 'block' | null;
    cardId: number | null;
    cardMasked: string;
  }>({
    open: false,
    action: null,
    cardId: null,
    cardMasked: '',
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-20 w-full" />
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
        <PageHeader
          title="User Not Found"
          description="The requested user could not be found."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Users', href: '/users' },
            { label: 'Not Found' },
          ]}
        />
      </div>
    );
  }

  const displayName = user.name || user.nickname || user.email || `User ${user.id}`;
  const initials = displayName.substring(0, 2).toUpperCase();

  // Generate activity timeline from user data
  const generateTimeline = () => {
    const events = [];

    // User created
    events.push({
      type: 'user_created',
      title: 'User Registered',
      description: `Joined the platform`,
      date: user.createdAt,
      icon: IconUserPlus,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    });

    // Premium activation
    if (user.premiumStatus.isActive && user.premiumStatus.activeFrom) {
      events.push({
        type: 'premium_activated',
        title: 'Premium Activated',
        description: `Subscribed to ${user.premiumStatus.bundle?.title || 'Premium'}`,
        date: user.premiumStatus.activeFrom,
        icon: IconCrown,
        color: 'text-amber-600',
        bgColor: 'bg-amber-500/10',
      });
    }

    // Cards created
    user.cards.slice(0, 3).forEach((card) => {
      events.push({
        type: 'card_created',
        title: 'Card Issued',
        description: `Created card ${card.cardMasked}`,
        date: card.createdAt,
        icon: IconCreditCard,
        color: 'text-purple-600',
        bgColor: 'bg-purple-500/10',
      });
    });

    // Major quests completed
    user.completedQuests.slice(0, 5).forEach((quest) => {
      if (quest.completedAt) {
        events.push({
          type: 'quest_completed',
          title: 'Quest Completed',
          description: quest.taskTitle,
          date: quest.completedAt,
          icon: IconListCheck,
          color: 'text-green-600',
          bgColor: 'bg-green-500/10',
        });
      }
    });

    // Last login
    if (user.lastLogin) {
      events.push({
        type: 'last_login',
        title: 'Last Login',
        description: 'Most recent platform access',
        date: user.lastLogin,
        icon: IconActivity,
        color: 'text-gray-600',
        bgColor: 'bg-gray-500/10',
      });
    }

    // Sort by date descending
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  };

  const timeline = generateTimeline();

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setRoleDialogOpen(true);
  };

  const confirmRoleChange = async () => {
    try {
      await updateRoleMutation.mutateAsync({
        userId: user.id,
        role: selectedRole,
      });
      toast.success('User role updated successfully');
      setRoleDialogOpen(false);
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const handleCardAction = (action: 'freeze' | 'unfreeze' | 'block', cardId: number, cardMasked: string) => {
    setCardActionDialog({
      open: true,
      action,
      cardId,
      cardMasked,
    });
  };

  const confirmCardAction = async () => {
    if (!cardActionDialog.cardId || !cardActionDialog.action) return;

    try {
      const mutations = {
        freeze: freezeCardMutation,
        unfreeze: unfreezeCardMutation,
        block: blockCardMutation,
      };

      await mutations[cardActionDialog.action].mutateAsync({
        userId: user.id,
        cardId: cardActionDialog.cardId,
      });

      toast.success(`Card ${cardActionDialog.action}d successfully`);
      setCardActionDialog({ open: false, action: null, cardId: null, cardMasked: '' });
    } catch (error) {
      toast.error(`Failed to ${cardActionDialog.action} card`);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="User Details"
        description={`Comprehensive information for ${displayName}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Users', href: '/users' },
          { label: displayName },
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="quests">Quests</TabsTrigger>
          <TabsTrigger value="premium">Premium & XP</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
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

          {/* Recent Activity Preview */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <IconCreditCard className="h-5 w-5 text-purple-500" />
                    Recent Cards
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('cards')}>View All</Button>
                </div>
              </CardHeader>
              <CardContent>
                {user.cards.length > 0 ? (
                  <div className="space-y-2">
                    {user.cards.slice(0, 3).map((card) => (
                      <div key={card.id} className="flex justify-between items-center p-2 rounded-lg border">
                        <div>
                          <p className="font-mono text-sm font-medium">{card.cardMasked}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={card.status === 'active' ? 'default' : card.status === 'frozen' ? 'secondary' : 'destructive'} className="text-xs capitalize">
                            {card.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No cards found</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <IconReceipt className="h-5 w-5 text-indigo-500" />
                    Recent Transactions
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('transactions')}>View All</Button>
                </div>
              </CardHeader>
              <CardContent>
                {user.recentTransactions.length > 0 ? (
                  <div className="space-y-2">
                    {user.recentTransactions.slice(0, 3).map((tx) => (
                      <div key={tx.id} className="flex justify-between items-center p-2 rounded-lg border">
                        <p className="text-sm font-medium capitalize">{tx.type}</p>
                        <p className="text-sm font-bold">{tx.amount} {tx.currency}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No transactions found</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cards Tab */}
        <TabsContent value="cards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconCreditCard className="h-5 w-5 text-purple-500" />
                All Cards ({user.cards.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.cards.length > 0 ? (
                <div className="space-y-3">
                  {user.cards.map((card) => (
                    <div key={card.id} className="flex flex-col gap-2 p-3 rounded-lg border">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-mono text-sm font-medium">{card.cardMasked}</p>
                          {card.cardName && <p className="text-xs text-muted-foreground">{card.cardName}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{card.balance} {card.currency}</p>
                          <Badge variant={card.status === 'active' ? 'default' : card.status === 'frozen' ? 'secondary' : 'destructive'} className="text-xs capitalize">
                            {card.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {card.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCardAction('freeze', card.id, card.cardMasked)}
                            disabled={freezeCardMutation.isPending}
                          >
                            <IconSnowflake className="mr-1 h-3 w-3" />
                            Freeze
                          </Button>
                        )}
                        {card.status === 'frozen' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCardAction('unfreeze', card.id, card.cardMasked)}
                            disabled={unfreezeCardMutation.isPending}
                          >
                            <IconLockOpen className="mr-1 h-3 w-3" />
                            Unfreeze
                          </Button>
                        )}
                        {card.status !== 'blocked' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCardAction('block', card.id, card.cardMasked)}
                            disabled={blockCardMutation.isPending}
                          >
                            <IconLock className="mr-1 h-3 w-3" />
                            Block
                          </Button>
                        )}
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
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconReceipt className="h-5 w-5 text-indigo-500" />
                All Transactions ({user.recentTransactions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.recentTransactions.length > 0 ? (
                <div className="space-y-2">
                  {user.recentTransactions.map((tx) => (
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
        </TabsContent>

        {/* Quests Tab */}
        <TabsContent value="quests" className="space-y-6">
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
                  {user.completedQuests.map((quest) => (
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
        </TabsContent>

        {/* Premium & XP Tab */}
        <TabsContent value="premium" className="space-y-6">
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
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">Total XP</p>
                  <p className="text-3xl font-bold">{user.xp.totalXp.toLocaleString()}</p>
                </div>
                <Separator className="my-4" />
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
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="space-y-6">
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
                    <p className="text-sm font-medium mb-3">All Referrals</p>
                    <div className="space-y-2">
                      {user.referralStats.referrals.map((referral) => (
                        <div key={referral.id} className="flex justify-between items-center p-2 rounded-lg border">
                          <span className="text-sm">{referral.email || referral.nickname || `User ${referral.id}`}</span>
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
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconClock className="h-5 w-5 text-indigo-500" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.map((event, index) => {
                  const Icon = event.icon;
                  return (
                    <div key={`${event.type}-${index}`} className="flex gap-3">
                      <div className={`rounded-lg ${event.bgColor} p-2 h-fit`}>
                        <Icon className={`h-4 w-4 ${event.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium">{event.title}</p>
                            <p className="text-xs text-muted-foreground">{event.description}</p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {new Date(event.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Tab */}
        <TabsContent value="admin" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconSettings className="h-5 w-5 text-gray-500" />
                Admin Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">User Management</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <IconShield className="h-4 w-4 text-muted-foreground" />
                      <Select value={user.role} onValueChange={handleRoleChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Client">Client</SelectItem>
                          <SelectItem value="Support">Support</SelectItem>
                          <SelectItem value="Administrator">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" disabled>
                        <IconBan className="mr-2 h-4 w-4" />
                        Ban User
                      </Button>
                      <Button variant="outline" size="sm" disabled>
                        <IconKey className="mr-2 h-4 w-4" />
                        Reset Password
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-2">Rewards & XP</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" disabled>
                      <IconCoin className="mr-2 h-4 w-4" />
                      Add XP Manually
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <IconCrown className="mr-2 h-4 w-4" />
                      Grant Premium
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-2">Information</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" disabled>
                      <IconActivity className="mr-2 h-4 w-4" />
                      View Activity Logs
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <IconReceipt className="mr-2 h-4 w-4" />
                      Export Data
                    </Button>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Some admin actions are still in development.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Role Change Confirmation Dialog */}
      <AlertDialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change {displayName}'s role to <strong>{selectedRole}</strong>?
              This action will immediately update the user's permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange} disabled={updateRoleMutation.isPending}>
              {updateRoleMutation.isPending ? 'Updating...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Card Action Confirmation Dialog */}
      <AlertDialog open={cardActionDialog.open} onOpenChange={(open) => !open && setCardActionDialog({ open: false, action: null, cardId: null, cardMasked: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {cardActionDialog.action === 'freeze' && 'Freeze Card'}
              {cardActionDialog.action === 'unfreeze' && 'Unfreeze Card'}
              {cardActionDialog.action === 'block' && 'Block Card'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {cardActionDialog.action === 'freeze' && `Are you sure you want to freeze card ${cardActionDialog.cardMasked}? The user won't be able to use it until unfrozen.`}
              {cardActionDialog.action === 'unfreeze' && `Are you sure you want to unfreeze card ${cardActionDialog.cardMasked}? The user will be able to use it again.`}
              {cardActionDialog.action === 'block' && `Are you sure you want to permanently block card ${cardActionDialog.cardMasked}? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCardAction}
              disabled={freezeCardMutation.isPending || unfreezeCardMutation.isPending || blockCardMutation.isPending}
              className={cardActionDialog.action === 'block' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {(freezeCardMutation.isPending || unfreezeCardMutation.isPending || blockCardMutation.isPending) ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
