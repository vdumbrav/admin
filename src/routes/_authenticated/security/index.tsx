import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  IconShieldCheck,
  IconAlertTriangle,
  IconUsers,
  IconRefresh,
  IconExternalLink,
  IconBrain,
  IconTrendingUp,
  IconCreditCard,
  IconLoader,
  IconSearch,
  IconMail,
  IconNetwork,
  IconCurrencyBitcoin,
  IconAlertCircle,
  IconCheck,
  IconFilter,
  IconArrowRight,
  IconClockHour4,
  IconFlag,
} from '@tabler/icons-react';
import { useFraudStats } from '@/features/fraud-detection/api/fraud';
import {
  useSuspiciousUsers,
  useSuspiciousCards,
  useAnalyzeAllUsers,
  useCheckHashDit,
  useCheckChainalysis,
  useCheckIP,
  useCheckEmail,
  useCheckSpam,
  useCheckAbuse,
  useCheckWebacy,
  useSecuritySummary,
} from '@/features/security/api/user-analytics';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { ru } from 'date-fns/locale';

// Check result types
interface HashDitResult { riskScore?: number; riskLevel?: string; }
interface ChainalysisResult { sanctioned?: boolean; categories?: string[]; }
interface IPCheckResult { proxy?: boolean; hosting?: boolean; country?: string; city?: string; isp?: string; }
interface AbuseCheckResult { abuseScore?: number; reports?: number; }
interface SpamCheckResult { isSpammer?: boolean; }
interface EmailCheckResult { isDisposable?: boolean; domain?: string; }
interface WebacyResult { riskScore?: number; riskLevel?: string; isSanctioned?: boolean; labels?: string[]; }

export const Route = createFileRoute('/_authenticated/security/' as any)({
  component: SecurityCenterPage,
});

function SecurityCenterPage() {
  const [activeTab, setActiveTab] = useState('queue');
  const [minRiskScore, setMinRiskScore] = useState(50);
  const [analysisLang, setAnalysisLang] = useState('ru');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick check states
  const [addressInput, setAddressInput] = useState('');
  const [chainInput, setChainInput] = useState('tron');
  const [ipInput, setIpInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [activeAddress, setActiveAddress] = useState<string | null>(null);
  const [activeIp, setActiveIp] = useState<string | null>(null);
  const [activeEmail, setActiveEmail] = useState<string | null>(null);

  // Data queries
  const { isLoading: statsLoading, refetch: refetchStats } = useFraudStats();
  const { data: suspiciousData, isLoading: suspiciousLoading, refetch: refetchSuspicious } = useSuspiciousUsers({
    minRiskScore,
    hasFraudFlags: false,
    limit: 100,
  });
  const { data: cardsData, isLoading: cardsLoading, refetch: refetchCards } = useSuspiciousCards({
    minDeclines: 3,
    limit: 50,
  });

  const analyzeAllMutation = useAnalyzeAllUsers();
  const securitySummaryMutation = useSecuritySummary();

  // External checks
  const hashditCheck = useCheckHashDit(activeAddress || '', chainInput);
  const chainalysisCheck = useCheckChainalysis(activeAddress || '');
  const ipCheck = useCheckIP(activeIp || '');
  const emailCheck = useCheckEmail(activeEmail || '');
  const spamCheck = useCheckSpam({ email: activeEmail || undefined, ip: activeIp || undefined });
  const abuseCheck = useCheckAbuse(activeIp || '');
  const webacyCheck = useCheckWebacy(activeAddress || '', chainInput === 'tron' ? '' : chainInput);

  // Derived data
  const suspiciousUsers = useMemo(() => {
    const users = suspiciousData?.users || [];
    if (!searchQuery) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(u =>
      u.nickname?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      String(u.id).includes(q)
    );
  }, [suspiciousData?.users, searchQuery]);

  const riskStats = useMemo(() => {
    const users = suspiciousData?.users || [];
    return {
      critical: users.filter(u => u.risk_score >= 80).length,
      high: users.filter(u => u.risk_score >= 60 && u.risk_score < 80).length,
      medium: users.filter(u => u.risk_score >= 40 && u.risk_score < 60).length,
      total: users.length,
    };
  }, [suspiciousData?.users]);

  // Handlers
  const handleRefresh = () => {
    refetchStats();
    refetchSuspicious();
    refetchCards();
  };

  const handleRunBatchAnalysis = () => {
    analyzeAllMutation.mutate({
      limit: 50,
      onlyWithoutAnalytics: true,
      lang: analysisLang,
    });
  };

  const handleGenerateSummary = () => {
    securitySummaryMutation.mutate(analysisLang);
  };

  const getRiskBadge = (score: number, compact = false) => {
    if (score >= 80) {
      return <Badge variant="destructive" className={cn("font-mono", compact && "text-xs px-1.5")}>{compact ? score : `CRITICAL ${score}`}</Badge>;
    }
    if (score >= 60) {
      return <Badge className={cn("bg-orange-500 text-white font-mono", compact && "text-xs px-1.5")}>{compact ? score : `HIGH ${score}`}</Badge>;
    }
    if (score >= 40) {
      return <Badge className={cn("bg-yellow-500 text-black font-mono", compact && "text-xs px-1.5")}>{compact ? score : `MEDIUM ${score}`}</Badge>;
    }
    return <Badge variant="outline" className={cn("font-mono", compact && "text-xs px-1.5")}>{compact ? score : `LOW ${score}`}</Badge>;
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <IconShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Security Center</h1>
              <p className="text-sm text-muted-foreground">Risk monitoring & fraud detection</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={analysisLang} onValueChange={setAnalysisLang}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ru">RU</SelectItem>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="uk">UK</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateSummary}
              disabled={securitySummaryMutation.isPending}
            >
              {securitySummaryMutation.isPending ? (
                <IconLoader className="h-4 w-4 animate-spin" />
              ) : (
                <IconBrain className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={statsLoading || suspiciousLoading}>
              <IconRefresh className={cn("h-4 w-4", (statsLoading || suspiciousLoading) && "animate-spin")} />
            </Button>
          </div>
        </div>

        {/* AI Security Summary */}
        {securitySummaryMutation.data && (
          <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <IconBrain className="h-4 w-4 text-primary" />
                  AI Security Summary
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(securitySummaryMutation.data.generatedAt), 'dd.MM.yyyy HH:mm')}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{securitySummaryMutation.data.summary}</p>
              {securitySummaryMutation.data.recommendations.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Recommendations:</p>
                  <ul className="text-xs space-y-1">
                    {securitySummaryMutation.data.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <IconAlertCircle className="h-3 w-3 mt-0.5 text-yellow-500 shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* KPI Cards */}
        <div className="grid gap-3 md:grid-cols-4">
          <Card className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            riskStats.critical > 0 && "border-red-500/50 bg-red-500/5"
          )} onClick={() => { setActiveTab('queue'); setMinRiskScore(80); }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold text-red-600">{riskStats.critical}</p>
                </div>
                <IconAlertTriangle className="h-8 w-8 text-red-500/40" />
              </div>
              {riskStats.critical > 0 && (
                <p className="text-xs text-red-600 mt-1">Требует немедленного внимания</p>
              )}
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all hover:shadow-md" onClick={() => { setActiveTab('queue'); setMinRiskScore(60); }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">High Risk</p>
                  <p className="text-2xl font-bold text-orange-600">{riskStats.high}</p>
                </div>
                <IconTrendingUp className="h-8 w-8 text-orange-500/40" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all hover:shadow-md" onClick={() => { setActiveTab('queue'); setMinRiskScore(40); }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Medium Risk</p>
                  <p className="text-2xl font-bold text-yellow-600">{riskStats.medium}</p>
                </div>
                <IconAlertCircle className="h-8 w-8 text-yellow-500/40" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all hover:shadow-md" onClick={() => setActiveTab('cards')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Card Issues</p>
                  <p className="text-2xl font-bold text-purple-600">{cardsLoading ? '...' : cardsData?.total || 0}</p>
                </div>
                <IconCreditCard className="h-8 w-8 text-purple-500/40" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Left: Queue & Tables */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <TabsList className="h-8">
                      <TabsTrigger value="queue" className="text-xs px-3">
                        <IconUsers className="h-3 w-3 mr-1" />
                        Risk Queue
                      </TabsTrigger>
                      <TabsTrigger value="cards" className="text-xs px-3">
                        <IconCreditCard className="h-3 w-3 mr-1" />
                        Cards
                      </TabsTrigger>
                    </TabsList>
                    <div className="flex gap-2">
                      <div className="relative">
                        <IconSearch className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                        <Input
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-7 h-8 w-[150px] text-xs"
                        />
                      </div>
                      <Select value={minRiskScore.toString()} onValueChange={(v) => setMinRiskScore(parseInt(v))}>
                        <SelectTrigger className="w-[100px] h-8 text-xs">
                          <IconFilter className="h-3 w-3 mr-1" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">All</SelectItem>
                          <SelectItem value="40">40+</SelectItem>
                          <SelectItem value="60">60+</SelectItem>
                          <SelectItem value="80">80+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <TabsContent value="queue" className="m-0">
                  <ScrollArea className="h-[500px]">
                    {suspiciousLoading ? (
                      <div className="p-4 space-y-2">
                        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                      </div>
                    ) : suspiciousUsers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <IconCheck className="h-12 w-12 mb-2 text-green-500" />
                        <p className="text-sm">No users with risk {minRiskScore}+</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="text-xs">
                            <TableHead className="w-[50px]">ID</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead className="w-[80px]">Risk</TableHead>
                            <TableHead className="w-[120px]">Analyzed</TableHead>
                            <TableHead className="w-[60px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {suspiciousUsers.slice(0, 30).map((user) => (
                            <TableRow key={user.id} className="text-xs">
                              <TableCell className="font-mono text-muted-foreground">{user.id}</TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium truncate max-w-[200px]">
                                    {user.nickname || user.email || `User #${user.id}`}
                                  </span>
                                  {user.admin_tags?.length > 0 && (
                                    <div className="flex gap-1 mt-0.5 flex-wrap">
                                      {user.admin_tags.slice(0, 2).map((tag, i) => (
                                        <Badge key={i} variant="outline" className="text-[10px] px-1 py-0">{tag}</Badge>
                                      ))}
                                      {user.admin_tags.length > 2 && (
                                        <Badge variant="outline" className="text-[10px] px-1 py-0">+{user.admin_tags.length - 2}</Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{getRiskBadge(user.risk_score, true)}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {user.last_analytics_at
                                  ? formatDistanceToNow(new Date(user.last_analytics_at), { addSuffix: true, locale: ru })
                                  : '—'}
                              </TableCell>
                              <TableCell>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
                                      <Link to={`/users/${user.id}` as any}>
                                        <IconArrowRight className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Open profile</TooltipContent>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="cards" className="m-0">
                  <ScrollArea className="h-[500px]">
                    {cardsLoading ? (
                      <div className="p-4 space-y-2">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                      </div>
                    ) : (cardsData?.users?.length || 0) === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <IconCheck className="h-12 w-12 mb-2 text-green-500" />
                        <p className="text-sm">No card issues detected</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="text-xs">
                            <TableHead>User</TableHead>
                            <TableHead className="w-[60px]">Cards</TableHead>
                            <TableHead className="w-[80px]">Declines</TableHead>
                            <TableHead className="w-[70px]">Balance</TableHead>
                            <TableHead className="w-[60px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cardsData?.users?.map((user) => (
                            <TableRow key={user.userId} className="text-xs">
                              <TableCell>
                                <span className="font-medium">{user.nickname || user.email || `User #${user.userId}`}</span>
                              </TableCell>
                              <TableCell className="font-mono">{user.cardCount}</TableCell>
                              <TableCell>
                                <Badge variant="destructive" className="text-[10px]">{user.declineCount}x</Badge>
                              </TableCell>
                              <TableCell>
                                {user.hasZeroBalance ? (
                                  <Badge variant="destructive" className="text-[10px]">$0</Badge>
                                ) : (
                                  <span className="text-muted-foreground">OK</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
                                  <Link to={`/users/${user.userId}` as any}>
                                    <IconArrowRight className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </ScrollArea>
                </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Right: Quick Tools */}
          <div className="space-y-4">
            {/* Quick Checks */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <IconSearch className="h-4 w-4" />
                  Quick Checks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Address Check */}
                <div className="space-y-2">
                  <div className="flex gap-1">
                    <Input
                      placeholder="Wallet address..."
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      className="text-xs h-8"
                    />
                    <Select value={chainInput} onValueChange={setChainInput}>
                      <SelectTrigger className="w-[80px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tron">TRON</SelectItem>
                        <SelectItem value="ethereum">ETH</SelectItem>
                        <SelectItem value="bsc">BSC</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setActiveAddress(addressInput)}
                      disabled={!addressInput}
                    >
                      <IconCurrencyBitcoin className="h-4 w-4" />
                    </Button>
                  </div>
                  {activeAddress && (
                    <div className="p-2 rounded border bg-muted/30 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">HashDit:</span>
                        {hashditCheck.isLoading ? (
                          <IconLoader className="h-3 w-3 animate-spin" />
                        ) : (
                          <span className={cn(
                            "font-mono",
                            ((hashditCheck.data as HashDitResult)?.riskScore ?? 0) > 50 && "text-red-600"
                          )}>
                            {(hashditCheck.data as HashDitResult)?.riskScore ?? '—'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Chainalysis:</span>
                        {chainalysisCheck.isLoading ? (
                          <IconLoader className="h-3 w-3 animate-spin" />
                        ) : (chainalysisCheck.data as ChainalysisResult)?.sanctioned ? (
                          <Badge variant="destructive" className="text-[10px]">SANCTIONED</Badge>
                        ) : (
                          <IconCheck className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                      {chainInput !== 'tron' && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Webacy:</span>
                          {webacyCheck.isLoading ? (
                            <IconLoader className="h-3 w-3 animate-spin" />
                          ) : (
                            <span className={cn(
                              "font-mono",
                              ((webacyCheck.data as WebacyResult)?.riskScore ?? 0) > 50 && "text-red-600"
                            )}>
                              {(webacyCheck.data as WebacyResult)?.riskScore ?? '—'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                {/* IP Check */}
                <div className="space-y-2">
                  <div className="flex gap-1">
                    <Input
                      placeholder="IP address..."
                      value={ipInput}
                      onChange={(e) => setIpInput(e.target.value)}
                      className="text-xs h-8"
                    />
                    <Button
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setActiveIp(ipInput)}
                      disabled={!ipInput}
                    >
                      <IconNetwork className="h-4 w-4" />
                    </Button>
                  </div>
                  {activeIp && (
                    <div className="p-2 rounded border bg-muted/30 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Location:</span>
                        {ipCheck.isLoading ? (
                          <IconLoader className="h-3 w-3 animate-spin" />
                        ) : (
                          <span>{(ipCheck.data as IPCheckResult)?.country || '—'}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Proxy/VPN:</span>
                        {ipCheck.isLoading ? (
                          <IconLoader className="h-3 w-3 animate-spin" />
                        ) : (ipCheck.data as IPCheckResult)?.proxy || (ipCheck.data as IPCheckResult)?.hosting ? (
                          <Badge variant="destructive" className="text-[10px]">YES</Badge>
                        ) : (
                          <IconCheck className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">AbuseIPDB:</span>
                        {abuseCheck.isLoading ? (
                          <IconLoader className="h-3 w-3 animate-spin" />
                        ) : (
                          <span className={cn(
                            "font-mono",
                            ((abuseCheck.data as AbuseCheckResult)?.abuseScore ?? 0) > 30 && "text-red-600"
                          )}>
                            {(abuseCheck.data as AbuseCheckResult)?.abuseScore ?? 0}%
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Email Check */}
                <div className="space-y-2">
                  <div className="flex gap-1">
                    <Input
                      type="email"
                      placeholder="Email..."
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="text-xs h-8"
                    />
                    <Button
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setActiveEmail(emailInput)}
                      disabled={!emailInput}
                    >
                      <IconMail className="h-4 w-4" />
                    </Button>
                  </div>
                  {activeEmail && (
                    <div className="p-2 rounded border bg-muted/30 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Disposable:</span>
                        {emailCheck.isLoading ? (
                          <IconLoader className="h-3 w-3 animate-spin" />
                        ) : (emailCheck.data as EmailCheckResult)?.isDisposable ? (
                          <Badge variant="destructive" className="text-[10px]">YES</Badge>
                        ) : (
                          <IconCheck className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Spammer:</span>
                        {spamCheck.isLoading ? (
                          <IconLoader className="h-3 w-3 animate-spin" />
                        ) : (spamCheck.data as SpamCheckResult)?.isSpammer ? (
                          <Badge variant="destructive" className="text-[10px]">YES</Badge>
                        ) : (
                          <IconCheck className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Batch Analysis */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <IconBrain className="h-4 w-4" />
                  Batch Analysis
                </CardTitle>
                <CardDescription className="text-xs">
                  Analyze unprocessed users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleRunBatchAnalysis}
                  disabled={analyzeAllMutation.isPending}
                  className="w-full"
                  size="sm"
                >
                  {analyzeAllMutation.isPending ? (
                    <>
                      <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <IconBrain className="mr-2 h-4 w-4" />
                      Analyze 50 Users
                    </>
                  )}
                </Button>
                {analyzeAllMutation.data && (
                  <div className="mt-3 p-2 rounded border bg-muted/30">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold">{analyzeAllMutation.data.totalProcessed}</p>
                        <p className="text-[10px] text-muted-foreground">Total</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-green-600">{analyzeAllMutation.data.successCount}</p>
                        <p className="text-[10px] text-muted-foreground">Success</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-red-600">{analyzeAllMutation.data.errorCount}</p>
                        <p className="text-[10px] text-muted-foreground">Failed</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <Button variant="ghost" size="sm" className="w-full justify-start text-xs" asChild>
                  <Link to="/fraud">
                    <IconFlag className="mr-2 h-4 w-4" />
                    Fraud Incidents
                    <IconExternalLink className="ml-auto h-3 w-3" />
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-xs" asChild>
                  <Link to="/logs">
                    <IconClockHour4 className="mr-2 h-4 w-4" />
                    System Logs
                    <IconExternalLink className="ml-auto h-3 w-3" />
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-xs" asChild>
                  <Link to="/users">
                    <IconUsers className="mr-2 h-4 w-4" />
                    All Users
                    <IconExternalLink className="ml-auto h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
