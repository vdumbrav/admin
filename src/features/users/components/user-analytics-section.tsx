import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  IconAlertTriangle,
  IconShield,
  IconShieldCheck,
  IconUsers,
  IconWallet,
  IconRefresh,
  IconBrain,
  IconChevronDown,
  IconChevronUp,
  IconLoader2,
  IconCheck,
  IconActivity,
  IconCoin,
  IconLink,
  IconStar,
  IconTrendingUp,
  IconUserCheck,
  IconMessage,
  IconCrown,
  IconTarget,
  IconDeviceDesktop,
  IconClock,
  IconSearch,
  IconExternalLink,
} from '@tabler/icons-react';
import {
  useUserAnalytics,
  useRefreshUserAnalytics,
  useCheckHashDit,
  useCheckChainalysis,
  useCheckWebacy,
} from '@/features/security/api/user-analytics';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';

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
  if (!dateString) return '—';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (!isValid(date)) return '—';
    return format(date, 'dd.MM.yyyy HH:mm', { locale: ru });
  } catch {
    return '—';
  }
};

const formatRelativeDate = (dateString: string | undefined | null): string => {
  if (!dateString) return '—';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (!isValid(date)) return '—';
    return formatDistanceToNow(date, { addSuffix: true, locale: ru });
  } catch {
    return '—';
  }
};

// Wallet check result component
function WalletCheckResult({ address, chain, enabled }: { address: string; chain: string; enabled: boolean }) {
  const webacyChain = chain === 'evm' ? 'ethereum' : chain === 'solana' ? 'solana' : '';
  const hashDitQuery = useCheckHashDit(address, chain === 'solana' ? 'solana' : chain === 'evm' ? 'eth' : chain);
  const chainalysisQuery = useCheckChainalysis(address);
  const webacyQuery = useCheckWebacy(address, webacyChain);

  const isLoading = enabled && (hashDitQuery.isLoading || chainalysisQuery.isLoading || webacyQuery.isLoading);
  const hashDitData = hashDitQuery.data as any;
  const chainalysisData = chainalysisQuery.data as any;
  const webacyData = webacyQuery.data as any;

  if (!enabled) {
    return (
      <div className="p-3 rounded-lg bg-muted/30 border text-center text-sm text-muted-foreground">
        Click "Check" to analyze this wallet
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-3 rounded-lg bg-muted/30 border flex items-center justify-center gap-2">
        <IconLoader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Checking wallet...</span>
      </div>
    );
  }

  const hasRisk = hashDitData?.isRisky || chainalysisData?.isRisky || webacyData?.isRisky ||
                  (hashDitData?.riskScore && hashDitData.riskScore > 50) ||
                  (chainalysisData?.risk && chainalysisData.risk !== 'low') ||
                  (webacyData?.riskScore && webacyData.riskScore > 50);

  return (
    <div className={cn(
      "p-3 rounded-lg border space-y-2",
      hasRisk ? "bg-red-500/10 border-red-500/30" : "bg-green-500/10 border-green-500/30"
    )}>
      <div className="flex items-center gap-2">
        {hasRisk ? (
          <IconAlertTriangle className="h-4 w-4 text-red-500" />
        ) : (
          <IconShieldCheck className="h-4 w-4 text-green-500" />
        )}
        <span className={cn("text-sm font-medium", hasRisk ? "text-red-600" : "text-green-600")}>
          {hasRisk ? "Risk Detected" : "No Risk Detected"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* HashDit */}
        <div className="text-xs p-2 rounded bg-muted/50">
          <p className="font-medium mb-1">HashDit</p>
          <p>Score: <span className="font-mono">{hashDitData?.riskScore ?? '—'}</span></p>
          {hashDitData?.labels?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {hashDitData.labels.map((l: string, i: number) => (
                <Badge key={i} variant="outline" className="text-[10px]">{l}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Chainalysis */}
        <div className="text-xs p-2 rounded bg-muted/50">
          <p className="font-medium mb-1">Chainalysis</p>
          <p>Risk: <span className="font-mono">{chainalysisData?.risk ?? '—'}</span></p>
          {chainalysisData?.categories?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {chainalysisData.categories.map((c: string, i: number) => (
                <Badge key={i} variant="outline" className="text-[10px]">{c}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Webacy */}
        <div className="text-xs p-2 rounded bg-muted/50">
          <p className="font-medium mb-1">Webacy <Badge variant="outline" className="text-[9px] ml-1">PAID</Badge></p>
          <p>Score: <span className="font-mono">{webacyData?.riskScore ?? '—'}</span></p>
          {webacyData?.labels?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {webacyData.labels.map((l: string, i: number) => (
                <Badge key={i} variant="outline" className="text-[10px]">{l}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function UserAnalyticsSection({ userId, userEmail }: UserAnalyticsSectionProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    risk: true,
    transactions: true,
    social: true,
  });
  const [checkingWallets, setCheckingWallets] = useState<Record<string, boolean>>({});

  const { data: analytics, isLoading, error, refetch } = useUserAnalytics(userId, { lang: 'ru' }) as {
    data: any;
    isLoading: boolean;
    error: any;
    refetch: () => void
  };
  const refreshMutation = useRefreshUserAnalytics();

  // Extract wallet addresses from connected accounts
  const walletAddresses = analytics?.socialProfiles?.connectedAccounts?.filter(
    (acc: any) => acc.provider === 'evm' || acc.provider === 'solana'
  ) || [];

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
          <p className="text-sm text-muted-foreground mb-4">Please try again</p>
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
          <p className="text-sm text-muted-foreground mb-4">Click refresh to generate analytics</p>
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

  const riskLevel = analytics.riskAssessment?.riskLevel || 'low';
  const riskScore = analytics.riskAssessment?.overallScore || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4" style={{
        borderLeftColor: riskLevel === 'critical' ? '#ef4444' :
                         riskLevel === 'high' ? '#f97316' :
                         riskLevel === 'medium' ? '#eab308' : '#22c55e'
      }}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-16 h-16 rounded-xl flex items-center justify-center border-2",
                getRiskColor(riskLevel)
              )}>
                <span className="text-3xl font-bold">{riskScore}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  User Analytics
                  <Badge variant="outline" className="font-mono">#{userId}</Badge>
                  <Badge variant={getRiskBadgeVariant(riskLevel)}>
                    {riskLevel.toUpperCase()}
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground">
                  {userEmail || analytics.basicInfo?.email || 'No email'}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <IconClock className="h-3 w-3" />
                    Generated: {formatRelativeDate(analytics.generatedAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <IconUserCheck className="h-3 w-3" />
                    Registered: {formatDate(analytics.basicInfo?.createdAt)}
                  </span>
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview" className="text-xs gap-1.5">
            <IconActivity className="h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs gap-1.5">
            <IconTarget className="h-3.5 w-3.5" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="social" className="text-xs gap-1.5">
            <IconUsers className="h-3.5 w-3.5" />
            Social
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs gap-1.5">
            <IconShieldCheck className="h-3.5 w-3.5" />
            Security
          </TabsTrigger>
          <TabsTrigger value="bot" className="text-xs gap-1.5">
            <IconMessage className="h-3.5 w-3.5" />
            Bot Chat
          </TabsTrigger>
          <TabsTrigger value="ai" className="text-xs gap-1.5">
            <IconBrain className="h-3.5 w-3.5" />
            AI Summary
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
                    <p className="text-2xl font-bold">{analytics.behavioralInsights?.trustScore ?? '—'}</p>
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
                    <p className="text-2xl font-bold">{analytics.questProgress?.totalXp?.toLocaleString() ?? '—'}</p>
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
                    <p className="text-2xl font-bold">{analytics.questProgress?.completedQuests ?? '—'}</p>
                  </div>
                  <IconCheck className="h-8 w-8 text-purple-500/30" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Connections</p>
                    <p className="text-2xl font-bold">{analytics.socialProfiles?.totalConnections ?? '—'}</p>
                  </div>
                  <IconLink className="h-8 w-8 text-orange-500/30" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Assessment */}
          {analytics.riskAssessment && (
            <Card>
              <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('risk')}>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <IconShield className="h-5 w-5" />
                    Risk Assessment
                  </span>
                  {expandedSections['risk'] ? <IconChevronUp className="h-4 w-4" /> : <IconChevronDown className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
              {expandedSections['risk'] && (
                <CardContent>
                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Risk Score</span>
                        <span className="text-sm font-bold">{riskScore}/100</span>
                      </div>
                      <Progress value={riskScore} className="h-2" />
                    </div>
                  </div>

                  {analytics.riskAssessment.flags?.length > 0 && (
                    <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 mb-4">
                      <p className="text-sm font-medium text-destructive mb-2 flex items-center gap-1">
                        <IconAlertTriangle className="h-4 w-4" />
                        Risk Flags
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {analytics.riskAssessment.flags.map((flag: string, idx: number) => (
                          <Badge key={idx} variant="destructive">{flag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {analytics.riskAssessment.factors?.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {analytics.riskAssessment.factors.map((factor: any, idx: number) => (
                        <div key={idx} className={cn(
                          "p-3 rounded-lg border",
                          factor.impact === 'positive' ? 'bg-green-500/5 border-green-500/20' :
                          factor.impact === 'negative' ? 'bg-red-500/5 border-red-500/20' : 'bg-muted/50'
                        )}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium capitalize">{factor.category?.replace(/_/g, ' ')}</span>
                            <Badge variant="outline">{factor.score}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{factor.details}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )}

          {/* Behavioral Insights */}
          {analytics.behavioralInsights && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <IconUserCheck className="h-5 w-5" />
                  Behavioral Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <p className="text-lg font-bold capitalize">{analytics.behavioralInsights.userType}</p>
                    <p className="text-xs text-muted-foreground">User Type</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <p className="text-lg font-bold capitalize">{analytics.behavioralInsights.engagementTrend}</p>
                    <p className="text-xs text-muted-foreground">Engagement</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <p className="text-lg font-bold capitalize">{analytics.behavioralInsights.predictedChurnRisk}</p>
                    <p className="text-xs text-muted-foreground">Churn Risk</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <p className="text-lg font-bold capitalize">{analytics.behavioralInsights.lifetimeValue}</p>
                    <p className="text-xs text-muted-foreground">LTV</p>
                  </div>
                </div>

                {analytics.behavioralInsights.positiveIndicators?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium mb-2 text-green-600">Positive Indicators</p>
                    <div className="flex flex-wrap gap-2">
                      {analytics.behavioralInsights.positiveIndicators.map((ind: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-green-500/10 text-green-700 border-green-500/30">
                          {ind.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {analytics.behavioralInsights.concernIndicators?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 text-orange-600">Concerns</p>
                    <div className="flex flex-wrap gap-2">
                      {analytics.behavioralInsights.concernIndicators.map((ind: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-orange-500/10 text-orange-700 border-orange-500/30">
                          {ind.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Transaction Patterns */}
          {analytics.transactionPatterns && (
            <Card>
              <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('transactions')}>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <IconCoin className="h-5 w-5" />
                    Transaction Patterns
                  </span>
                  {expandedSections['transactions'] ? <IconChevronUp className="h-4 w-4" /> : <IconChevronDown className="h-4 w-4" />}
                </CardTitle>
              </CardHeader>
              {expandedSections['transactions'] && (
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 rounded-lg bg-muted/50 border">
                      <p className="text-2xl font-bold">{analytics.transactionPatterns.totalTransactions}</p>
                      <p className="text-xs text-muted-foreground">Total Txs</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50 border">
                      <p className="text-2xl font-bold">${analytics.transactionPatterns.totalVolume?.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Volume</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50 border">
                      <p className="text-2xl font-bold">${analytics.transactionPatterns.avgTransactionSize?.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Avg Size</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50 border">
                      <p className="text-2xl font-bold">{analytics.transactionPatterns.frequencyPerDay}</p>
                      <p className="text-xs text-muted-foreground">Per Day</p>
                    </div>
                  </div>

                  {analytics.transactionPatterns.topMerchants?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Top Merchants</p>
                      <div className="space-y-2">
                        {analytics.transactionPatterns.topMerchants.slice(0, 5).map((m: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/30">
                            <span className="text-sm">{m.merchant}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{m.count}x</Badge>
                              <span className="text-sm font-medium">${m.volume}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )}
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6 mt-6">
          {/* Activity Patterns */}
          {analytics.activityPatterns && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <IconDeviceDesktop className="h-5 w-5" />
                  Activity Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <p className="text-2xl font-bold">{analytics.activityPatterns.daysOnPlatform}</p>
                    <p className="text-xs text-muted-foreground">Days Active</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <p className="text-2xl font-bold">{analytics.activityPatterns.totalSessions}</p>
                    <p className="text-xs text-muted-foreground">Sessions</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <p className="text-lg font-bold capitalize">{analytics.activityPatterns.loginFrequency}</p>
                    <p className="text-xs text-muted-foreground">Login Freq</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <p className="text-lg font-bold">{formatRelativeDate(analytics.activityPatterns.lastLogin)}</p>
                    <p className="text-xs text-muted-foreground">Last Login</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quest Progress */}
          {analytics.questProgress && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <IconTarget className="h-5 w-5" />
                  Quest Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <p className="text-2xl font-bold">{analytics.questProgress.completedQuests}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <p className="text-2xl font-bold">{analytics.questProgress.totalXp?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total XP</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <p className="text-2xl font-bold">{(analytics.questProgress.questCompletionRate * 100).toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Completion Rate</p>
                  </div>
                </div>

                {analytics.questProgress.recentQuests?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Recent Quests</p>
                    <div className="space-y-2">
                      {analytics.questProgress.recentQuests.slice(0, 5).map((q: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/30">
                          <span className="text-sm">{q.title}</span>
                          <Badge variant="outline">+{q.reward} XP</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Premium Info */}
          {analytics.premiumInfo && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <IconCrown className="h-5 w-5 text-amber-500" />
                  Premium Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Badge variant={analytics.premiumInfo.isActive ? 'default' : 'secondary'} className="text-base px-3 py-1">
                    {analytics.premiumInfo.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Total: {analytics.premiumInfo.totalPremiumDays} days
                  </span>
                </div>

                {analytics.premiumInfo.premiumHistory?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">History</p>
                    <div className="space-y-2">
                      {analytics.premiumInfo.premiumHistory.slice(0, 5).map((h: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/30">
                          <span className="text-sm font-medium">{h.bundle}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(h.from)} - {formatDate(h.to)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social" className="space-y-6 mt-6">
          {/* Social Profiles */}
          {analytics.socialProfiles && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <IconLink className="h-5 w-5" />
                  Connected Accounts ({analytics.socialProfiles.totalConnections})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.socialProfiles.connectedAccounts?.map((acc: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="capitalize">{acc.provider}</Badge>
                        <span className="text-sm font-mono truncate max-w-[250px]">
                          {acc.authName || acc.authId}
                        </span>
                      </div>
                      {acc.verified && (
                        <Badge variant="default" className="bg-green-500">Verified</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Referral Info */}
          {analytics.referralInfo && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <IconUsers className="h-5 w-5" />
                  Referrals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <p className="text-2xl font-bold">{analytics.referralInfo.totalReferrals}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <p className="text-2xl font-bold">{analytics.referralInfo.activeReferrals}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <p className="text-2xl font-bold">${analytics.referralInfo.totalEarnings}</p>
                    <p className="text-xs text-muted-foreground">Earnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Wallets */}
          {analytics.wallets && analytics.wallets.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <IconWallet className="h-5 w-5" />
                  Wallets ({analytics.wallets.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.wallets.map((wallet: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/30">
                      <span className="text-sm font-mono truncate max-w-[300px]">{wallet.address}</span>
                      {wallet.chain && <Badge variant="outline">{wallet.chain}</Badge>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 mt-6">
          {/* Wallet Security Checks */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <IconWallet className="h-5 w-5" />
                Wallet Security Checks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {walletAddresses.length > 0 ? (
                <div className="space-y-4">
                  {walletAddresses.map((acc: any, idx: number) => {
                    const address = acc.authId || acc.authName;
                    const chain = acc.provider;
                    const isChecking = checkingWallets[address];

                    return (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="capitalize font-medium">
                              {chain === 'evm' ? 'EVM' : 'Solana'}
                            </Badge>
                            <span className="text-sm font-mono truncate max-w-[300px]">
                              {address}
                            </span>
                            <a
                              href={chain === 'evm'
                                ? `https://etherscan.io/address/${address}`
                                : `https://solscan.io/account/${address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary"
                            >
                              <IconExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCheckingWallets(prev => ({ ...prev, [address]: true }))}
                            disabled={isChecking}
                          >
                            {isChecking ? (
                              <>
                                <IconLoader2 className="h-4 w-4 animate-spin mr-1" />
                                Checking
                              </>
                            ) : (
                              <>
                                <IconSearch className="h-4 w-4 mr-1" />
                                Check
                              </>
                            )}
                          </Button>
                        </div>
                        <WalletCheckResult
                          address={address}
                          chain={chain}
                          enabled={isChecking}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <IconWallet className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No wallet addresses connected</p>
                  <p className="text-xs mt-1">User hasn't linked EVM or Solana wallets</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email & IP Checks */}
          {(userEmail || analytics.basicInfo?.email) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <IconShield className="h-5 w-5" />
                  Email Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-lg bg-muted/30 border">
                  <p className="text-sm font-medium mb-1">Email</p>
                  <p className="text-sm font-mono">{userEmail || analytics.basicInfo?.email}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Use the backend API to check email reputation via StopForumSpam
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Deposit Address Analysis */}
          {analytics.depositAnalysis && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <IconCoin className="h-5 w-5" />
                  Deposit Address Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <p className="text-2xl font-bold">{analytics.depositAnalysis.totalAddresses}</p>
                    <p className="text-xs text-muted-foreground">Addresses</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <p className="text-2xl font-bold">{analytics.depositAnalysis.riskyAddresses}</p>
                    <p className="text-xs text-muted-foreground">Risky</p>
                  </div>
                </div>
                {analytics.depositAnalysis.flaggedAddresses?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-red-600">Flagged Addresses</p>
                    {analytics.depositAnalysis.flaggedAddresses.map((addr: any, idx: number) => (
                      <div key={idx} className="p-2 rounded bg-red-500/10 border border-red-500/30">
                        <p className="text-sm font-mono truncate">{addr.address}</p>
                        <p className="text-xs text-red-600">{addr.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Bot Chat Tab */}
        <TabsContent value="bot" className="space-y-6 mt-6">
          {analytics.botChatAnalysis ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <IconMessage className="h-5 w-5" />
                  Bot Chat Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <p className="text-2xl font-bold">{analytics.botChatAnalysis.totalMessages}</p>
                    <p className="text-xs text-muted-foreground">Messages</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <p className="text-lg font-bold capitalize">{analytics.botChatAnalysis.sentiment}</p>
                    <p className="text-xs text-muted-foreground">Sentiment</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <p className="text-lg font-bold capitalize">{analytics.botChatAnalysis.engagement}</p>
                    <p className="text-xs text-muted-foreground">Engagement</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50 border">
                    <p className="text-lg font-bold capitalize">{analytics.botChatAnalysis.experienceLevel}</p>
                    <p className="text-xs text-muted-foreground">Experience</p>
                  </div>
                </div>

                {analytics.botChatAnalysis.platforms?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Platforms</p>
                    <div className="flex flex-wrap gap-2">
                      {analytics.botChatAnalysis.platforms.map((p: any, idx: number) => (
                        <Badge key={idx} variant="outline">
                          {p.platform}: {p.messageCount} msgs
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {analytics.botChatAnalysis.topics?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Topics</p>
                    <div className="flex flex-wrap gap-2">
                      {analytics.botChatAnalysis.topics.map((t: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{t}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {analytics.botChatAnalysis.interests?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {analytics.botChatAnalysis.interests.map((i: string, idx: number) => (
                        <Badge key={idx} variant="outline">{i}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <IconMessage className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No bot chat data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Summary Tab */}
        <TabsContent value="ai" className="space-y-6 mt-6">
          {analytics.aiSummary ? (
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <IconBrain className="h-5 w-5 text-primary" />
                  AI Analysis Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
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
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <IconBrain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No AI summary available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
