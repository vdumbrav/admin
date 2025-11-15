import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
  IconUserPlus,
  IconActivity,
  IconSnowflake,
  IconLock,
  IconLockOpen,
  IconTrash,
  IconPlus,
  IconMinus,
  IconAlertTriangle,
  IconFilter,
  IconX,
  IconArrowUp,
  IconArrowDown,
  IconRefresh,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  useAdminUserDetails,
  useUpdateUserRole,
  useFreezeCard,
  useUnfreezeCard,
  useBlockCard,
  useAdjustUserXP,
  useGrantPremium,
  useRevokePremium,
  useDeleteUser,
  useUpdateCameraQuestAccess,
} from '@/features/users/api/admin-users';
import { useAvailableCards, useManuallyGiveCard } from '@/features/camera-quest/api';
import { EPrizeCardStatus } from '@/features/camera-quest/types';
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';

export const Route = createFileRoute('/_authenticated/users/$userId')({
  component: UserDetailsPage,
});

// Transaction type icons
function getTransactionIcon(type: string) {
  const typeMap: Record<string, any> = {
    'card_topup': IconArrowDown,
    'card_purchase': IconCreditCard,
    'card_payment': IconCreditCard,
    'card_refund': IconRefresh,
    'deposit': IconArrowDown,
    'withdrawal': IconArrowUp,
    'transfer': IconArrowUp,
    'fee': IconReceipt,
    'reward': IconTrophy,
  };
  return typeMap[type.toLowerCase()] || IconReceipt;
}

function UserDetailsPage() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  const { data: user, isLoading, error } = useAdminUserDetails(userId);
  const updateRoleMutation = useUpdateUserRole();
  const freezeCardMutation = useFreezeCard();
  const unfreezeCardMutation = useUnfreezeCard();
  const blockCardMutation = useBlockCard();
  const adjustXPMutation = useAdjustUserXP();
  const grantPremiumMutation = useGrantPremium();
  const revokePremiumMutation = useRevokePremium();
  const deleteUserMutation = useDeleteUser();
  const updateCameraQuestAccessMutation = useUpdateCameraQuestAccess();

  const [activeTab, setActiveTab] = useState('overview');
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');

  // Card filter state
  const [cardStatusFilter, setCardStatusFilter] = useState<string>('all');

  // Transaction filter state
  const [txTypeFilter, setTxTypeFilter] = useState<string>('all');
  const [txStatusFilter, setTxStatusFilter] = useState<string>('all');
  const [txSearchQuery, setTxSearchQuery] = useState('');

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

  // XP dialog state
  const [xpDialogOpen, setXpDialogOpen] = useState(false);
  const [xpAmount, setXpAmount] = useState('');
  const [xpReason, setXpReason] = useState('');

  // Premium dialog state
  const [premiumDialogOpen, setPremiumDialogOpen] = useState(false);
  const [premiumAction, setPremiumAction] = useState<'grant' | 'revoke'>('grant');
  const [premiumBundleId, setPremiumBundleId] = useState('1');
  const [premiumDuration, setPremiumDuration] = useState('30');

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(1);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Give prize card dialog state
  const [giveCardDialogOpen, setGiveCardDialogOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [cardSearch, setCardSearch] = useState('');

  // Camera Quest API hooks
  const { data: availableCardsData } = useAvailableCards({ search: cardSearch, limit: 50 });
  const giveCardMutation = useManuallyGiveCard();

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

  // Filter cards - not memoized to avoid array reference issues causing re-renders
  const filteredCards = cardStatusFilter === 'all'
    ? user.cards
    : user.cards.filter(card => card.status === cardStatusFilter);

  // Filter transactions - not memoized to avoid array reference issues
  let filteredTransactions = user.recentTransactions;

  if (txTypeFilter !== 'all') {
    filteredTransactions = filteredTransactions.filter(tx => tx.type.toLowerCase() === txTypeFilter.toLowerCase());
  }

  if (txStatusFilter !== 'all') {
    filteredTransactions = filteredTransactions.filter(tx => tx.status.toLowerCase() === txStatusFilter.toLowerCase());
  }

  if (txSearchQuery.trim()) {
    const query = txSearchQuery.toLowerCase();
    filteredTransactions = filteredTransactions.filter(tx =>
      tx.type.toLowerCase().includes(query) ||
      tx.merchant?.toLowerCase().includes(query) ||
      tx.category?.toLowerCase().includes(query)
    );
  }

  // Generate activity timeline from user data
  // Computed on every render to avoid complex memoization dependencies
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
  const timeline = events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

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

  const handleCameraQuestAccessChange = async (canAccess: boolean) => {
    try {
      await updateCameraQuestAccessMutation.mutateAsync({
        userId: user.id,
        canAccess,
      });
      toast.success(`Camera Quest access ${canAccess ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      toast.error('Failed to update Camera Quest access');
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

  const handleXPAdjustment = async () => {
    const amount = parseInt(xpAmount);
    if (isNaN(amount) || amount === 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!xpReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    try {
      await adjustXPMutation.mutateAsync({
        userId: user.id,
        amount,
        reason: xpReason,
      });
      toast.success(`XP ${amount > 0 ? 'added' : 'removed'} successfully`);
      setXpDialogOpen(false);
      setXpAmount('');
      setXpReason('');
    } catch (error) {
      toast.error('Failed to adjust XP');
    }
  };

  const handlePremiumAction = async () => {
    try {
      if (premiumAction === 'grant') {
        await grantPremiumMutation.mutateAsync({
          userId: user.id,
          bundleId: parseInt(premiumBundleId),
          duration: parseInt(premiumDuration),
        });
        toast.success('Premium granted successfully');
      } else {
        await revokePremiumMutation.mutateAsync({ userId: user.id });
        toast.success('Premium revoked successfully');
      }
      setPremiumDialogOpen(false);
    } catch (error) {
      toast.error(`Failed to ${premiumAction} premium`);
    }
  };

  const handleDeleteUser = async () => {
    if (deleteConfirmStep === 1) {
      setDeleteConfirmStep(2);
      return;
    }

    const expectedText = user.email || user.nickname || userId;
    if (deleteConfirmText !== expectedText) {
      toast.error('Confirmation text does not match');
      return;
    }

    try {
      await deleteUserMutation.mutateAsync({ userId: user.id });
      toast.success('User deleted successfully');
      setDeleteDialogOpen(false);
      navigate({ to: '/users' });
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const resetDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteConfirmStep(1);
    setDeleteConfirmText('');
  };

  const handleGivePrizeCard = async () => {
    if (!selectedCardId) {
      toast.error('Please select a card');
      return;
    }

    try {
      await giveCardMutation.mutateAsync({
        prizeCardId: selectedCardId,
        userId: user.id,
      });
      toast.success('Prize card given successfully');
      setGiveCardDialogOpen(false);
      setSelectedCardId(null);
      setCardSearch('');
      void refetch();
    } catch (error) {
      toast.error('Failed to give prize card');
    }
  };

  // Calculate referral conversion and engagement metrics
  // Not memoized to avoid dependency issues with array references
  const totalReferrals = user.referralStats.totalReferrals;
  const activeReferrals = user.referralStats.referrals.filter(r => {
    // Consider a referral active if they were created more than 7 days ago
    const daysSinceJoined = Math.floor((Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceJoined > 7;
  }).length;

  const conversionRate = totalReferrals > 0 ? (activeReferrals / totalReferrals) * 100 : 0;
  const avgEarningsPerReferral = totalReferrals > 0 ? user.referralStats.totalEarnings / totalReferrals : 0;

  const referralMetrics = {
    totalReferrals,
    activeReferrals,
    conversionRate: conversionRate.toFixed(1),
    avgEarningsPerReferral: Math.round(avgEarningsPerReferral),
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
        <ScrollArea className="w-full whitespace-nowrap">
          <TabsList className="inline-flex w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="quests">Quests</TabsTrigger>
            <TabsTrigger value="premium">Premium & XP</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

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
                    {user.recentTransactions.slice(0, 3).map((tx) => {
                      const Icon = getTransactionIcon(tx.type);
                      return (
                        <div key={tx.id} className="flex justify-between items-center p-2 rounded-lg border">
                          <div className="flex items-center gap-2">
                            <div className="rounded-full bg-indigo-500/10 p-1.5">
                              <Icon className="h-3 w-3 text-indigo-600" />
                            </div>
                            <p className="text-sm font-medium capitalize">{tx.type}</p>
                          </div>
                          <p className="text-sm font-bold">{tx.amount} {tx.currency}</p>
                        </div>
                      );
                    })}
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
              <div className="flex items-center justify-between flex-wrap gap-3">
                <CardTitle className="flex items-center gap-2">
                  <IconCreditCard className="h-5 w-5 text-purple-500" />
                  All Cards ({filteredCards.length})
                </CardTitle>
                <div className="flex items-center gap-2">
                  <IconFilter className="h-4 w-4 text-muted-foreground" />
                  <Select value={cardStatusFilter} onValueChange={setCardStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="frozen">Frozen</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                  {cardStatusFilter !== 'all' && (
                    <Button variant="ghost" size="icon" onClick={() => setCardStatusFilter('all')}>
                      <IconX className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredCards.length > 0 ? (
                <div className="space-y-3">
                  {filteredCards.map((card) => (
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
                  No cards found with the selected filters
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3">
                <CardTitle className="flex items-center gap-2">
                  <IconReceipt className="h-5 w-5 text-indigo-500" />
                  All Transactions ({filteredTransactions.length})
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    placeholder="Search by merchant, type, or category..."
                    value={txSearchQuery}
                    onChange={(e) => setTxSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                  <Select value={txTypeFilter} onValueChange={setTxTypeFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="card_topup">Card Top-up</SelectItem>
                      <SelectItem value="card_purchase">Purchase</SelectItem>
                      <SelectItem value="card_payment">Payment</SelectItem>
                      <SelectItem value="card_refund">Refund</SelectItem>
                      <SelectItem value="deposit">Deposit</SelectItem>
                      <SelectItem value="withdrawal">Withdrawal</SelectItem>
                      <SelectItem value="fee">Fee</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={txStatusFilter} onValueChange={setTxStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  {(txTypeFilter !== 'all' || txStatusFilter !== 'all' || txSearchQuery) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setTxTypeFilter('all');
                        setTxStatusFilter('all');
                        setTxSearchQuery('');
                      }}
                    >
                      <IconX className="mr-1 h-4 w-4" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length > 0 ? (
                <div className="space-y-2">
                  {filteredTransactions.map((tx) => {
                    const Icon = getTransactionIcon(tx.type);
                    return (
                      <div key={tx.id} className="flex justify-between items-center p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="rounded-full bg-indigo-500/10 p-2">
                            <Icon className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium capitalize">{tx.type.replace('_', ' ')}</p>
                              {tx.merchant && (
                                <span className="text-xs text-muted-foreground">· {tx.merchant}</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(tx.createdAt).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                              {tx.category && ` · ${tx.category}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{tx.amount} {tx.currency}</p>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No transactions found with the selected filters
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
                            {new Date(quest.completedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
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
                        {new Date(user.premiumStatus.activeFrom).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })} - {new Date(user.premiumStatus.activeTo).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
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
                        <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
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
              <div className="grid gap-4 md:grid-cols-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                  <p className="text-2xl font-bold">{referralMetrics.totalReferrals}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Referrals</p>
                  <p className="text-2xl font-bold">{referralMetrics.activeReferrals}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">{referralMetrics.conversionRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg XP per Referral</p>
                  <p className="text-2xl font-bold">{referralMetrics.avgEarningsPerReferral} XP</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-600">{user.referralStats.totalEarnings} XP</p>
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
                            {new Date(referral.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
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
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                            <br />
                            {new Date(event.date).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
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
              <div className="space-y-6">
                {/* User Management */}
                <div>
                  <p className="text-sm font-medium mb-3">User Management</p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <IconShield className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm">Change Role</Label>
                      <Select value={user.role} onValueChange={handleRoleChange}>
                        <SelectTrigger className="w-full max-w-xs ml-auto">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Client">Client</SelectItem>
                          <SelectItem value="Support">Support</SelectItem>
                          <SelectItem value="Administrator">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <IconActivity className="h-4 w-4 text-muted-foreground" />
                        <Label className="text-sm">Camera Quest Access</Label>
                      </div>
                      <Switch
                        checked={user.canAccessCameraQuest || false}
                        onCheckedChange={handleCameraQuestAccessChange}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Rewards & XP */}
                <div>
                  <p className="text-sm font-medium mb-3">Rewards & XP</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setXpDialogOpen(true)}
                    >
                      <IconCoin className="mr-2 h-4 w-4" />
                      Adjust XP
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setGiveCardDialogOpen(true)}
                    >
                      <IconCreditCard className="mr-2 h-4 w-4" />
                      Give Prize Card
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPremiumAction('grant');
                        setPremiumDialogOpen(true);
                      }}
                    >
                      <IconPlus className="mr-2 h-4 w-4" />
                      Grant Premium
                    </Button>
                    {user.premiumStatus.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPremiumAction('revoke');
                          setPremiumDialogOpen(true);
                        }}
                      >
                        <IconMinus className="mr-2 h-4 w-4" />
                        Revoke Premium
                      </Button>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Danger Zone */}
                <div>
                  <p className="text-sm font-medium mb-3 text-destructive">Danger Zone</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <IconTrash className="mr-2 h-4 w-4" />
                      Delete Account (GDPR)
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Permanent deletion removes all user data including cards, transactions, and personal information according to GDPR regulations.
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

      {/* XP Adjustment Dialog */}
      <Dialog open={xpDialogOpen} onOpenChange={setXpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust User XP</DialogTitle>
            <DialogDescription>
              Add or remove XP from this user's account. Use negative numbers to remove XP.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="xp-amount">Amount</Label>
              <Input
                id="xp-amount"
                type="number"
                placeholder="e.g., 1000 or -500"
                value={xpAmount}
                onChange={(e) => setXpAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="xp-reason">Reason</Label>
              <Input
                id="xp-reason"
                placeholder="e.g., Manual adjustment for promotional reward"
                value={xpReason}
                onChange={(e) => setXpReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setXpDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleXPAdjustment} disabled={adjustXPMutation.isPending}>
              {adjustXPMutation.isPending ? 'Adjusting...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Premium Dialog */}
      <Dialog open={premiumDialogOpen} onOpenChange={setPremiumDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {premiumAction === 'grant' ? 'Grant Premium' : 'Revoke Premium'}
            </DialogTitle>
            <DialogDescription>
              {premiumAction === 'grant'
                ? 'Grant premium subscription to this user.'
                : 'Remove premium subscription from this user.'}
            </DialogDescription>
          </DialogHeader>
          {premiumAction === 'grant' && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="bundle-id">Bundle Level</Label>
                <Select value={premiumBundleId} onValueChange={setPremiumBundleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bundle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1 - 2x Boost</SelectItem>
                    <SelectItem value="2">Level 2 - 3x Boost</SelectItem>
                    <SelectItem value="3">Level 3 - 5x Boost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (days)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={premiumDuration}
                  onChange={(e) => setPremiumDuration(e.target.value)}
                />
              </div>
            </div>
          )}
          {premiumAction === 'revoke' && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                This will immediately revoke the user's premium subscription. They will lose access to all premium features.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPremiumDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePremiumAction}
              disabled={grantPremiumMutation.isPending || revokePremiumMutation.isPending}
              variant={premiumAction === 'revoke' ? 'destructive' : 'default'}
            >
              {(grantPremiumMutation.isPending || revokePremiumMutation.isPending) ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Give Prize Card Dialog */}
      <Dialog open={giveCardDialogOpen} onOpenChange={setGiveCardDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Give Prize Card</DialogTitle>
            <DialogDescription>
              Select an available card from the prize pool to give to this user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Search Cards</Label>
              <Input
                placeholder="Search by card number..."
                value={cardSearch}
                onChange={(e) => setCardSearch(e.target.value)}
              />
            </div>
            <ScrollArea className="h-[300px] rounded-md border">
              <div className="p-4 space-y-2">
                {availableCardsData?.cards && availableCardsData.cards.length > 0 ? (
                  availableCardsData.cards.map((card: any) => (
                    <div
                      key={card.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors",
                        selectedCardId === card.id && "bg-accent border-primary"
                      )}
                      onClick={() => setSelectedCardId(card.id)}
                    >
                      <div className="flex flex-col gap-1">
                        <p className="font-mono text-sm font-medium">{card.cardNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {card.currency} • Balance: ${card.balance?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      {selectedCardId === card.id && (
                        <IconCreditCard className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No available cards found
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setGiveCardDialogOpen(false);
              setSelectedCardId(null);
              setCardSearch('');
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleGivePrizeCard}
              disabled={!selectedCardId || giveCardMutation.isPending}
            >
              {giveCardMutation.isPending ? 'Giving Card...' : 'Give Card'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog (GDPR) */}
      <Dialog open={deleteDialogOpen} onOpenChange={resetDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <IconAlertTriangle className="h-5 w-5" />
              Delete User Account
            </DialogTitle>
            <DialogDescription>
              {deleteConfirmStep === 1 ? (
                <>This action is <strong>permanent and irreversible</strong>. All user data including cards, transactions, and personal information will be permanently deleted according to GDPR regulations.</>
              ) : (
                <>To confirm deletion, please type <strong className="text-foreground">{user.email || user.nickname || userId}</strong> below:</>
              )}
            </DialogDescription>
          </DialogHeader>
          {deleteConfirmStep === 2 && (
            <div className="py-4">
              <Input
                placeholder={`Type "${user.email || user.nickname || userId}" to confirm`}
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={resetDeleteDialog}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? 'Deleting...' : deleteConfirmStep === 1 ? 'Continue' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
