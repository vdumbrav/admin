import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  IconShieldCheck,
  IconAlertTriangle,
  IconUsers,
  IconRefresh,
  IconExternalLink,
  IconBrain,
  IconTrendingUp,
  IconCreditCard,
  IconUserSearch,
  IconAnalyze,
  IconLoader,
} from '@tabler/icons-react';
import { useFraudStats } from '@/features/fraud-detection/api/fraud';
import {
  useSuspiciousUsers,
  useSuspiciousCards,
  useAnalyzeAllUsers,
  useCheckHashDit,
  useCheckChainalysis,
  useCheckTron,
  useCheckIP,
  useCheckEmail,
  useCheckSpam,
  useCheckAbuse,
  useUsersByTags,
} from '@/features/security/api/user-analytics';
import { Link } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/_authenticated/security/' as any)({
  component: SecurityCenterPage,
});

function SecurityCenterPage() {
  const [minRiskScore, setMinRiskScore] = useState(50);
  const [analysisLang, setAnalysisLang] = useState('ru');

  // External checks state
  const [addressToCheck, setAddressToCheck] = useState('');
  const [chainToCheck, setChainToCheck] = useState('tron');
  const [ipToCheck, setIpToCheck] = useState('');
  const [emailToCheck, setEmailToCheck] = useState('');
  const [tagsToSearch, setTagsToSearch] = useState('');

  // Active check triggers
  const [activeAddressCheck, setActiveAddressCheck] = useState<string | null>(null);
  const [activeIpCheck, setActiveIpCheck] = useState<string | null>(null);
  const [activeEmailCheck, setActiveEmailCheck] = useState<string | null>(null);
  const [activeTagsSearch, setActiveTagsSearch] = useState<string[]>([]);

  const { data: fraudStats, isLoading: fraudLoading, refetch: refetchFraud } = useFraudStats();
  const { data: suspiciousData, isLoading: suspiciousLoading, refetch: refetchSuspicious } = useSuspiciousUsers({
    minRiskScore,
    hasFraudFlags: false,
    limit: 100,
  });
  const { data: cardsData, isLoading: cardsLoading } = useSuspiciousCards({
    minDeclines: 3,
    limit: 50,
  });

  const analyzeAllMutation = useAnalyzeAllUsers();

  // External check queries
  const hashditCheck = useCheckHashDit(activeAddressCheck || '', chainToCheck);
  const chainalysisCheck = useCheckChainalysis(activeAddressCheck || '');
  const tronCheck = useCheckTron(activeAddressCheck || '');
  const ipCheck = useCheckIP(activeIpCheck || '');
  const emailCheck = useCheckEmail(activeEmailCheck || '');
  const spamCheck = useCheckSpam({ email: activeEmailCheck || undefined, ip: activeIpCheck || undefined });
  const abuseCheck = useCheckAbuse(activeIpCheck || '');
  const tagSearchResult = useUsersByTags({ tags: activeTagsSearch, matchAll: false });

  const handleAddressCheck = () => {
    if (addressToCheck) {
      setActiveAddressCheck(addressToCheck);
    }
  };

  const handleIpCheck = () => {
    if (ipToCheck) {
      setActiveIpCheck(ipToCheck);
    }
  };

  const handleEmailCheck = () => {
    if (emailToCheck) {
      setActiveEmailCheck(emailToCheck);
    }
  };

  const handleTagsSearch = () => {
    if (tagsToSearch) {
      setActiveTagsSearch(tagsToSearch.split(',').map(t => t.trim()).filter(Boolean));
    }
  };

  const handleRefresh = () => {
    refetchFraud();
    refetchSuspicious();
  };

  const handleAnalyzeAll = () => {
    analyzeAllMutation.mutate({
      limit: 50,
      onlyWithoutAnalytics: true,
      lang: analysisLang,
    });
  };

  const stats = fraudStats?.stats;
  const suspiciousUsers = suspiciousData?.users || [];
  const suspiciousCards = cardsData?.users || [];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <IconShieldCheck className="h-8 w-8 text-primary" />
            Security Center
          </h1>
          <p className="text-muted-foreground">
            User Analytics, Fraud Detection & Risk Monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={analysisLang} onValueChange={setAnalysisLang}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ru">Русский</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="uk">Українська</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={fraudLoading || suspiciousLoading}>
            <IconRefresh className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Fraud Incidents
                </p>
                <p className="text-2xl font-bold">
                  {fraudLoading ? '...' : stats?.totalIncidents || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <IconAlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Last 24 Hours
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {fraudLoading ? '...' : stats?.recentIncidents24h || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <IconTrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Suspicious Users
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {suspiciousLoading ? '...' : suspiciousData?.total || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                <IconUsers className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Card Issues
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {cardsLoading ? '...' : cardsData?.total || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <IconCreditCard className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="suspicious" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="suspicious">Suspicious Users</TabsTrigger>
          <TabsTrigger value="cards">Card Fraud</TabsTrigger>
          <TabsTrigger value="batch">Batch Analysis</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        {/* Suspicious Users Tab */}
        <TabsContent value="suspicious" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <IconUserSearch className="h-5 w-5" />
                    Suspicious Users
                  </CardTitle>
                  <CardDescription>
                    Users with high risk scores or fraud flags
                  </CardDescription>
                </div>
                <Select value={minRiskScore.toString()} onValueChange={(v) => setMinRiskScore(parseInt(v))}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Min Risk Score" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">Risk 30+</SelectItem>
                    <SelectItem value="50">Risk 50+</SelectItem>
                    <SelectItem value="70">Risk 70+</SelectItem>
                    <SelectItem value="90">Risk 90+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {suspiciousLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : suspiciousUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No suspicious users found with risk score {minRiskScore}+
                </div>
              ) : (
                <div className="space-y-3">
                  {suspiciousUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {user.nickname || user.email || `User #${user.id}`}
                          </p>
                          {user.fraud_flags?.map((flag, idx) => (
                            <Badge key={idx} variant="destructive" className="text-xs">
                              {flag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">ID: {user.id}</span>
                          {user.admin_tags?.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium">Risk Score</p>
                          <Badge
                            variant={
                              user.risk_score >= 70
                                ? 'destructive'
                                : user.risk_score >= 40
                                ? 'secondary'
                                : 'outline'
                            }
                            className="text-lg px-3"
                          >
                            {user.risk_score}
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/users/${user.id}` as any}>
                            <IconExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Card Fraud Tab */}
        <TabsContent value="cards" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconCreditCard className="h-5 w-5" />
                Card Fraud Detection
              </CardTitle>
              <CardDescription>
                Users with suspicious card activity (multiple declines, zero balance attempts)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cardsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : suspiciousCards.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No suspicious card activity detected
                </div>
              ) : (
                <div className="space-y-3">
                  {suspiciousCards.map((user) => (
                    <div
                      key={user.userId}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {user.nickname || user.email || `User #${user.userId}`}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span>{user.cardCount} cards</span>
                          <span className="text-red-500">{user.declineCount} declines</span>
                          {user.hasZeroBalance && (
                            <Badge variant="destructive" className="text-xs">Zero Balance</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={user.riskScore >= 50 ? 'destructive' : 'secondary'}
                          className="text-lg px-3"
                        >
                          {user.riskScore}
                        </Badge>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/users/${user.userId}` as any}>
                            <IconExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Batch Analysis Tab */}
        <TabsContent value="batch" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconAnalyze className="h-5 w-5" />
                Batch User Analysis
              </CardTitle>
              <CardDescription>
                Run AI analysis on multiple users at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleAnalyzeAll}
                  disabled={analyzeAllMutation.isPending}
                  size="lg"
                >
                  {analyzeAllMutation.isPending ? (
                    <>
                      <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <IconBrain className="mr-2 h-4 w-4" />
                      Analyze New Users (50)
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Analyzes users without existing analytics data
                </p>
              </div>

              {analyzeAllMutation.isSuccess && analyzeAllMutation.data && (
                <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/20">
                  <p className="font-medium text-green-700 dark:text-green-400">
                    Analysis Complete
                  </p>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <p className="text-2xl font-bold">{analyzeAllMutation.data.totalProcessed}</p>
                      <p className="text-xs text-muted-foreground">Processed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{analyzeAllMutation.data.successCount}</p>
                      <p className="text-xs text-muted-foreground">Success</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">{analyzeAllMutation.data.errorCount}</p>
                      <p className="text-xs text-muted-foreground">Errors</p>
                    </div>
                  </div>
                </div>
              )}

              {analyzeAllMutation.isError && (
                <div className="p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20">
                  <p className="font-medium text-red-700 dark:text-red-400">
                    Analysis Failed
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {analyzeAllMutation.error?.message || 'Unknown error'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="mt-6">
          <div className="space-y-6">
            {/* Address Check Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconShieldCheck className="h-5 w-5" />
                  Address Check
                </CardTitle>
                <CardDescription>
                  Check wallet addresses against HashDit, Chainalysis, and TRON risk databases
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address-input">Wallet Address</Label>
                    <Input
                      id="address-input"
                      placeholder="Enter wallet address (0x... or T...)"
                      value={addressToCheck}
                      onChange={(e) => setAddressToCheck(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chain-select">Chain</Label>
                    <Select value={chainToCheck} onValueChange={setChainToCheck}>
                      <SelectTrigger id="chain-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tron">TRON</SelectItem>
                        <SelectItem value="eth">Ethereum</SelectItem>
                        <SelectItem value="bsc">BSC</SelectItem>
                        <SelectItem value="polygon">Polygon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={handleAddressCheck}
                    disabled={!addressToCheck || hashditCheck.isFetching}
                  >
                    {hashditCheck.isFetching ? (
                      <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    HashDit Check
                  </Button>
                  <Button
                    onClick={handleAddressCheck}
                    disabled={!addressToCheck || chainalysisCheck.isFetching}
                    variant="secondary"
                  >
                    {chainalysisCheck.isFetching ? (
                      <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Chainalysis Check
                  </Button>
                  <Button
                    onClick={handleAddressCheck}
                    disabled={!addressToCheck || tronCheck.isFetching}
                    variant="outline"
                  >
                    {tronCheck.isFetching ? (
                      <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    TRON Full Check
                  </Button>
                </div>

                {/* Address Check Results */}
                {activeAddressCheck && (
                  <div className="grid gap-4 md:grid-cols-3 mt-4">
                    {/* HashDit Result */}
                    <Card className="border-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">HashDit</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {hashditCheck.isFetching ? (
                          <div className="flex items-center justify-center py-4">
                            <IconLoader className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : hashditCheck.isError ? (
                          <div className="text-sm text-red-500">
                            Error: {(hashditCheck.error as Error)?.message || 'Failed to check'}
                          </div>
                        ) : hashditCheck.data ? (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Risk Score:</span>
                              <Badge
                                variant={
                                  (hashditCheck.data as any).riskScore >= 70
                                    ? 'destructive'
                                    : (hashditCheck.data as any).riskScore >= 40
                                    ? 'secondary'
                                    : 'outline'
                                }
                              >
                                {(hashditCheck.data as any).riskScore ?? 'N/A'}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Risk Level:</span>
                              <span>{(hashditCheck.data as any).riskLevel || 'Unknown'}</span>
                            </div>
                            {(hashditCheck.data as any).labels?.length > 0 && (
                              <div className="pt-2">
                                <span className="text-muted-foreground text-xs">Labels:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {(hashditCheck.data as any).labels.map((label: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {label}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">No data</div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Chainalysis Result */}
                    <Card className="border-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Chainalysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {chainalysisCheck.isFetching ? (
                          <div className="flex items-center justify-center py-4">
                            <IconLoader className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : chainalysisCheck.isError ? (
                          <div className="text-sm text-red-500">
                            Error: {(chainalysisCheck.error as Error)?.message || 'Failed to check'}
                          </div>
                        ) : chainalysisCheck.data ? (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Sanctioned:</span>
                              <Badge
                                variant={(chainalysisCheck.data as any).isSanctioned ? 'destructive' : 'outline'}
                              >
                                {(chainalysisCheck.data as any).isSanctioned ? 'YES' : 'NO'}
                              </Badge>
                            </div>
                            {(chainalysisCheck.data as any).category && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Category:</span>
                                <span>{(chainalysisCheck.data as any).category}</span>
                              </div>
                            )}
                            {(chainalysisCheck.data as any).cluster && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Cluster:</span>
                                <span className="text-xs truncate max-w-[120px]">
                                  {(chainalysisCheck.data as any).cluster}
                                </span>
                              </div>
                            )}
                            {(chainalysisCheck.data as any).exposures?.length > 0 && (
                              <div className="pt-2">
                                <span className="text-muted-foreground text-xs">Exposures:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {(chainalysisCheck.data as any).exposures.slice(0, 3).map((exp: any, idx: number) => (
                                    <Badge key={idx} variant="destructive" className="text-xs">
                                      {exp.category || exp}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">No data</div>
                        )}
                      </CardContent>
                    </Card>

                    {/* TRON Full Check Result */}
                    <Card className="border-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">TRON Full</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {tronCheck.isFetching ? (
                          <div className="flex items-center justify-center py-4">
                            <IconLoader className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : tronCheck.isError ? (
                          <div className="text-sm text-red-500">
                            Error: {(tronCheck.error as Error)?.message || 'Failed to check'}
                          </div>
                        ) : tronCheck.data ? (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Combined Risk:</span>
                              <Badge
                                variant={
                                  (tronCheck.data as any).riskScore >= 70
                                    ? 'destructive'
                                    : (tronCheck.data as any).riskScore >= 40
                                    ? 'secondary'
                                    : 'outline'
                                }
                              >
                                {(tronCheck.data as any).riskScore ?? 'N/A'}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Sanctioned:</span>
                              <Badge
                                variant={(tronCheck.data as any).isSanctioned ? 'destructive' : 'outline'}
                              >
                                {(tronCheck.data as any).isSanctioned ? 'YES' : 'NO'}
                              </Badge>
                            </div>
                            {(tronCheck.data as any).flags?.length > 0 && (
                              <div className="pt-2">
                                <span className="text-muted-foreground text-xs">Flags:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {(tronCheck.data as any).flags.map((flag: string, idx: number) => (
                                    <Badge key={idx} variant="destructive" className="text-xs">
                                      {flag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">No data</div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* IP Check Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconUserSearch className="h-5 w-5" />
                  IP Check
                </CardTitle>
                <CardDescription>
                  Check IP addresses for geolocation, proxy/VPN detection, and abuse reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ip-input">IP Address</Label>
                    <Input
                      id="ip-input"
                      placeholder="Enter IP address (e.g., 8.8.8.8)"
                      value={ipToCheck}
                      onChange={(e) => setIpToCheck(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button
                      onClick={handleIpCheck}
                      disabled={!ipToCheck || ipCheck.isFetching}
                    >
                      {ipCheck.isFetching ? (
                        <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      IP-API Check
                    </Button>
                    <Button
                      onClick={handleIpCheck}
                      disabled={!ipToCheck || abuseCheck.isFetching}
                      variant="secondary"
                    >
                      {abuseCheck.isFetching ? (
                        <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      AbuseIPDB Check
                    </Button>
                  </div>
                </div>

                {/* IP Check Results */}
                {activeIpCheck && (
                  <div className="grid gap-4 md:grid-cols-2 mt-4">
                    {/* IP-API Result */}
                    <Card className="border-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">IP-API (Geolocation)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {ipCheck.isFetching ? (
                          <div className="flex items-center justify-center py-4">
                            <IconLoader className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : ipCheck.isError ? (
                          <div className="text-sm text-red-500">
                            Error: {(ipCheck.error as Error)?.message || 'Failed to check'}
                          </div>
                        ) : ipCheck.data ? (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Country:</span>
                              <span>{(ipCheck.data as any).country || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">City:</span>
                              <span>{(ipCheck.data as any).city || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">ISP:</span>
                              <span className="text-xs truncate max-w-[150px]">
                                {(ipCheck.data as any).isp || 'Unknown'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Proxy:</span>
                              <Badge
                                variant={(ipCheck.data as any).proxy ? 'destructive' : 'outline'}
                              >
                                {(ipCheck.data as any).proxy ? 'YES' : 'NO'}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Hosting:</span>
                              <Badge
                                variant={(ipCheck.data as any).hosting ? 'secondary' : 'outline'}
                              >
                                {(ipCheck.data as any).hosting ? 'YES' : 'NO'}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Mobile:</span>
                              <span>{(ipCheck.data as any).mobile ? 'Yes' : 'No'}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">No data</div>
                        )}
                      </CardContent>
                    </Card>

                    {/* AbuseIPDB Result */}
                    <Card className="border-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">AbuseIPDB</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {abuseCheck.isFetching ? (
                          <div className="flex items-center justify-center py-4">
                            <IconLoader className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : abuseCheck.isError ? (
                          <div className="text-sm text-red-500">
                            Error: {(abuseCheck.error as Error)?.message || 'Failed to check'}
                          </div>
                        ) : abuseCheck.data ? (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Abuse Score:</span>
                              <Badge
                                variant={
                                  (abuseCheck.data as any).abuseConfidenceScore >= 50
                                    ? 'destructive'
                                    : (abuseCheck.data as any).abuseConfidenceScore >= 20
                                    ? 'secondary'
                                    : 'outline'
                                }
                              >
                                {(abuseCheck.data as any).abuseConfidenceScore ?? 0}%
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Reports:</span>
                              <span>{(abuseCheck.data as any).totalReports ?? 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Distinct Users:</span>
                              <span>{(abuseCheck.data as any).numDistinctUsers ?? 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Whitelisted:</span>
                              <Badge
                                variant={(abuseCheck.data as any).isWhitelisted ? 'outline' : 'secondary'}
                              >
                                {(abuseCheck.data as any).isWhitelisted ? 'YES' : 'NO'}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Last Report:</span>
                              <span className="text-xs">
                                {(abuseCheck.data as any).lastReportedAt
                                  ? new Date((abuseCheck.data as any).lastReportedAt).toLocaleDateString()
                                  : 'Never'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">No data</div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Email Check Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconAlertTriangle className="h-5 w-5" />
                  Email Check
                </CardTitle>
                <CardDescription>
                  Check email addresses for disposable domains and spam databases
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email-input">Email Address</Label>
                    <Input
                      id="email-input"
                      type="email"
                      placeholder="Enter email address"
                      value={emailToCheck}
                      onChange={(e) => setEmailToCheck(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button
                      onClick={handleEmailCheck}
                      disabled={!emailToCheck || emailCheck.isFetching || spamCheck.isFetching}
                    >
                      {(emailCheck.isFetching || spamCheck.isFetching) ? (
                        <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Check Email
                    </Button>
                  </div>
                </div>

                {/* Email Check Results */}
                {activeEmailCheck && (
                  <div className="grid gap-4 md:grid-cols-2 mt-4">
                    {/* Disposable Email Result */}
                    <Card className="border-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Disposable Check</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {emailCheck.isFetching ? (
                          <div className="flex items-center justify-center py-4">
                            <IconLoader className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : emailCheck.isError ? (
                          <div className="text-sm text-red-500">
                            Error: {(emailCheck.error as Error)?.message || 'Failed to check'}
                          </div>
                        ) : emailCheck.data ? (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Disposable:</span>
                              <Badge
                                variant={(emailCheck.data as any).isDisposable ? 'destructive' : 'outline'}
                              >
                                {(emailCheck.data as any).isDisposable ? 'YES' : 'NO'}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Domain:</span>
                              <span>{(emailCheck.data as any).domain || 'Unknown'}</span>
                            </div>
                            {(emailCheck.data as any).provider && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Provider:</span>
                                <span>{(emailCheck.data as any).provider}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">No data</div>
                        )}
                      </CardContent>
                    </Card>

                    {/* StopForumSpam Result */}
                    <Card className="border-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">StopForumSpam</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {spamCheck.isFetching ? (
                          <div className="flex items-center justify-center py-4">
                            <IconLoader className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : spamCheck.isError ? (
                          <div className="text-sm text-red-500">
                            Error: {(spamCheck.error as Error)?.message || 'Failed to check'}
                          </div>
                        ) : spamCheck.data ? (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Found in Spam DB:</span>
                              <Badge
                                variant={(spamCheck.data as any).email?.appears ? 'destructive' : 'outline'}
                              >
                                {(spamCheck.data as any).email?.appears ? 'YES' : 'NO'}
                              </Badge>
                            </div>
                            {(spamCheck.data as any).email?.confidence !== undefined && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Confidence:</span>
                                <Badge
                                  variant={
                                    (spamCheck.data as any).email.confidence >= 70
                                      ? 'destructive'
                                      : (spamCheck.data as any).email.confidence >= 30
                                      ? 'secondary'
                                      : 'outline'
                                  }
                                >
                                  {(spamCheck.data as any).email.confidence}%
                                </Badge>
                              </div>
                            )}
                            {(spamCheck.data as any).email?.frequency !== undefined && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Frequency:</span>
                                <span>{(spamCheck.data as any).email.frequency}</span>
                              </div>
                            )}
                            {(spamCheck.data as any).email?.lastseen && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Last Seen:</span>
                                <span className="text-xs">
                                  {new Date((spamCheck.data as any).email.lastseen).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">No data</div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags Search Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconUsers className="h-5 w-5" />
                  Tags Search
                </CardTitle>
                <CardDescription>
                  Find users by admin tags (e.g., risk:high, whale, suspicious)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tags-input">Tags (comma separated)</Label>
                    <Input
                      id="tags-input"
                      placeholder="risk:high, whale, churn:high"
                      value={tagsToSearch}
                      onChange={(e) => setTagsToSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button
                      onClick={handleTagsSearch}
                      disabled={!tagsToSearch || tagSearchResult.isFetching}
                    >
                      {tagSearchResult.isFetching ? (
                        <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Search Users
                    </Button>
                  </div>
                </div>

                {/* Tags Search Results */}
                {activeTagsSearch.length > 0 && (
                  <div className="mt-4">
                    <Card className="border-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center justify-between">
                          <span>Search Results</span>
                          {tagSearchResult.data && (
                            <Badge variant="secondary">
                              {(tagSearchResult.data as any).users?.length ?? 0} users
                            </Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {tagSearchResult.isFetching ? (
                          <div className="flex items-center justify-center py-4">
                            <IconLoader className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : tagSearchResult.isError ? (
                          <div className="text-sm text-red-500">
                            Error: {(tagSearchResult.error as Error)?.message || 'Failed to search'}
                          </div>
                        ) : tagSearchResult.data && (tagSearchResult.data as any).users?.length > 0 ? (
                          <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {(tagSearchResult.data as any).users.slice(0, 20).map((user: any) => (
                              <div
                                key={user.id}
                                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-sm">
                                    {user.nickname || user.email || `User #${user.id}`}
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {user.admin_tags?.slice(0, 5).map((tag: string, idx: number) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {user.risk_score !== undefined && (
                                    <Badge
                                      variant={
                                        user.risk_score >= 70
                                          ? 'destructive'
                                          : user.risk_score >= 40
                                          ? 'secondary'
                                          : 'outline'
                                      }
                                    >
                                      {user.risk_score}
                                    </Badge>
                                  )}
                                  <Button variant="outline" size="sm" asChild>
                                    <Link to={`/users/${user.id}` as any}>
                                      <IconExternalLink className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            ))}
                            {(tagSearchResult.data as any).users.length > 20 && (
                              <p className="text-sm text-muted-foreground text-center py-2">
                                Showing 20 of {(tagSearchResult.data as any).users.length} results
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground text-center py-4">
                            No users found with specified tags
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <IconShieldCheck className="h-4 w-4" />
                    Fraud Detection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full" size="sm">
                    <Link to="/fraud">
                      <IconExternalLink className="mr-2 h-4 w-4" />
                      Open
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <IconBrain className="h-4 w-4" />
                    System Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full" size="sm">
                    <Link to="/logs">
                      <IconExternalLink className="mr-2 h-4 w-4" />
                      Open
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <IconUsers className="h-4 w-4" />
                    All Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full" size="sm">
                    <Link to="/users">
                      <IconExternalLink className="mr-2 h-4 w-4" />
                      Open
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <IconCreditCard className="h-4 w-4" />
                    Cards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full" size="sm">
                    <Link to="/cards">
                      <IconExternalLink className="mr-2 h-4 w-4" />
                      Open
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
