import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  IconSearch,
  IconTag,
  IconMail,
  IconNetwork,
  IconCurrencyBitcoin,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconChevronRight,
  IconEye,
  IconFilter,
  IconWorld,
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
  type SuspiciousUser,
} from '@/features/security/api/user-analytics';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

// Type definitions for check results
interface HashDitResult {
  riskScore?: number;
  riskLevel?: string;
}

interface ChainalysisResult {
  sanctioned?: boolean;
  categories?: string[];
}

interface TronResult {
  overallRisk?: string;
}

interface IPCheckResult {
  proxy?: boolean;
  hosting?: boolean;
  country?: string;
  city?: string;
  isp?: string;
}

interface AbuseCheckResult {
  abuseScore?: number;
  reports?: number;
}

interface SpamCheckResult {
  isSpammer?: boolean;
}

interface EmailCheckResult {
  isDisposable?: boolean;
  domain?: string;
  reputation?: string;
}

export const Route = createFileRoute('/_authenticated/security/' as any)({
  component: SecurityCenterPage,
});

function SecurityCenterPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [minRiskScore, setMinRiskScore] = useState(0);
  const [analysisLang, setAnalysisLang] = useState('ru');
  const [searchQuery, setSearchQuery] = useState('');

  // Tools state
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

  // Selected user for details
  const [selectedUser, setSelectedUser] = useState<SuspiciousUser | null>(null);

  // Data queries
  const { data: fraudStats, isLoading: fraudLoading, refetch: refetchFraud } = useFraudStats();
  const { data: suspiciousData, isLoading: suspiciousLoading, refetch: refetchSuspicious } = useSuspiciousUsers({
    minRiskScore,
    hasFraudFlags: false,
    limit: 200,
  });
  const { data: cardsData, isLoading: cardsLoading, refetch: refetchCards } = useSuspiciousCards({
    minDeclines: 3,
    limit: 100,
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
  const suspiciousCards = cardsData?.users || [];

  // Risk distribution
  const riskDistribution = useMemo(() => {
    const users = suspiciousData?.users || [];
    return {
      critical: users.filter(u => u.risk_score >= 80).length,
      high: users.filter(u => u.risk_score >= 60 && u.risk_score < 80).length,
      medium: users.filter(u => u.risk_score >= 40 && u.risk_score < 60).length,
      low: users.filter(u => u.risk_score < 40).length,
    };
  }, [suspiciousData?.users]);

  // Handlers
  const handleRefresh = () => {
    refetchFraud();
    refetchSuspicious();
    refetchCards();
  };

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

  const handleAnalyzeAll = () => {
    analyzeAllMutation.mutate({
      limit: 50,
      onlyWithoutAnalytics: true,
      lang: analysisLang,
    });
  };

  const getRiskBadge = (score: number) => {
    if (score >= 80) return <Badge variant="destructive" className="font-mono">CRITICAL {score}</Badge>;
    if (score >= 60) return <Badge variant="destructive" className="bg-orange-500 font-mono">HIGH {score}</Badge>;
    if (score >= 40) return <Badge variant="secondary" className="bg-yellow-500 text-black font-mono">MEDIUM {score}</Badge>;
    return <Badge variant="outline" className="font-mono">LOW {score}</Badge>;
  };

  const getTagBadge = (tag: string) => {
    if (tag.startsWith('risk:')) {
      const level = tag.split(':')[1];
      if (level === 'critical') return <Badge variant="destructive" className="text-xs">{tag}</Badge>;
      if (level === 'high') return <Badge variant="destructive" className="bg-orange-500 text-xs">{tag}</Badge>;
      return <Badge variant="secondary" className="text-xs">{tag}</Badge>;
    }
    if (tag.includes('fraud') || tag.includes('suspicious')) {
      return <Badge variant="destructive" className="text-xs">{tag}</Badge>;
    }
    return <Badge variant="outline" className="text-xs">{tag}</Badge>;
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <IconShieldCheck className="h-6 w-6 text-primary" />
            </div>
            Security Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Fraud Detection, Risk Monitoring & User Analytics
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
            <IconRefresh className={cn("mr-2 h-4 w-4", (fraudLoading || suspiciousLoading) && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Total Analyzed</p>
                <p className="text-2xl font-bold">{suspiciousLoading ? '...' : suspiciousData?.total || 0}</p>
              </div>
              <IconUsers className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Critical Risk</p>
                <p className="text-2xl font-bold text-red-600">{riskDistribution.critical}</p>
              </div>
              <IconAlertTriangle className="h-8 w-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">High Risk</p>
                <p className="text-2xl font-bold text-orange-600">{riskDistribution.high}</p>
              </div>
              <IconTrendingUp className="h-8 w-8 text-orange-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Medium Risk</p>
                <p className="text-2xl font-bold text-yellow-600">{riskDistribution.medium}</p>
              </div>
              <IconAlertCircle className="h-8 w-8 text-yellow-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Card Issues</p>
                <p className="text-2xl font-bold text-purple-600">{cardsLoading ? '...' : cardsData?.total || 0}</p>
              </div>
              <IconCreditCard className="h-8 w-8 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="batch">Batch</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconAnalyze className="h-5 w-5" />
                  Risk Distribution
                </CardTitle>
                <CardDescription>Users by risk level</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-600">Critical (80+)</span>
                    <span className="font-mono text-sm">{riskDistribution.critical}</span>
                  </div>
                  <Progress value={riskDistribution.critical} max={suspiciousData?.total || 100} className="h-2 bg-red-100" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-orange-600">High (60-79)</span>
                    <span className="font-mono text-sm">{riskDistribution.high}</span>
                  </div>
                  <Progress value={riskDistribution.high} max={suspiciousData?.total || 100} className="h-2 bg-orange-100" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-yellow-600">Medium (40-59)</span>
                    <span className="font-mono text-sm">{riskDistribution.medium}</span>
                  </div>
                  <Progress value={riskDistribution.medium} max={suspiciousData?.total || 100} className="h-2 bg-yellow-100" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-600">Low (&lt;40)</span>
                    <span className="font-mono text-sm">{riskDistribution.low}</span>
                  </div>
                  <Progress value={riskDistribution.low} max={suspiciousData?.total || 100} className="h-2 bg-green-100" />
                </div>
              </CardContent>
            </Card>

            {/* Recent High Risk Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconAlertTriangle className="h-5 w-5 text-red-500" />
                  Critical Risk Users
                </CardTitle>
                <CardDescription>Users requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suspiciousLoading ? (
                    <>
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </>
                  ) : (
                    suspiciousUsers
                      .filter(u => u.risk_score >= 80)
                      .slice(0, 5)
                      .map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedUser(user)}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {user.nickname || user.email || `User #${user.id}`}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {user.admin_tags?.slice(0, 3).map((tag, idx) => (
                                <span key={idx}>{getTagBadge(tag)}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getRiskBadge(user.risk_score)}
                            <IconChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      ))
                  )}
                  {!suspiciousLoading && suspiciousUsers.filter(u => u.risk_score >= 80).length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <IconCheck className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      No critical risk users found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => setActiveTab('users')}>
                  <IconUserSearch className="mr-2 h-4 w-4" />
                  View All Suspicious Users
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('cards')}>
                  <IconCreditCard className="mr-2 h-4 w-4" />
                  View Card Issues
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('tools')}>
                  <IconSearch className="mr-2 h-4 w-4" />
                  Check Address/IP/Email
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('batch')}>
                  <IconBrain className="mr-2 h-4 w-4" />
                  Run Batch Analysis
                </Button>
                <Link to="/fraud" className="inline-flex">
                  <Button variant="outline">
                    <IconExternalLink className="mr-2 h-4 w-4" />
                    Fraud Incidents
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <IconUserSearch className="h-5 w-5" />
                    Suspicious Users
                  </CardTitle>
                  <CardDescription>
                    {suspiciousData?.total || 0} users analyzed • Showing {suspiciousUsers.length} results
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-[200px]"
                    />
                  </div>
                  <Select value={minRiskScore.toString()} onValueChange={(v) => setMinRiskScore(parseInt(v))}>
                    <SelectTrigger className="w-[150px]">
                      <IconFilter className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">All Users</SelectItem>
                      <SelectItem value="30">Risk 30+</SelectItem>
                      <SelectItem value="50">Risk 50+</SelectItem>
                      <SelectItem value="70">Risk 70+</SelectItem>
                      <SelectItem value="80">Critical 80+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {suspiciousLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : suspiciousUsers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <IconUsers className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No users found with risk score {minRiskScore}+</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]">ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead className="w-[120px]">Risk Score</TableHead>
                        <TableHead className="w-[150px]">Last Analyzed</TableHead>
                        <TableHead className="w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suspiciousUsers.slice(0, 50).map((user) => (
                        <TableRow key={user.id} className="cursor-pointer hover:bg-accent/50" onClick={() => setSelectedUser(user)}>
                          <TableCell className="font-mono text-xs">{user.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.nickname || 'No nickname'}</p>
                              <p className="text-xs text-muted-foreground">{user.email || 'No email'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {user.admin_tags?.slice(0, 4).map((tag, idx) => (
                                <span key={idx}>{getTagBadge(tag)}</span>
                              ))}
                              {(user.admin_tags?.length || 0) > 4 && (
                                <Badge variant="outline" className="text-xs">+{(user.admin_tags?.length || 0) - 4}</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getRiskBadge(user.risk_score)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {user.last_analytics_at
                              ? formatDistanceToNow(new Date(user.last_analytics_at), { addSuffix: true, locale: ru })
                              : 'Never'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/users/${user.id}` as any}>
                                  <IconEye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cards Tab */}
        <TabsContent value="cards" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconCreditCard className="h-5 w-5" />
                Suspicious Card Activity
              </CardTitle>
              <CardDescription>Users with multiple declined transactions or zero balance issues</CardDescription>
            </CardHeader>
            <CardContent>
              {cardsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : suspiciousCards.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <IconCheck className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <p>No suspicious card activity detected</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Cards</TableHead>
                        <TableHead>Declines</TableHead>
                        <TableHead>Zero Balance</TableHead>
                        <TableHead>Risk Score</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suspiciousCards.map((user) => (
                        <TableRow key={user.userId}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.nickname || 'No nickname'}</p>
                              <p className="text-xs text-muted-foreground">{user.email || `User #${user.userId}`}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">{user.cardCount}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">{user.declineCount} declines</Badge>
                          </TableCell>
                          <TableCell>
                            {user.hasZeroBalance ? (
                              <Badge variant="destructive">Yes</Badge>
                            ) : (
                              <Badge variant="outline">No</Badge>
                            )}
                          </TableCell>
                          <TableCell>{getRiskBadge(user.riskScore)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/users/${user.userId}` as any}>
                                <IconEye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Address Check */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconCurrencyBitcoin className="h-5 w-5" />
                  Address Check
                </CardTitle>
                <CardDescription>Check wallet address via HashDit, Chainalysis, TRON API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter wallet address..."
                      value={addressToCheck}
                      onChange={(e) => setAddressToCheck(e.target.value)}
                    />
                  </div>
                  <Select value={chainToCheck} onValueChange={setChainToCheck}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tron">TRON</SelectItem>
                      <SelectItem value="eth">Ethereum</SelectItem>
                      <SelectItem value="bsc">BSC</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddressCheck} disabled={!addressToCheck}>
                    <IconSearch className="h-4 w-4" />
                  </Button>
                </div>

                {activeAddressCheck && (
                  <div className="space-y-3 pt-2">
                    <Separator />

                    {/* HashDit */}
                    <div className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">HashDit</span>
                        {hashditCheck.isLoading ? (
                          <IconLoader className="h-4 w-4 animate-spin" />
                        ) : hashditCheck.data ? (
                          <Badge variant={((hashditCheck.data as HashDitResult).riskScore ?? 0) > 50 ? 'destructive' : 'outline'}>
                            Score: {(hashditCheck.data as HashDitResult).riskScore ?? 'N/A'}
                          </Badge>
                        ) : (
                          <Badge variant="outline">N/A</Badge>
                        )}
                      </div>
                      {(hashditCheck.data as HashDitResult)?.riskLevel && (
                        <p className="text-xs text-muted-foreground">Level: {(hashditCheck.data as HashDitResult).riskLevel}</p>
                      )}
                    </div>

                    {/* Chainalysis */}
                    <div className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">Chainalysis</span>
                        {chainalysisCheck.isLoading ? (
                          <IconLoader className="h-4 w-4 animate-spin" />
                        ) : chainalysisCheck.data ? (
                          <Badge variant={(chainalysisCheck.data as ChainalysisResult).sanctioned ? 'destructive' : 'outline'}>
                            {(chainalysisCheck.data as ChainalysisResult).sanctioned ? 'SANCTIONED' : 'Clean'}
                          </Badge>
                        ) : (
                          <Badge variant="outline">N/A</Badge>
                        )}
                      </div>
                      {((chainalysisCheck.data as ChainalysisResult)?.categories?.length ?? 0) > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {(chainalysisCheck.data as ChainalysisResult).categories!.map((cat: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">{cat}</Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* TRON Full Check */}
                    {chainToCheck === 'tron' && (
                      <div className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">TRON Full Check</span>
                          {tronCheck.isLoading ? (
                            <IconLoader className="h-4 w-4 animate-spin" />
                          ) : tronCheck.data ? (
                            <Badge variant={(tronCheck.data as TronResult).overallRisk === 'high' ? 'destructive' : 'outline'}>
                              {(tronCheck.data as TronResult).overallRisk?.toUpperCase() || 'CHECKED'}
                            </Badge>
                          ) : (
                            <Badge variant="outline">N/A</Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* IP Check */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconNetwork className="h-5 w-5" />
                  IP Check
                </CardTitle>
                <CardDescription>Check IP via ip-api, AbuseIPDB, StopForumSpam</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter IP address..."
                    value={ipToCheck}
                    onChange={(e) => setIpToCheck(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleIpCheck} disabled={!ipToCheck}>
                    <IconSearch className="h-4 w-4" />
                  </Button>
                </div>

                {activeIpCheck && (
                  <div className="space-y-3 pt-2">
                    <Separator />

                    {/* IP-API */}
                    <div className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">IP-API</span>
                        {ipCheck.isLoading ? (
                          <IconLoader className="h-4 w-4 animate-spin" />
                        ) : ipCheck.data ? (
                          <div className="flex gap-1">
                            {(ipCheck.data as IPCheckResult).proxy && <Badge variant="destructive">Proxy</Badge>}
                            {(ipCheck.data as IPCheckResult).hosting && <Badge variant="secondary">Hosting</Badge>}
                            {!(ipCheck.data as IPCheckResult).proxy && !(ipCheck.data as IPCheckResult).hosting && <Badge variant="outline">Clean</Badge>}
                          </div>
                        ) : (
                          <Badge variant="outline">N/A</Badge>
                        )}
                      </div>
                      {ipCheck.data && (
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p><IconWorld className="inline h-3 w-3 mr-1" />{(ipCheck.data as IPCheckResult).country} / {(ipCheck.data as IPCheckResult).city}</p>
                          <p>ISP: {(ipCheck.data as IPCheckResult).isp}</p>
                        </div>
                      )}
                    </div>

                    {/* AbuseIPDB */}
                    <div className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">AbuseIPDB</span>
                        {abuseCheck.isLoading ? (
                          <IconLoader className="h-4 w-4 animate-spin" />
                        ) : abuseCheck.data ? (
                          <Badge variant={((abuseCheck.data as AbuseCheckResult).abuseScore ?? 0) > 50 ? 'destructive' : 'outline'}>
                            Score: {(abuseCheck.data as AbuseCheckResult).abuseScore ?? 0}%
                          </Badge>
                        ) : (
                          <Badge variant="outline">N/A</Badge>
                        )}
                      </div>
                      {abuseCheck.data && (
                        <p className="text-xs text-muted-foreground">Reports: {(abuseCheck.data as AbuseCheckResult).reports ?? 0}</p>
                      )}
                    </div>

                    {/* StopForumSpam */}
                    <div className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">StopForumSpam</span>
                        {spamCheck.isLoading ? (
                          <IconLoader className="h-4 w-4 animate-spin" />
                        ) : spamCheck.data ? (
                          <Badge variant={(spamCheck.data as SpamCheckResult).isSpammer ? 'destructive' : 'outline'}>
                            {(spamCheck.data as SpamCheckResult).isSpammer ? 'SPAMMER' : 'Clean'}
                          </Badge>
                        ) : (
                          <Badge variant="outline">N/A</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Email Check */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconMail className="h-5 w-5" />
                  Email Check
                </CardTitle>
                <CardDescription>Check if email is disposable or in spam databases</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter email..."
                    value={emailToCheck}
                    onChange={(e) => setEmailToCheck(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleEmailCheck} disabled={!emailToCheck}>
                    <IconSearch className="h-4 w-4" />
                  </Button>
                </div>

                {activeEmailCheck && (
                  <div className="space-y-3 pt-2">
                    <Separator />

                    {/* Disposable Check */}
                    <div className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">Email Validation</span>
                        {emailCheck.isLoading ? (
                          <IconLoader className="h-4 w-4 animate-spin" />
                        ) : emailCheck.data ? (
                          <Badge variant={(emailCheck.data as EmailCheckResult).isDisposable ? 'destructive' : 'outline'}>
                            {(emailCheck.data as EmailCheckResult).isDisposable ? 'DISPOSABLE' : 'Valid'}
                          </Badge>
                        ) : (
                          <Badge variant="outline">N/A</Badge>
                        )}
                      </div>
                      {emailCheck.data && (
                        <div className="text-xs text-muted-foreground">
                          <p>Domain: {(emailCheck.data as EmailCheckResult).domain ?? 'N/A'}</p>
                          <p>Reputation: {(emailCheck.data as EmailCheckResult).reputation ?? 'N/A'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconTag className="h-5 w-5" />
                  Tags Search
                </CardTitle>
                <CardDescription>Find users by specific tags</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="tag1, tag2, tag3..."
                    value={tagsToSearch}
                    onChange={(e) => setTagsToSearch(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleTagsSearch} disabled={!tagsToSearch}>
                    <IconSearch className="h-4 w-4" />
                  </Button>
                </div>

                {activeTagsSearch.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <Separator />
                    <div className="flex flex-wrap gap-1 mb-2">
                      {activeTagsSearch.map((tag, idx) => (
                        <Badge key={idx} variant="secondary">{tag}</Badge>
                      ))}
                    </div>

                    {tagSearchResult.isLoading ? (
                      <Skeleton className="h-20 w-full" />
                    ) : tagSearchResult.data ? (
                      <div className="p-3 rounded-lg border">
                        <p className="font-medium text-sm mb-2">
                          Found: {String((tagSearchResult.data as any).users?.length ?? 0)} users
                        </p>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                          {((tagSearchResult.data as any).users || []).slice(0, 10).map((user: any) => (
                            <div key={user.id} className="flex items-center justify-between p-2 rounded bg-muted/50">
                              <span className="text-sm">{user.nickname || user.email || `User #${user.id}`}</span>
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/users/${user.id}` as any}>
                                  <IconEye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No results</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Batch Tab */}
        <TabsContent value="batch" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconBrain className="h-5 w-5" />
                Batch Analysis
              </CardTitle>
              <CardDescription>
                Analyze multiple users at once to generate risk scores and tags
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Select value={analysisLang} onValueChange={setAnalysisLang}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ru">Русский</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="uk">Українська</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAnalyzeAll} disabled={analyzeAllMutation.isPending}>
                  {analyzeAllMutation.isPending ? (
                    <>
                      <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <IconAnalyze className="mr-2 h-4 w-4" />
                      Analyze Unprocessed Users
                    </>
                  )}
                </Button>
              </div>

              {analyzeAllMutation.isPending && (
                <div className="p-4 rounded-lg border bg-muted/50">
                  <p className="text-sm mb-2">Processing users...</p>
                  <Progress className="h-2" />
                </div>
              )}

              {analyzeAllMutation.data && (
                <div className="p-4 rounded-lg border">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 rounded bg-muted/50">
                      <p className="text-2xl font-bold">{analyzeAllMutation.data.totalProcessed}</p>
                      <p className="text-xs text-muted-foreground">Total Processed</p>
                    </div>
                    <div className="text-center p-3 rounded bg-green-500/10">
                      <p className="text-2xl font-bold text-green-600">{analyzeAllMutation.data.successCount}</p>
                      <p className="text-xs text-muted-foreground">Successful</p>
                    </div>
                    <div className="text-center p-3 rounded bg-red-500/10">
                      <p className="text-2xl font-bold text-red-600">{analyzeAllMutation.data.errorCount}</p>
                      <p className="text-xs text-muted-foreground">Failed</p>
                    </div>
                  </div>

                  {analyzeAllMutation.data.results && (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {analyzeAllMutation.data.results.slice(0, 20).map((result: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted/50">
                          <span className="text-sm">User #{result.userId}</span>
                          {result.success ? (
                            <Badge variant="outline" className="text-green-600">
                              <IconCheck className="h-3 w-3 mr-1" />
                              Success
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <IconX className="h-3 w-3 mr-1" />
                              {result.error}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {analyzeAllMutation.isError && (
                <div className="p-4 rounded-lg border border-red-500 bg-red-500/10">
                  <p className="text-sm text-red-600">
                    Error: {analyzeAllMutation.error?.message || 'Unknown error'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Detail Modal */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              User #{selectedUser?.id}
              {selectedUser && getRiskBadge(selectedUser.risk_score)}
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.nickname || selectedUser?.email || 'No identifier'}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Nickname</Label>
                  <p className="font-medium">{selectedUser.nickname || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedUser.email || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Created</Label>
                  <p className="font-medium">
                    {formatDistanceToNow(new Date(selectedUser.created_at), { addSuffix: true, locale: ru })}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Last Analyzed</Label>
                  <p className="font-medium">
                    {selectedUser.last_analytics_at
                      ? formatDistanceToNow(new Date(selectedUser.last_analytics_at), { addSuffix: true, locale: ru })
                      : 'Never'}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Tags</Label>
                <div className="flex flex-wrap gap-1">
                  {selectedUser.admin_tags?.map((tag, idx) => (
                    <span key={idx}>{getTagBadge(tag)}</span>
                  )) || <span className="text-sm text-muted-foreground">No tags</span>}
                </div>
              </div>

              {selectedUser.fraud_flags && selectedUser.fraud_flags.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Fraud Flags</Label>
                  <div className="flex flex-wrap gap-1">
                    {selectedUser.fraud_flags.map((flag, idx) => (
                      <Badge key={idx} variant="destructive">{flag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button asChild className="flex-1">
                  <Link to={`/users/${selectedUser.id}` as any}>
                    <IconEye className="mr-2 h-4 w-4" />
                    View Full Profile
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
