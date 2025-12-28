import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
} from '@/features/security/api/user-analytics';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/security/')({
  component: SecurityCenterPage,
});

function SecurityCenterPage() {
  const [minRiskScore, setMinRiskScore] = useState(50);
  const [analysisLang, setAnalysisLang] = useState('ru');

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
                  No suspicious users found with risk score >= {minRiskScore}
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
                          <Link to={`/users/${user.id}`}>
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
                          <Link to={`/users/${user.userId}`}>
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
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconShieldCheck className="h-5 w-5" />
                  Fraud Detection
                </CardTitle>
                <CardDescription>AI-powered fraud monitoring and incidents</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/fraud">
                    <IconExternalLink className="mr-2 h-4 w-4" />
                    Open Fraud Detection
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconBrain className="h-5 w-5" />
                  System Logs
                </CardTitle>
                <CardDescription>AI analysis of application logs</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/logs">
                    <IconExternalLink className="mr-2 h-4 w-4" />
                    Open System Logs
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconUsers className="h-5 w-5" />
                  All Users
                </CardTitle>
                <CardDescription>User management and individual analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/users">
                    <IconExternalLink className="mr-2 h-4 w-4" />
                    Open Users
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconCreditCard className="h-5 w-5" />
                  Cards
                </CardTitle>
                <CardDescription>Card management and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to="/cards">
                    <IconExternalLink className="mr-2 h-4 w-4" />
                    Open Cards
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
