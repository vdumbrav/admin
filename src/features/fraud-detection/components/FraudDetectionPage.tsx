import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IconRefresh, IconAlertTriangle, IconShieldCheck, IconBrain, IconTrendingUp } from '@tabler/icons-react';
import { FraudIncidentsTable } from './FraudIncidentsTable';
import { FraudIncidentModal } from './FraudIncidentModal';
import { useFraudIncidents, useFraudStats } from '../api/fraud';
import type { FraudIncident, FraudFilters } from '../types';

export function FraudDetectionPage() {
  const [filters, setFilters] = useState<FraudFilters>({
    limit: 50,
    offset: 0,
  });
  const [selectedIncident, setSelectedIncident] = useState<FraudIncident | null>(null);

  const { data: incidentsData, isLoading: incidentsLoading, refetch: refetchIncidents } = useFraudIncidents(filters);
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useFraudStats();

  const handleRefresh = () => {
    refetchIncidents();
    refetchStats();
  };

  const handleViewDetails = (incident: FraudIncident) => {
    setSelectedIncident(incident);
  };

  const stats = statsData?.stats;
  const incidents = incidentsData?.incidents || [];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <IconShieldCheck className="h-8 w-8 text-primary" />
            Fraud Detection
          </h1>
          <p className="text-muted-foreground">
            AI-powered fraud monitoring and incident management
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={filters.riskLevel || 'all'}
            onValueChange={(value) =>
              setFilters({ ...filters, riskLevel: value === 'all' ? undefined : value as any })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status || 'all'}
            onValueChange={(value) =>
              setFilters({ ...filters, status: value === 'all' ? undefined : value as any })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="investigating">Investigating</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="false_positive">False Positive</SelectItem>
              <SelectItem value="confirmed_fraud">Confirmed Fraud</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={incidentsLoading || statsLoading}
          >
            <IconRefresh className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Incidents */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Incidents
                </p>
                <p className="text-2xl font-bold">
                  {statsLoading ? '...' : incidentsData?.total || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <IconAlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent 24h */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Last 24 Hours
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {statsLoading ? '...' : stats?.recentIncidents24h || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <IconTrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blocked Transactions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Blocked Transactions
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {statsLoading ? '...' : stats?.blockedTransactions || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                <IconShieldCheck className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Fraud Score */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Avg Fraud Score
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {statsLoading ? '...' : stats?.averageFraudScore || '0.00'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <IconBrain className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Level Breakdown */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats && (
          <>
            <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
              <CardContent className="p-4">
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  Critical Risk
                </div>
                <div className="text-xl font-bold text-red-600">
                  {stats.byRiskLevel?.critical || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
              <CardContent className="p-4">
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  High Risk
                </div>
                <div className="text-xl font-bold text-orange-600">
                  {stats.byRiskLevel?.high || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
              <CardContent className="p-4">
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  Medium Risk
                </div>
                <div className="text-xl font-bold text-yellow-600">
                  {stats.byRiskLevel?.medium || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
              <CardContent className="p-4">
                <div className="text-xs font-medium text-muted-foreground mb-1">
                  Low Risk
                </div>
                <div className="text-xl font-bold text-green-600">
                  {stats.byRiskLevel?.low || 0}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Incidents Table */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Fraud Incidents</h2>
          <FraudIncidentsTable
            incidents={incidents}
            isLoading={incidentsLoading}
            onViewDetails={handleViewDetails}
          />
        </CardContent>
      </Card>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <FraudIncidentModal
          incident={selectedIncident}
          open={!!selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}
    </div>
  );
}
