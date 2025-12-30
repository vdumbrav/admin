import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconEye, IconShieldX } from "@tabler/icons-react";
import type { FraudIncident, RiskLevel } from "../types";

interface FraudIncidentsTableProps {
  incidents: FraudIncident[];
  isLoading: boolean;
  onViewDetails: (incident: FraudIncident) => void;
}

const riskLevelConfig: Record<RiskLevel, { label: string; variant: any; color: string }> = {
  low: { label: "Low", variant: "default", color: "text-green-600" },
  medium: { label: "Medium", variant: "outline", color: "text-yellow-600" },
  high: { label: "High", variant: "secondary", color: "text-orange-600" },
  critical: { label: "Critical", variant: "destructive", color: "text-red-600" },
};

export function FraudIncidentsTable({ incidents, isLoading, onViewDetails }: FraudIncidentsTableProps) {
  if (isLoading) {
    return <div className="text-center py-8">Loading incidents...</div>;
  }

  if (incidents.length === 0) {
    return (
      <div className="text-center py-12">
        <IconShieldX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No fraud incidents found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-medium">ID</th>
            <th className="text-left p-3 font-medium">User</th>
            <th className="text-left p-3 font-medium">Risk</th>
            <th className="text-left p-3 font-medium">Score</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Tier</th>
            <th className="text-left p-3 font-medium">Date</th>
            <th className="text-left p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident) => (
            <tr key={incident.id} className="border-b hover:bg-muted/50">
              <td className="p-3">#{incident.id}</td>
              <td className="p-3">
                <div className="text-sm">{incident.user_email}</div>
                <div className="text-xs text-muted-foreground">ID: {incident.user_id}</div>
              </td>
              <td className="p-3">
                <Badge variant={riskLevelConfig[incident.risk_level].variant}>
                  {riskLevelConfig[incident.risk_level].label}
                </Badge>
              </td>
              <td className="p-3">
                <span className={`font-bold ${riskLevelConfig[incident.risk_level].color}`}>
                  {incident.risk_score}
                </span>
              </td>
              <td className="p-3">
                <Badge variant="outline">{incident.status}</Badge>
              </td>
              <td className="p-3 uppercase text-xs">{incident.detection_tier}</td>
              <td className="p-3 text-sm">
                {new Date(incident.created_at).toLocaleDateString()}
              </td>
              <td className="p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(incident)}
                >
                  <IconEye className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
