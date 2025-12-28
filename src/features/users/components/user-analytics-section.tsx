import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  IconAlertTriangle,
  IconShield,
  IconUsers,
  IconCreditCard,
  IconWallet,
  IconWorld,
  IconRefresh,
  IconBrain,
  IconTag,
  IconPlus,
  IconX,
  IconCopy,
  IconMail,
  IconChevronDown,
  IconChevronUp,
  IconSearch,
  IconLoader2,
  IconCheck,
  IconActivity,
  IconCalendar,
  IconCoin,
  IconLink,
  IconStar,
  IconTrendingUp,
  IconUserCheck,
} from '@tabler/icons-react';
import {
  useUserAnalytics,
  useRefreshUserAnalytics,
  useAddUserTags,
  useRemoveUserTags,
  useUpdateUserNotes,
} from '@/features/security/api/user-analytics';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';

// Extended analytics type to include all comprehensive data
interface ComprehensiveAnalytics {
  userId: number;
  uid: string;
  analyzedAt?: string;
  basicInfo: {
    nickname?: string;
    email?: string;
    role: string;
    createdAt: string;
    trustScore?: number;
    totalXp?: number;
    questsCompleted?: number;
    connectedWallets?: number;
  };
  riskAssessment: {
    overallScore: number;
    overallLevel: string;
    flags: string[];
    factors: Array<{ factor: string; score: number }>;
  };
  financialSummary?: {
    totalCards: number;
    totalBalance: number;
    totalTransactions: number;
    totalSpent: number;
    totalDeposits: number;
  };
  aiSummary?: string;
  spamChecks?: {
    disposableEmail?: { isDisposable: boolean; reputation: string };
    stopForumSpam?: { isSpammer: boolean; reports: number };
    abuseIpDb?: { abuseScore: number; reports: number };
  };
  multiAccountDetection?: {
    riskLevel?: string;
    totalSuspiciousConnections?: number;
    sameIpUsers?: Array<{ userId: number; email?: string; overlapCount: number }>;
    similarEmails?: Array<{ email: string; similarity: number }>;
    sharedWallets?: Array<{ userId: number; walletAddress: string }>;
  };
  referralFraudAnalysis?: {
    riskLevel?: string;
    riskScore?: number;
    totalReferrals?: number;
    suspiciousReferrals?: number;
    patterns?: {
      sameIpReferrals?: number;
      rapidReferrals?: number;
      disposableEmailReferrals?: number;
      noActivityReferrals?: number;
    };
  };
  cardFraudAnalysis?: {
    riskLevel: string;
    totalCards: number;
    totalTransactions: number;
    declinedTransactions: number;
    zeroBalanceAttempts: number;
    suspiciousPatterns?: {
      multipleDeclines?: boolean;
      rapidTransactions?: boolean;
      highRiskMerchants?: boolean;
      unusualAmounts?: boolean;
      overdraftAttempts?: boolean;
      nightActivity?: boolean;
    };
  };
  depositWalletAnalysis?: {
    totalDeposits: number;
    uniqueAddresses: number;
    riskyAddresses?: number;
    totalVolume?: number;
    addresses?: Array<{ address: string; isRisky?: boolean; riskLevel?: string }>;
  };
  ipAnalysis?: {
    uniqueIps: number;
    uniqueCountries: number;
    vpnDetected?: boolean;
    proxyDetected?: boolean;
    countries?: string[];
    recentIps?: Array<{ address: string; country?: string; lastSeen?: string }>;
  };
  adminTags?: string[];
  adminNotes?: string;
  generatedAt: string;
}

interface UserAnalyticsSectionProps {
  userId: number;
  userEmail?: string;
}

const getRiskColor = (level: string) => {
  switch (level?.toLowerCase()) {
    case 'low':
      return 'text-green-600 bg-green-500/10 border-green-500/20';
    case 'medium':
      return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20';
    case 'high':
      return 'text-orange-600 bg-orange-500/10 border-orange-500/20';
    case 'critical':
      return 'text-red-600 bg-red-500/10 border-red-500/20';
    default:
      return 'text-muted-foreground bg-muted/50 border-muted';
  }
};

const getRiskBadgeVariant = (level: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (level?.toLowerCase()) {
    case 'low':
      return 'default';
    case 'medium':
      return 'secondary';
    case 'high':
    case 'critical':
      return 'destructive';
    default:
      return 'outline';
  }
};

const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'Never';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (!isValid(date)) return 'Never';
    return format(date, 'dd.MM.yyyy HH:mm', { locale: ru });
  } catch {
    return 'Never';
  }
};

const formatRelativeDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'Never';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (!isValid(date)) return 'Never';
    return formatDistanceToNow(date, { addSuffix: true, locale: ru });
  } catch {
    return 'Never';
  }
};

export function UserAnalyticsSection({ userId, userEmail }: UserAnalyticsSectionProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [newTag, setNewTag] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [addressToCheck, setAddressToCheck] = useState('');
  const [ipToCheck, setIpToCheck] = useState('');
  const [emailToCheck, setEmailToCheck] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [checkResults] = useState<Record<string, any>>({});

  const { data: analyticsData, isLoading, error, refetch } = useUserAnalytics(userId, { lang: 'ru' });
  // Cast to comprehensive analytics type
  const analytics = analyticsData as unknown as ComprehensiveAnalytics | undefined;
  const refreshMutation = useRefreshUserAnalytics();
  const addTagsMutation = useAddUserTags();
  const removeTagsMutation = useRemoveUserTags();
  const updateNotesMutation = useUpdateUserNotes();

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleRefresh = async () => {
    try {
      await refreshMutation.mutateAsync(userId);
      refetch();
      toast.success('Analytics refreshed');
    } catch {
      toast.error('Failed to refresh analytics');
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    try {
      await addTagsMutation.mutateAsync({ userId, tags: [newTag.trim()] });
      setNewTag('');
      refetch();
      toast.success('Tag added');
    } catch {
      toast.error('Failed to add tag');
    }
  };

  const handleRemoveTag = async (tag: string) => {
    try {
      await removeTagsMutation.mutateAsync({ userId, tags: [tag] });
      refetch();
      toast.success('Tag removed');
    } catch {
      toast.error('Failed to remove tag');
    }
  };

  const handleSaveNotes = async () => {
    try {
      await updateNotesMutation.mutateAsync({ userId, notes: adminNotes });
      toast.success('Notes saved');
    } catch {
      toast.error('Failed to save notes');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const basicInfo = useMemo(() => {
    if (!analytics?.basicInfo) return null;
    return analytics.basicInfo;
  }, [analytics]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <IconAlertTriangle className="h-16 w-16 mx-auto text-destructive mb-4" />
          <p className="text-lg font-medium text-destructive mb-2">Failed to load analytics</p>
          <p className="text-sm text-muted-foreground mb-4">Please try again or contact support</p>
          <Button variant="outline" onClick={() => refetch()}>
            <IconRefresh className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <IconBrain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No analytics data</p>
          <p className="text-sm text-muted-foreground mb-4">Click refresh to generate analytics for this user</p>
          <Button onClick={handleRefresh} disabled={refreshMutation.isPending}>
            {refreshMutation.isPending ? (
              <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <IconRefresh className="h-4 w-4 mr-2" />
            )}
            Generate Analytics
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Risk Score */}
      <Card className="border-l-4" style={{ borderLeftColor: analytics.riskAssessment?.overallLevel === 'critical' ? '#ef4444' : analytics.riskAssessment?.overallLevel === 'high' ? '#f97316' : analytics.riskAssessment?.overallLevel === 'medium' ? '#eab308' : '#22c55e' }}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-16 h-16 rounded-xl flex items-center justify-center border-2",
                getRiskColor(analytics.riskAssessment?.overallLevel ?? 'low')
              )}>
                <span className="text-3xl font-bold">
                  {analytics.riskAssessment?.overallScore ?? '?'}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  User Analytics
                  <Badge variant="outline" className="font-mono">#{userId}</Badge>
                  {analytics.riskAssessment?.overallLevel && (
                    <Badge variant={getRiskBadgeVariant(analytics.riskAssessment.overallLevel)}>
                      {analytics.riskAssessment.overallLevel.toUpperCase()}
                    </Badge>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {userEmail || basicInfo?.email || 'No email'}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <IconCalendar className="h-3 w-3" />
                    Analyzed: {formatRelativeDate(analytics.analyzedAt)}
                  </span>
                  {basicInfo?.createdAt && (
                    <span className="flex items-center gap-1">
                      <IconUserCheck className="h-3 w-3" />
                      Registered: {formatDate(basicInfo.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshMutation.isPending}
            >
              {refreshMutation.isPending ? (
                <IconLoader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <IconRefresh className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview" className="text-xs gap-1.5">
            <IconActivity className="h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="fraud" className="text-xs gap-1.5">
            <IconUsers className="h-3.5 w-3.5" />
            Fraud
          </TabsTrigger>
          <TabsTrigger value="cards" className="text-xs gap-1.5">
            <IconCreditCard className="h-3.5 w-3.5" />
            Cards
          </TabsTrigger>
          <TabsTrigger value="blockchain" className="text-xs gap-1.5">
            <IconWallet className="h-3.5 w-3.5" />
            Blockchain
          </TabsTrigger>
          <TabsTrigger value="ip" className="text-xs gap-1.5">
            <IconWorld className="h-3.5 w-3.5" />
            IP/Geo
          </TabsTrigger>
          <TabsTrigger value="tags" className="text-xs gap-1.5">
            <IconTag className="h-3.5 w-3.5" />
            Tags
          </TabsTrigger>
          <TabsTrigger value="tools" className="text-xs gap-1.5">
            <IconSearch className="h-3.5 w-3.5" />
            Tools
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Trust Score</p>
                    <p className="text-2xl font-bold">{analytics.basicInfo?.trustScore ?? '—'}</p>
                  </div>
                  <IconStar className="h-8 w-8 text-blue-500/30" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Total XP</p>
                    <p className="text-2xl font-bold">{analytics.basicInfo?.totalXp?.toLocaleString() ?? '—'}</p>
                  </div>
                  <IconTrendingUp className="h-8 w-8 text-green-500/30" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Quests</p>
                    <p className="text-2xl font-bold">{analytics.basicInfo?.questsCompleted ?? '—'}</p>
                  </div>
                  <IconCheck className="h-8 w-8 text-purple-500/30" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Wallets</p>
                    <p className="text-2xl font-bold">{analytics.basicInfo?.connectedWallets ?? '—'}</p>
                  </div>
                  <IconLink className="h-8 w-8 text-orange-500/30" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Assessment */}
          {analytics.riskAssessment && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <IconShield className="h-5 w-5" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Risk Score</span>
                      <span className="text-sm font-bold">{analytics.riskAssessment.overallScore ?? 0}/100</span>
                    </div>
                    <Progress value={analytics.riskAssessment.overallScore ?? 0} className="h-2" />
                  </div>
                </div>

                {analytics.riskAssessment.flags && analytics.riskAssessment.flags.length > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <p className="text-sm font-medium text-destructive mb-2 flex items-center gap-1">
                      <IconAlertTriangle className="h-4 w-4" />
                      Fraud Flags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {analytics.riskAssessment.flags.map((flag: string, idx: number) => (
                        <Badge key={idx} variant="destructive" className="gap-1">
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {analytics.riskAssessment.factors && analytics.riskAssessment.factors.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {analytics.riskAssessment.factors.map((factor: { factor: string; score: number }, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border">
                          <span className="text-sm">{factor.factor}</span>
                          <Badge variant="outline" className="font-mono">{factor.score}</Badge>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Financial Summary */}
          {analytics.financialSummary && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <IconCoin className="h-5 w-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50 border">
                    <p className="text-3xl font-bold">{analytics.financialSummary.totalCards}</p>
                    <p className="text-xs text-muted-foreground mt-1">Cards</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50 border">
                    <p className="text-3xl font-bold">${analytics.financialSummary.totalBalance?.toFixed(2) ?? '0.00'}</p>
                    <p className="text-xs text-muted-foreground mt-1">Balance</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50 border">
                    <p className="text-3xl font-bold">{analytics.financialSummary.totalTransactions}</p>
                    <p className="text-xs text-muted-foreground mt-1">Transactions</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50 border">
                    <p className="text-3xl font-bold">${analytics.financialSummary.totalSpent?.toFixed(2) ?? '0.00'}</p>
                    <p className="text-xs text-muted-foreground mt-1">Spent</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50 border">
                    <p className="text-3xl font-bold">${analytics.financialSummary.totalDeposits?.toFixed(2) ?? '0.00'}</p>
                    <p className="text-xs text-muted-foreground mt-1">Deposits</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Summary */}
          {analytics.aiSummary && (
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <IconBrain className="h-5 w-5 text-primary" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h2 className="text-lg font-bold mt-4 mb-2 first:mt-0">{children}</h2>,
                      h2: ({ children }) => <h3 className="text-base font-semibold mt-3 mb-2">{children}</h3>,
                      h3: ({ children }) => <h4 className="text-sm font-medium mt-2 mb-1">{children}</h4>,
                      p: ({ children }) => <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>,
                      li: ({ children }) => <li className="text-sm">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      hr: () => <Separator className="my-3" />,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-primary/50 pl-3 italic text-muted-foreground my-2">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {analytics.aiSummary}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}

          {/* External Checks */}
          {analytics.spamChecks && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <IconMail className="h-5 w-5" />
                  External Checks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analytics.spamChecks.disposableEmail && (
                    <div className={cn(
                      "p-4 rounded-lg border",
                      analytics.spamChecks.disposableEmail.isDisposable
                        ? "bg-red-500/5 border-red-500/20"
                        : "bg-green-500/5 border-green-500/20"
                    )}>
                      <div className="flex items-center gap-2 mb-2">
                        {analytics.spamChecks.disposableEmail.isDisposable ? (
                          <IconAlertTriangle className="h-4 w-4 text-red-600" />
                        ) : (
                          <IconCheck className="h-4 w-4 text-green-600" />
                        )}
                        <p className="font-medium text-sm">Email Check</p>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Disposable:</span>
                          <span className="font-medium">{analytics.spamChecks.disposableEmail.isDisposable ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Reputation:</span>
                          <span className="font-medium">{analytics.spamChecks.disposableEmail.reputation}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {analytics.spamChecks.stopForumSpam && (
                    <div className={cn(
                      "p-4 rounded-lg border",
                      analytics.spamChecks.stopForumSpam.isSpammer
                        ? "bg-red-500/5 border-red-500/20"
                        : "bg-green-500/5 border-green-500/20"
                    )}>
                      <div className="flex items-center gap-2 mb-2">
                        {analytics.spamChecks.stopForumSpam.isSpammer ? (
                          <IconAlertTriangle className="h-4 w-4 text-red-600" />
                        ) : (
                          <IconCheck className="h-4 w-4 text-green-600" />
                        )}
                        <p className="font-medium text-sm">StopForumSpam</p>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Spammer:</span>
                          <span className="font-medium">{analytics.spamChecks.stopForumSpam.isSpammer ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Reports:</span>
                          <span className="font-medium">{analytics.spamChecks.stopForumSpam.reports}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {analytics.spamChecks.abuseIpDb && (
                    <div className={cn(
                      "p-4 rounded-lg border",
                      analytics.spamChecks.abuseIpDb.abuseScore > 50
                        ? "bg-red-500/5 border-red-500/20"
                        : "bg-green-500/5 border-green-500/20"
                    )}>
                      <div className="flex items-center gap-2 mb-2">
                        {analytics.spamChecks.abuseIpDb.abuseScore > 50 ? (
                          <IconAlertTriangle className="h-4 w-4 text-red-600" />
                        ) : (
                          <IconCheck className="h-4 w-4 text-green-600" />
                        )}
                        <p className="font-medium text-sm">AbuseIPDB</p>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Score:</span>
                          <span className="font-medium">{analytics.spamChecks.abuseIpDb.abuseScore}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Reports:</span>
                          <span className="font-medium">{analytics.spamChecks.abuseIpDb.reports}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Fraud Tab */}
        <TabsContent value="fraud" className="space-y-6 mt-6">
          {/* Multi-Account Detection */}
          {analytics.multiAccountDetection && (
            <Card>
              <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('multiAccount')}>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <IconUsers className="h-5 w-5" />
                    Multi-Account Detection
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRiskBadgeVariant(analytics.multiAccountDetection.riskLevel ?? 'low')}>
                      {analytics.multiAccountDetection.totalSuspiciousConnections ?? 0} connections
                    </Badge>
                    {expandedSections['multiAccount'] ? <IconChevronUp className="h-4 w-4" /> : <IconChevronDown className="h-4 w-4" />}
                  </div>
                </CardTitle>
              </CardHeader>
              {expandedSections['multiAccount'] && (
                <CardContent>
                  <div className="space-y-4">
                    {(analytics.multiAccountDetection.sameIpUsers?.length ?? 0) > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Same IP Users:</p>
                        {analytics.multiAccountDetection.sameIpUsers?.map((user: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border mb-2">
                            <span>User #{user.userId} - {user.email || 'No email'}</span>
                            <Badge>{user.overlapCount} shared IPs</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                    {(analytics.multiAccountDetection.similarEmails?.length ?? 0) > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Similar Emails:</p>
                        {analytics.multiAccountDetection.similarEmails?.map((user: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border mb-2">
                            <span>{user.email}</span>
                            <Badge>{(user.similarity * 100).toFixed(0)}% similar</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                    {(analytics.multiAccountDetection.sharedWallets?.length ?? 0) > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Shared Wallets:</p>
                        {analytics.multiAccountDetection.sharedWallets?.map((user: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border mb-2">
                            <span>User #{user.userId}</span>
                            <span className="text-xs font-mono truncate max-w-[200px]">{user.walletAddress}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {(!analytics.multiAccountDetection.sameIpUsers?.length && !analytics.multiAccountDetection.similarEmails?.length && !analytics.multiAccountDetection.sharedWallets?.length) && (
                      <p className="text-sm text-muted-foreground text-center py-4">No suspicious connections detected</p>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

          {/* Referral Fraud */}
          {analytics.referralFraudAnalysis && (
            <Card>
              <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('referralFraud')}>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <IconUsers className="h-5 w-5" />
                    Referral Fraud Analysis
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRiskBadgeVariant(analytics.referralFraudAnalysis.riskLevel ?? 'low')}>
                      Score: {analytics.referralFraudAnalysis.riskScore ?? 0}
                    </Badge>
                    {expandedSections['referralFraud'] ? <IconChevronUp className="h-4 w-4" /> : <IconChevronDown className="h-4 w-4" />}
                  </div>
                </CardTitle>
              </CardHeader>
              {expandedSections['referralFraud'] && (
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-4 rounded-lg bg-muted/50 border text-center">
                      <p className="text-3xl font-bold">{analytics.referralFraudAnalysis.totalReferrals ?? 0}</p>
                      <p className="text-xs text-muted-foreground">Total Referrals</p>
                    </div>
                    <div className={cn(
                      "p-4 rounded-lg border text-center",
                      (analytics.referralFraudAnalysis.suspiciousReferrals ?? 0) > 0
                        ? "bg-red-500/5 border-red-500/20"
                        : "bg-muted/50"
                    )}>
                      <p className="text-3xl font-bold">{analytics.referralFraudAnalysis.suspiciousReferrals ?? 0}</p>
                      <p className="text-xs text-muted-foreground">Suspicious Referrals</p>
                    </div>
                  </div>
                  {analytics.referralFraudAnalysis.patterns && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Patterns Detected:</p>
                      <div className="flex flex-wrap gap-2">
                        {(analytics.referralFraudAnalysis.patterns.sameIpReferrals ?? 0) > 0 && (
                          <Badge variant="destructive">Same IP: {analytics.referralFraudAnalysis.patterns.sameIpReferrals}</Badge>
                        )}
                        {(analytics.referralFraudAnalysis.patterns.rapidReferrals ?? 0) > 0 && (
                          <Badge variant="destructive">Rapid: {analytics.referralFraudAnalysis.patterns.rapidReferrals}</Badge>
                        )}
                        {(analytics.referralFraudAnalysis.patterns.disposableEmailReferrals ?? 0) > 0 && (
                          <Badge variant="destructive">Disposable Email: {analytics.referralFraudAnalysis.patterns.disposableEmailReferrals}</Badge>
                        )}
                        {(analytics.referralFraudAnalysis.patterns.noActivityReferrals ?? 0) > 0 && (
                          <Badge variant="secondary">No Activity: {analytics.referralFraudAnalysis.patterns.noActivityReferrals}</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )}

          {!analytics.multiAccountDetection && !analytics.referralFraudAnalysis && (
            <Card>
              <CardContent className="py-12 text-center">
                <IconUsers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No fraud analysis data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Cards Tab */}
        <TabsContent value="cards" className="space-y-6 mt-6">
          {analytics.cardFraudAnalysis ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <IconCreditCard className="h-5 w-5" />
                  Card Fraud Analysis
                  <Badge variant={getRiskBadgeVariant(analytics.cardFraudAnalysis.riskLevel)}>
                    {analytics.cardFraudAnalysis.riskLevel}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-muted/50 border text-center">
                    <p className="text-3xl font-bold">{analytics.cardFraudAnalysis.totalCards}</p>
                    <p className="text-xs text-muted-foreground">Cards</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border text-center">
                    <p className="text-3xl font-bold">{analytics.cardFraudAnalysis.totalTransactions}</p>
                    <p className="text-xs text-muted-foreground">Transactions</p>
                  </div>
                  <div className={cn(
                    "p-4 rounded-lg border text-center",
                    analytics.cardFraudAnalysis.declinedTransactions > 3
                      ? "bg-red-500/5 border-red-500/20"
                      : "bg-muted/50"
                  )}>
                    <p className="text-3xl font-bold">{analytics.cardFraudAnalysis.declinedTransactions}</p>
                    <p className="text-xs text-muted-foreground">Declined</p>
                  </div>
                  <div className={cn(
                    "p-4 rounded-lg border text-center",
                    analytics.cardFraudAnalysis.zeroBalanceAttempts > 0
                      ? "bg-red-500/5 border-red-500/20"
                      : "bg-muted/50"
                  )}>
                    <p className="text-3xl font-bold">{analytics.cardFraudAnalysis.zeroBalanceAttempts}</p>
                    <p className="text-xs text-muted-foreground">Zero Balance Attempts</p>
                  </div>
                </div>

                {analytics.cardFraudAnalysis.suspiciousPatterns && Object.values(analytics.cardFraudAnalysis.suspiciousPatterns).some(Boolean) && (
                  <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                    <p className="text-sm font-medium text-yellow-700 mb-2 flex items-center gap-1">
                      <IconAlertTriangle className="h-4 w-4" />
                      Suspicious Patterns
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {analytics.cardFraudAnalysis.suspiciousPatterns.multipleDeclines && (
                        <Badge variant="secondary">Multiple Declines</Badge>
                      )}
                      {analytics.cardFraudAnalysis.suspiciousPatterns.rapidTransactions && (
                        <Badge variant="secondary">Rapid Transactions</Badge>
                      )}
                      {analytics.cardFraudAnalysis.suspiciousPatterns.highRiskMerchants && (
                        <Badge variant="secondary">High Risk Merchants</Badge>
                      )}
                      {analytics.cardFraudAnalysis.suspiciousPatterns.unusualAmounts && (
                        <Badge variant="secondary">Unusual Amounts</Badge>
                      )}
                      {analytics.cardFraudAnalysis.suspiciousPatterns.overdraftAttempts && (
                        <Badge variant="secondary">Overdraft Attempts</Badge>
                      )}
                      {analytics.cardFraudAnalysis.suspiciousPatterns.nightActivity && (
                        <Badge variant="secondary">Night Activity</Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <IconCreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No card analysis data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Blockchain Tab */}
        <TabsContent value="blockchain" className="space-y-6 mt-6">
          {analytics.depositWalletAnalysis ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <IconWallet className="h-5 w-5" />
                  Deposit Wallet Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-muted/50 border text-center">
                    <p className="text-3xl font-bold">{analytics.depositWalletAnalysis.totalDeposits}</p>
                    <p className="text-xs text-muted-foreground">Total Deposits</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border text-center">
                    <p className="text-3xl font-bold">{analytics.depositWalletAnalysis.uniqueAddresses}</p>
                    <p className="text-xs text-muted-foreground">Unique Addresses</p>
                  </div>
                  <div className={cn(
                    "p-4 rounded-lg border text-center",
                    (analytics.depositWalletAnalysis.riskyAddresses ?? 0) > 0
                      ? "bg-red-500/5 border-red-500/20"
                      : "bg-muted/50"
                  )}>
                    <p className="text-3xl font-bold">{analytics.depositWalletAnalysis.riskyAddresses ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Risky Addresses</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border text-center">
                    <p className="text-3xl font-bold">${analytics.depositWalletAnalysis.totalVolume?.toFixed(2) ?? '0.00'}</p>
                    <p className="text-xs text-muted-foreground">Total Volume</p>
                  </div>
                </div>

                {analytics.depositWalletAnalysis.addresses && analytics.depositWalletAnalysis.addresses.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Recent Deposit Addresses:</p>
                    <ScrollArea className="h-[200px]">
                      {analytics.depositWalletAnalysis.addresses.map((addr: any, idx: number) => (
                        <div key={idx} className={cn(
                          "flex items-center justify-between p-3 rounded-lg border mb-2",
                          addr.isRisky ? "bg-red-500/5 border-red-500/20" : "bg-muted/50"
                        )}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs truncate max-w-[250px]">{addr.address}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(addr.address)}>
                              <IconCopy className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={addr.isRisky ? 'destructive' : 'default'}>
                              {addr.riskLevel ?? 'Unknown'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <IconWallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No blockchain analysis data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* IP/Geo Tab */}
        <TabsContent value="ip" className="space-y-6 mt-6">
          {analytics.ipAnalysis ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <IconWorld className="h-5 w-5" />
                  IP & Geolocation Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-muted/50 border text-center">
                    <p className="text-3xl font-bold">{analytics.ipAnalysis.uniqueIps}</p>
                    <p className="text-xs text-muted-foreground">Unique IPs</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border text-center">
                    <p className="text-3xl font-bold">{analytics.ipAnalysis.uniqueCountries}</p>
                    <p className="text-xs text-muted-foreground">Countries</p>
                  </div>
                  <div className={cn(
                    "p-4 rounded-lg border text-center",
                    analytics.ipAnalysis.vpnDetected
                      ? "bg-yellow-500/5 border-yellow-500/20"
                      : "bg-muted/50"
                  )}>
                    <p className="text-3xl font-bold">{analytics.ipAnalysis.vpnDetected ? 'Yes' : 'No'}</p>
                    <p className="text-xs text-muted-foreground">VPN Detected</p>
                  </div>
                  <div className={cn(
                    "p-4 rounded-lg border text-center",
                    analytics.ipAnalysis.proxyDetected
                      ? "bg-yellow-500/5 border-yellow-500/20"
                      : "bg-muted/50"
                  )}>
                    <p className="text-3xl font-bold">{analytics.ipAnalysis.proxyDetected ? 'Yes' : 'No'}</p>
                    <p className="text-xs text-muted-foreground">Proxy Detected</p>
                  </div>
                </div>

                {analytics.ipAnalysis.countries && analytics.ipAnalysis.countries.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Countries:</p>
                    <div className="flex flex-wrap gap-2">
                      {analytics.ipAnalysis.countries.map((country: string, idx: number) => (
                        <Badge key={idx} variant="outline">{country}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {analytics.ipAnalysis.recentIps && analytics.ipAnalysis.recentIps.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Recent IPs:</p>
                    <ScrollArea className="h-[150px]">
                      {analytics.ipAnalysis.recentIps.map((ip: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/50 mb-1">
                          <span className="font-mono text-xs">{ip.address}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{ip.country}</span>
                            <span className="text-xs text-muted-foreground">{formatRelativeDate(ip.lastSeen)}</span>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <IconWorld className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No IP analysis data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tags Tab */}
        <TabsContent value="tags" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <IconTag className="h-5 w-5" />
                Admin Tags & Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tags */}
              <div>
                <p className="text-sm font-medium mb-3">Tags</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {analytics.adminTags && analytics.adminTags.length > 0 ? (
                    analytics.adminTags.map((tag: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="gap-1 pl-2">
                        {tag}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-destructive/20"
                          onClick={() => handleRemoveTag(tag)}
                          disabled={removeTagsMutation.isPending}
                        >
                          <IconX className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No tags</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add new tag..."
                    className="max-w-xs"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button onClick={handleAddTag} disabled={addTagsMutation.isPending || !newTag.trim()}>
                    <IconPlus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Admin Notes */}
              <div>
                <p className="text-sm font-medium mb-3">Admin Notes</p>
                <Textarea
                  value={adminNotes || analytics.adminNotes || ''}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this user..."
                  className="min-h-[120px] mb-3"
                />
                <Button onClick={handleSaveNotes} disabled={updateNotesMutation.isPending}>
                  {updateNotesMutation.isPending ? (
                    <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <IconCheck className="h-4 w-4 mr-2" />
                  )}
                  Save Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address Check */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <IconWallet className="h-5 w-5" />
                  Check Wallet Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  value={addressToCheck}
                  onChange={(e) => setAddressToCheck(e.target.value)}
                  placeholder="Enter wallet address..."
                />
                <Button
                  className="w-full"
                  disabled={!addressToCheck.trim()}
                  onClick={async () => {
                    if (!addressToCheck.trim()) return;
                    toast.info('Checking address...');
                    // Check will be implemented with proper hooks
                  }}
                >
                  <IconSearch className="h-4 w-4 mr-2" />
                  Check Address (HashDit + Chainalysis)
                </Button>
                {checkResults.address && (
                  <div className="p-3 rounded-lg bg-muted/50 border text-sm">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(checkResults.address, null, 2)}</pre>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* IP Check */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <IconWorld className="h-5 w-5" />
                  Check IP Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  value={ipToCheck}
                  onChange={(e) => setIpToCheck(e.target.value)}
                  placeholder="Enter IP address..."
                />
                <Button
                  className="w-full"
                  disabled={!ipToCheck.trim()}
                  onClick={async () => {
                    if (!ipToCheck.trim()) return;
                    toast.info('Checking IP...');
                  }}
                >
                  <IconSearch className="h-4 w-4 mr-2" />
                  Check IP (Geo + AbuseIPDB)
                </Button>
                {checkResults.ip && (
                  <div className="p-3 rounded-lg bg-muted/50 border text-sm">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(checkResults.ip, null, 2)}</pre>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Email Check */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <IconMail className="h-5 w-5" />
                  Check Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  value={emailToCheck}
                  onChange={(e) => setEmailToCheck(e.target.value)}
                  placeholder="Enter email address..."
                />
                <Button
                  className="w-full"
                  disabled={!emailToCheck.trim()}
                  onClick={async () => {
                    if (!emailToCheck.trim()) return;
                    toast.info('Checking email...');
                  }}
                >
                  <IconSearch className="h-4 w-4 mr-2" />
                  Check Email (Disposable + StopForumSpam)
                </Button>
                {checkResults.email && (
                  <div className="p-3 rounded-lg bg-muted/50 border text-sm">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(checkResults.email, null, 2)}</pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
