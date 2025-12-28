import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  IconDeviceDesktop,
  IconMail,
  IconLock,
  IconChevronDown,
  IconChevronUp,
  IconFileText,
  IconSearch,
  IconLoader2,
} from '@tabler/icons-react';
import {
  useUserAnalytics,
  useRefreshUserAnalytics,
  useAddUserTags,
  useRemoveUserTags,
  useUpdateAdminNotes,
  useCheckHashDit,
  useCheckChainalysis,
  useCheckWebacy,
  useCheckIp,
  useCheckEmail,
} from '../api/user-analytics';
import { cn } from '@/lib/utils';

interface UserAnalyticsModalProps {
  userId: number;
  userEmail?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getRiskBadgeVariant = (level: string) => {
  switch (level) {
    case 'low':
      return 'default';
    case 'medium':
      return 'secondary';
    case 'high':
      return 'destructive';
    case 'critical':
      return 'destructive';
    default:
      return 'outline';
  }
};

export function UserAnalyticsModal({
  userId,
  userEmail,
  open,
  onOpenChange,
}: UserAnalyticsModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [newTag, setNewTag] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [addressToCheck, setAddressToCheck] = useState('');
  const [ipToCheck, setIpToCheck] = useState('');
  const [emailToCheck, setEmailToCheck] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const { data: analytics, isLoading, error, refetch } = useUserAnalytics(userId, open);
  const refreshMutation = useRefreshUserAnalytics();
  const addTagsMutation = useAddUserTags();
  const removeTagsMutation = useRemoveUserTags();
  const updateNotesMutation = useUpdateAdminNotes();
  const checkHashDitMutation = useCheckHashDit();
  const checkWebacyMutation = useCheckWebacy();
  const checkChainalysisMutation = useCheckChainalysis();
  const checkIpMutation = useCheckIp();
  const checkEmailMutation = useCheckEmail();

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleRefresh = async () => {
    try {
      await refreshMutation.mutateAsync({ userId });
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

  const handleCheckAddress = async () => {
    if (!addressToCheck.trim()) return;
    try {
      const [hashdit, chainalysis] = await Promise.all([
        checkHashDitMutation.mutateAsync({ address: addressToCheck }),
        checkChainalysisMutation.mutateAsync(addressToCheck),
      ]);
      toast.success(`Risk Score: HashDit=${hashdit.riskScore}, Chainalysis=${chainalysis.riskScore}`);
    } catch {
      toast.error('Failed to check address');
    }
  };

  const handleCheckIp = async () => {
    if (!ipToCheck.trim()) return;
    try {
      const result = await checkIpMutation.mutateAsync(ipToCheck);
      toast.success(`IP Analysis: ${JSON.stringify(result)}`);
    } catch {
      toast.error('Failed to check IP');
    }
  };

  const handleCheckEmail = async () => {
    if (!emailToCheck.trim()) return;
    try {
      const result = await checkEmailMutation.mutateAsync(emailToCheck);
      toast.success(`Email: Disposable=${result.isDisposable}, Reputation=${result.reputation}`);
    } catch {
      toast.error('Failed to check email');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between pr-8">
          <div>
            <DialogTitle className="text-xl flex items-center gap-2">
              <IconBrain className="h-5 w-5" />
              User Analytics - #{userId}
              {userEmail && <span className="text-sm text-muted-foreground">({userEmail})</span>}
            </DialogTitle>
            {analytics && (
              <p className="text-sm text-muted-foreground mt-1">
                Last analyzed: {new Date(analytics.analyzedAt).toLocaleString()}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshMutation.isPending}
          >
            {refreshMutation.isPending ? (
              <IconLoader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <IconRefresh className="h-4 w-4 mr-1" />
            )}
            Refresh
          </Button>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <IconAlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <p className="text-destructive">Failed to load analytics</p>
              <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : analytics ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-7 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="fraud">Fraud</TabsTrigger>
                <TabsTrigger value="cards">Cards</TabsTrigger>
                <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
                <TabsTrigger value="ip">IP/Geo</TabsTrigger>
                <TabsTrigger value="tags">Tags</TabsTrigger>
                <TabsTrigger value="tools">Tools</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                {/* Risk Score Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <IconShield className="h-5 w-5" />
                      Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.riskAssessment ? (
                      <>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Risk Score</span>
                              <span className="text-sm font-bold">{analytics.riskAssessment.overallScore ?? 0}/100</span>
                            </div>
                            <Progress value={analytics.riskAssessment.overallScore ?? 0} className="h-3" />
                          </div>
                          <Badge variant={getRiskBadgeVariant(analytics.riskAssessment.overallLevel ?? 'low')} className="text-lg px-4 py-1">
                            {(analytics.riskAssessment.overallLevel ?? 'low').toUpperCase()}
                          </Badge>
                        </div>

                        {analytics.riskAssessment.flags && analytics.riskAssessment.flags.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Fraud Flags:</p>
                            <div className="flex flex-wrap gap-2">
                              {analytics.riskAssessment.flags.map((flag, idx) => (
                                <Badge key={idx} variant="destructive" className="gap-1">
                                  <IconAlertTriangle className="h-3 w-3" />
                                  {flag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <Separator className="my-4" />

                        <div className="grid grid-cols-2 gap-4">
                          {(analytics.riskAssessment.factors ?? []).map((factor, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                              <span className="text-sm">{factor.factor}</span>
                              <Badge variant="outline">{factor.score}</Badge>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        Risk assessment data not available
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Financial Summary */}
                {analytics.financialSummary && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <IconCreditCard className="h-5 w-5" />
                        Financial Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-5 gap-4">
                        <div className="text-center p-3 rounded-md bg-muted/50">
                          <p className="text-2xl font-bold">{analytics.financialSummary.totalCards}</p>
                          <p className="text-xs text-muted-foreground">Cards</p>
                        </div>
                        <div className="text-center p-3 rounded-md bg-muted/50">
                          <p className="text-2xl font-bold">${analytics.financialSummary.totalBalance.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">Balance</p>
                        </div>
                        <div className="text-center p-3 rounded-md bg-muted/50">
                          <p className="text-2xl font-bold">{analytics.financialSummary.totalTransactions}</p>
                          <p className="text-xs text-muted-foreground">Transactions</p>
                        </div>
                        <div className="text-center p-3 rounded-md bg-muted/50">
                          <p className="text-2xl font-bold">${analytics.financialSummary.totalSpent.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">Spent</p>
                        </div>
                        <div className="text-center p-3 rounded-md bg-muted/50">
                          <p className="text-2xl font-bold">${analytics.financialSummary.totalDeposits.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">Deposits</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* AI Summary */}
                {analytics.aiSummary && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <IconBrain className="h-5 w-5" />
                        AI Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{analytics.aiSummary}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Spam Checks */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <IconMail className="h-5 w-5" />
                      External Checks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {analytics.spamChecks.disposableEmail && (
                        <div className={cn(
                          "p-3 rounded-md",
                          analytics.spamChecks.disposableEmail.isDisposable ? "bg-red-100 dark:bg-red-950" : "bg-green-100 dark:bg-green-950"
                        )}>
                          <p className="font-medium text-sm">Email Check</p>
                          <p className="text-xs">Disposable: {analytics.spamChecks.disposableEmail.isDisposable ? 'Yes' : 'No'}</p>
                          <p className="text-xs">Reputation: {analytics.spamChecks.disposableEmail.reputation}</p>
                        </div>
                      )}
                      {analytics.spamChecks.stopForumSpam && (
                        <div className={cn(
                          "p-3 rounded-md",
                          analytics.spamChecks.stopForumSpam.isSpammer ? "bg-red-100 dark:bg-red-950" : "bg-green-100 dark:bg-green-950"
                        )}>
                          <p className="font-medium text-sm">StopForumSpam</p>
                          <p className="text-xs">Spammer: {analytics.spamChecks.stopForumSpam.isSpammer ? 'Yes' : 'No'}</p>
                          <p className="text-xs">Reports: {analytics.spamChecks.stopForumSpam.reports}</p>
                        </div>
                      )}
                      {analytics.spamChecks.abuseIpDb && (
                        <div className={cn(
                          "p-3 rounded-md",
                          analytics.spamChecks.abuseIpDb.abuseScore > 50 ? "bg-red-100 dark:bg-red-950" : "bg-green-100 dark:bg-green-950"
                        )}>
                          <p className="font-medium text-sm">AbuseIPDB</p>
                          <p className="text-xs">Score: {analytics.spamChecks.abuseIpDb.abuseScore}%</p>
                          <p className="text-xs">Reports: {analytics.spamChecks.abuseIpDb.reports}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Fraud Tab */}
              <TabsContent value="fraud" className="space-y-4">
                {/* Multi-Account Detection */}
                <Card>
                  <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('multiAccount')}>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <IconUsers className="h-5 w-5" />
                        Multi-Account Detection
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRiskBadgeVariant(analytics.multiAccountDetection.riskLevel)}>
                          {analytics.multiAccountDetection.totalSuspiciousConnections} connections
                        </Badge>
                        {expandedSections['multiAccount'] ? <IconChevronUp /> : <IconChevronDown />}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  {expandedSections['multiAccount'] && (
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.multiAccountDetection.sameIpUsers.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Same IP Users:</p>
                            {analytics.multiAccountDetection.sameIpUsers.map((user, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/50 mb-1">
                                <span>User #{user.userId} - {user.email || 'No email'}</span>
                                <Badge>{user.overlapCount} shared IPs</Badge>
                              </div>
                            ))}
                          </div>
                        )}
                        {analytics.multiAccountDetection.similarEmails.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Similar Emails:</p>
                            {analytics.multiAccountDetection.similarEmails.map((user, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/50 mb-1">
                                <span>{user.email}</span>
                                <Badge>{(user.similarity * 100).toFixed(0)}% similar</Badge>
                              </div>
                            ))}
                          </div>
                        )}
                        {analytics.multiAccountDetection.sharedWallets.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Shared Wallets:</p>
                            {analytics.multiAccountDetection.sharedWallets.map((user, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/50 mb-1">
                                <span>User #{user.userId}</span>
                                <span className="text-xs font-mono">{user.walletAddress}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Referral Fraud */}
                <Card>
                  <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('referralFraud')}>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <IconUsers className="h-5 w-5" />
                        Referral Fraud Analysis
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRiskBadgeVariant(analytics.referralFraudAnalysis.riskLevel)}>
                          Score: {analytics.referralFraudAnalysis.riskScore}
                        </Badge>
                        {expandedSections['referralFraud'] ? <IconChevronUp /> : <IconChevronDown />}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  {expandedSections['referralFraud'] && (
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-3 rounded bg-muted/50">
                          <p className="text-2xl font-bold">{analytics.referralFraudAnalysis.totalReferrals}</p>
                          <p className="text-xs text-muted-foreground">Total Referrals</p>
                        </div>
                        <div className={cn("p-3 rounded", analytics.referralFraudAnalysis.suspiciousReferrals > 0 ? "bg-red-100 dark:bg-red-950" : "bg-muted/50")}>
                          <p className="text-2xl font-bold">{analytics.referralFraudAnalysis.suspiciousReferrals}</p>
                          <p className="text-xs text-muted-foreground">Suspicious Referrals</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Patterns Detected:</p>
                        <div className="flex flex-wrap gap-2">
                          {analytics.referralFraudAnalysis.patterns.sameIpReferrals > 0 && (
                            <Badge variant="destructive">Same IP: {analytics.referralFraudAnalysis.patterns.sameIpReferrals}</Badge>
                          )}
                          {analytics.referralFraudAnalysis.patterns.rapidReferrals > 0 && (
                            <Badge variant="destructive">Rapid: {analytics.referralFraudAnalysis.patterns.rapidReferrals}</Badge>
                          )}
                          {analytics.referralFraudAnalysis.patterns.disposableEmailReferrals > 0 && (
                            <Badge variant="destructive">Disposable Email: {analytics.referralFraudAnalysis.patterns.disposableEmailReferrals}</Badge>
                          )}
                          {analytics.referralFraudAnalysis.patterns.noActivityReferrals > 0 && (
                            <Badge variant="secondary">No Activity: {analytics.referralFraudAnalysis.patterns.noActivityReferrals}</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </TabsContent>

              {/* Cards Tab */}
              <TabsContent value="cards" className="space-y-4">
                {analytics.cardFraudAnalysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconCreditCard className="h-5 w-5" />
                        Card Fraud Analysis
                        <Badge variant={getRiskBadgeVariant(analytics.cardFraudAnalysis.riskLevel)}>
                          {analytics.cardFraudAnalysis.riskLevel}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="p-3 rounded bg-muted/50 text-center">
                          <p className="text-2xl font-bold">{analytics.cardFraudAnalysis.totalCards}</p>
                          <p className="text-xs text-muted-foreground">Cards</p>
                        </div>
                        <div className="p-3 rounded bg-muted/50 text-center">
                          <p className="text-2xl font-bold">{analytics.cardFraudAnalysis.totalTransactions}</p>
                          <p className="text-xs text-muted-foreground">Transactions</p>
                        </div>
                        <div className={cn("p-3 rounded text-center", analytics.cardFraudAnalysis.declinedTransactions > 3 ? "bg-red-100 dark:bg-red-950" : "bg-muted/50")}>
                          <p className="text-2xl font-bold">{analytics.cardFraudAnalysis.declinedTransactions}</p>
                          <p className="text-xs text-muted-foreground">Declined</p>
                        </div>
                        <div className={cn("p-3 rounded text-center", analytics.cardFraudAnalysis.zeroBalanceAttempts > 0 ? "bg-red-100 dark:bg-red-950" : "bg-muted/50")}>
                          <p className="text-2xl font-bold">{analytics.cardFraudAnalysis.zeroBalanceAttempts}</p>
                          <p className="text-xs text-muted-foreground">Zero Balance Attempts</p>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Suspicious Patterns:</p>
                        <div className="flex flex-wrap gap-2">
                          {analytics.cardFraudAnalysis.suspiciousPatterns.rapidDeclines && (
                            <Badge variant="destructive">Rapid Declines</Badge>
                          )}
                          {analytics.cardFraudAnalysis.suspiciousPatterns.unusualMerchants && (
                            <Badge variant="destructive">Unusual Merchants</Badge>
                          )}
                          {analytics.cardFraudAnalysis.suspiciousPatterns.subscriptionWithoutFunds && (
                            <Badge variant="destructive">Subscription w/o Funds</Badge>
                          )}
                          {analytics.cardFraudAnalysis.suspiciousPatterns.highDeclineRate && (
                            <Badge variant="destructive">High Decline Rate</Badge>
                          )}
                          {analytics.cardFraudAnalysis.suspiciousPatterns.multipleCardsNoBalance && (
                            <Badge variant="destructive">Multiple Cards No Balance</Badge>
                          )}
                          {!Object.values(analytics.cardFraudAnalysis.suspiciousPatterns).some(v => v) && (
                            <Badge variant="default">No Issues</Badge>
                          )}
                        </div>
                      </div>

                      {analytics.cardFraudAnalysis.suspiciousCards.length > 0 && (
                        <>
                          <Separator className="my-4" />
                          <div>
                            <p className="text-sm font-medium mb-2">Suspicious Cards:</p>
                            {analytics.cardFraudAnalysis.suspiciousCards.map((card, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 rounded bg-red-50 dark:bg-red-950 mb-1">
                                <span className="font-mono">{card.cardMasked}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">${card.balance.toFixed(2)}</span>
                                  <Badge variant="destructive">{card.declineCount} declines</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {analytics.cardFraudAnalysis.recentDeclines.length > 0 && (
                        <>
                          <Separator className="my-4" />
                          <div>
                            <p className="text-sm font-medium mb-2">Recent Declines:</p>
                            <div className="max-h-40 overflow-y-auto">
                              {analytics.cardFraudAnalysis.recentDeclines.map((decline, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/50 mb-1 text-sm">
                                  <span>${decline.amount.toFixed(2)} at {decline.merchant || 'Unknown'}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(decline.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Blockchain Tab */}
              <TabsContent value="blockchain" className="space-y-4">
                {analytics.blockchainRisk && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconWallet className="h-5 w-5" />
                          Deposit Wallet Analysis
                        </CardTitle>
                        <CardDescription>
                          Analyzed {analytics.blockchainRisk.depositAddresses.analyzedAddresses} addresses from {analytics.blockchainRisk.depositAddresses.totalDeposits} deposits
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div className="p-3 rounded bg-muted/50 text-center">
                            <p className="text-2xl font-bold">{analytics.blockchainRisk.depositAddresses.summary.totalRiskScore}</p>
                            <p className="text-xs text-muted-foreground">Total Risk</p>
                          </div>
                          <div className={cn("p-3 rounded text-center", analytics.blockchainRisk.depositAddresses.summary.highRiskCount > 0 ? "bg-red-100 dark:bg-red-950" : "bg-muted/50")}>
                            <p className="text-2xl font-bold">{analytics.blockchainRisk.depositAddresses.summary.highRiskCount}</p>
                            <p className="text-xs text-muted-foreground">High Risk</p>
                          </div>
                          <div className="p-3 rounded bg-yellow-100 dark:bg-yellow-950 text-center">
                            <p className="text-2xl font-bold">{analytics.blockchainRisk.depositAddresses.summary.mediumRiskCount}</p>
                            <p className="text-xs text-muted-foreground">Medium Risk</p>
                          </div>
                          <div className="p-3 rounded bg-green-100 dark:bg-green-950 text-center">
                            <p className="text-2xl font-bold">{analytics.blockchainRisk.depositAddresses.summary.lowRiskCount}</p>
                            <p className="text-xs text-muted-foreground">Low Risk</p>
                          </div>
                        </div>

                        {analytics.blockchainRisk.depositAddresses.riskyAddresses.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Risky Addresses:</p>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {analytics.blockchainRisk.depositAddresses.riskyAddresses.map((addr, idx) => (
                                <div key={idx} className="p-3 rounded bg-red-50 dark:bg-red-950">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-mono text-sm truncate max-w-[300px]">{addr.address}</span>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">{addr.chain}</Badge>
                                      <Badge variant="destructive">Score: {addr.riskScore}</Badge>
                                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(addr.address)}>
                                        <IconCopy className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {addr.flags.map((flag, fidx) => (
                                      <Badge key={fidx} variant="secondary" className="text-xs">{flag}</Badge>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {analytics.blockchainRisk.walletChecks.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Wallet Risk Checks</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {analytics.blockchainRisk.walletChecks.map((check, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/50">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{check.provider}</Badge>
                                  <span className="font-mono text-sm truncate max-w-[200px]">{check.address}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={getRiskBadgeVariant(check.riskLevel)}>
                                    {check.riskScore}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>

              {/* IP/Geo Tab */}
              <TabsContent value="ip" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconWorld className="h-5 w-5" />
                      IP & Geolocation Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {analytics.ipAnalysis.hasVpn && <Badge variant="destructive">VPN Detected</Badge>}
                      {analytics.ipAnalysis.hasProxy && <Badge variant="destructive">Proxy Detected</Badge>}
                      {analytics.ipAnalysis.hasTor && <Badge variant="destructive">TOR Detected</Badge>}
                      {!analytics.ipAnalysis.hasVpn && !analytics.ipAnalysis.hasProxy && !analytics.ipAnalysis.hasTor && (
                        <Badge variant="default">No VPN/Proxy/TOR</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 rounded bg-muted/50">
                        <p className="text-sm font-medium mb-2">Countries:</p>
                        <div className="flex flex-wrap gap-1">
                          {analytics.ipAnalysis.countries.map((country, idx) => (
                            <Badge key={idx} variant="outline">{country}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="p-3 rounded bg-muted/50">
                        <p className="text-sm font-medium mb-2">Unique IPs: {analytics.ipAnalysis.uniqueIps.length}</p>
                        <div className="max-h-20 overflow-y-auto text-xs font-mono">
                          {analytics.ipAnalysis.uniqueIps.slice(0, 5).map((ip, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                              {ip}
                              <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => copyToClipboard(ip)}>
                                <IconCopy className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          {analytics.ipAnalysis.uniqueIps.length > 5 && (
                            <span className="text-muted-foreground">+{analytics.ipAnalysis.uniqueIps.length - 5} more</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {analytics.ipAnalysis.suspiciousIps.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Suspicious IPs:</p>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {analytics.ipAnalysis.suspiciousIps.map((ipData, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded bg-red-50 dark:bg-red-950">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm">{ipData.ip}</span>
                                {ipData.country && <Badge variant="outline">{ipData.country}</Badge>}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={ipData.threatLevel === 'high' ? 'destructive' : 'secondary'}>
                                  {ipData.threatLevel}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{ipData.reason}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Keycloak Data */}
                {analytics.keycloakData && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconLock className="h-5 w-5" />
                        Keycloak Sessions & Login History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analytics.keycloakData.sessions.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">Active Sessions:</p>
                          {analytics.keycloakData.sessions.map((session, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/50 mb-1">
                              <div className="flex items-center gap-2">
                                <IconDeviceDesktop className="h-4 w-4" />
                                <span className="font-mono text-sm">{session.ipAddress}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                Last: {new Date(session.lastAccess).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {analytics.keycloakData.loginHistory.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Login History:</p>
                          <div className="max-h-40 overflow-y-auto">
                            {analytics.keycloakData.loginHistory.slice(0, 10).map((event, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/50 mb-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <Badge variant={event.type.includes('ERROR') ? 'destructive' : 'default'} className="text-xs">
                                    {event.type}
                                  </Badge>
                                  <span className="font-mono text-xs">{event.ipAddress}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(event.time).toLocaleString()}
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

              {/* Tags Tab */}
              <TabsContent value="tags" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconTag className="h-5 w-5" />
                      User Tags & Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Existing Tags */}
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Current Tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {analytics.existingTags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="gap-1">
                            {tag}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-destructive"
                              onClick={() => handleRemoveTag(tag)}
                            >
                              <IconX className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                        {analytics.existingTags.length === 0 && (
                          <span className="text-sm text-muted-foreground">No tags</span>
                        )}
                      </div>
                    </div>

                    {/* Suggested Tags */}
                    {analytics.suggestedTags.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Suggested Tags:</p>
                        <div className="flex flex-wrap gap-2">
                          {analytics.suggestedTags.filter(t => !analytics.existingTags.includes(t)).map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="gap-1 cursor-pointer hover:bg-primary hover:text-primary-foreground"
                              onClick={() => addTagsMutation.mutateAsync({ userId, tags: [tag] }).then(() => refetch())}
                            >
                              <IconPlus className="h-3 w-3" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add New Tag */}
                    <div className="flex gap-2 mb-4">
                      <Input
                        placeholder="Add new tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      />
                      <Button onClick={handleAddTag} disabled={addTagsMutation.isPending}>
                        <IconPlus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>

                    <Separator className="my-4" />

                    {/* Admin Notes */}
                    <div>
                      <p className="text-sm font-medium mb-2">Admin Notes:</p>
                      <Textarea
                        placeholder="Add notes about this user..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows={4}
                        className="mb-2"
                      />
                      <Button onClick={handleSaveNotes} disabled={updateNotesMutation.isPending}>
                        <IconFileText className="h-4 w-4 mr-1" />
                        Save Notes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tools Tab */}
              <TabsContent value="tools" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconSearch className="h-5 w-5" />
                      Manual Checks
                    </CardTitle>
                    <CardDescription>
                      Run individual checks on addresses, IPs, or emails
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Address Check - FREE APIs */}
                    <div>
                      <p className="text-sm font-medium mb-2">
                        Blockchain Address Check (HashDit + Chainalysis)
                        <Badge variant="default" className="ml-2 text-xs">FREE</Badge>
                      </p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter wallet address..."
                          value={addressToCheck}
                          onChange={(e) => setAddressToCheck(e.target.value)}
                        />
                        <Button
                          onClick={handleCheckAddress}
                          disabled={checkHashDitMutation.isPending || checkChainalysisMutation.isPending}
                        >
                          {(checkHashDitMutation.isPending || checkChainalysisMutation.isPending) ? (
                            <IconLoader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <IconSearch className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Webacy Check - PAID API */}
                    <div className="p-3 border border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                      <p className="text-sm font-medium mb-2">
                        Webacy Deep Analysis
                        <Badge variant="destructive" className="ml-2 text-xs">PAID</Badge>
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        EVM chains: Ethereum, BSC, Polygon, Avalanche, Arbitrum, Optimism, Base
                      </p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter EVM wallet address..."
                          value={addressToCheck}
                          onChange={(e) => setAddressToCheck(e.target.value)}
                        />
                        <Button
                          variant="outline"
                          onClick={async () => {
                            if (!addressToCheck.trim()) return;
                            try {
                              const result = await checkWebacyMutation.mutateAsync({ address: addressToCheck });
                              toast.success(`Webacy: Risk=${result.riskScore}, Sanctioned=${result.isSanctioned}`);
                            } catch {
                              toast.error('Webacy check failed');
                            }
                          }}
                          disabled={checkWebacyMutation.isPending}
                        >
                          {checkWebacyMutation.isPending ? (
                            <IconLoader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <IconShield className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* IP Check */}
                    <div>
                      <p className="text-sm font-medium mb-2">IP Address Check (Geo + VPN + Abuse)</p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter IP address..."
                          value={ipToCheck}
                          onChange={(e) => setIpToCheck(e.target.value)}
                        />
                        <Button onClick={handleCheckIp} disabled={checkIpMutation.isPending}>
                          {checkIpMutation.isPending ? (
                            <IconLoader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <IconSearch className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Email Check */}
                    <div>
                      <p className="text-sm font-medium mb-2">Email Check (Disposable + Reputation)</p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter email..."
                          value={emailToCheck}
                          onChange={(e) => setEmailToCheck(e.target.value)}
                        />
                        <Button onClick={handleCheckEmail} disabled={checkEmailMutation.isPending}>
                          {checkEmailMutation.isPending ? (
                            <IconLoader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <IconSearch className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default UserAnalyticsModal;
