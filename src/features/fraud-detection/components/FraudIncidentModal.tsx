import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconAlertTriangle, IconBrain, IconShieldCheck, IconCloudComputing } from "@tabler/icons-react";
import { useUpdateFraudIncident } from "../api/fraud";
import type { FraudIncident, IncidentStatus } from "../types";

interface FraudIncidentModalProps {
  incident: FraudIncident;
  open: boolean;
  onClose: () => void;
}

export function FraudIncidentModal({ incident, open, onClose }: FraudIncidentModalProps) {
  const [status, setStatus] = useState<IncidentStatus>(incident.status);
  const [notes, setNotes] = useState(incident.investigation_notes || "");
  const updateMutation = useUpdateFraudIncident();

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      id: incident.id,
      data: {
        status,
        investigation_notes: notes,
      },
    });
    onClose();
  };

  const riskColor = {
    low: "text-green-600",
    medium: "text-yellow-600",
    high: "text-orange-600",
    critical: "text-red-600",
  }[incident.risk_level];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconAlertTriangle className="h-5 w-5 text-orange-600" />
            Fraud Incident #{incident.id}
          </DialogTitle>
          <DialogDescription>
            Detected on {new Date(incident.created_at).toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">User</p>
                <p className="text-sm">{incident.user_email} (ID: {incident.user_id})</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risk Score</p>
                <p className={`text-2xl font-bold ${riskColor}`}>
                  {incident.risk_score}/100
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Detection Tier</p>
                <Badge variant="outline">{incident.detection_tier}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Was Blocked</p>
                {incident.was_blocked ? (
                  <Badge variant="destructive">Yes</Badge>
                ) : (
                  <Badge variant="default">No</Badge>
                )}
              </div>
              {incident.amount && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="text-sm font-medium">
                    ${incident.amount.toFixed(2)} {incident.currency}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Flags and Reasons */}
          {(incident.flags || incident.reasons) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Detection Flags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {incident.flags && incident.flags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Flags</p>
                    <div className="flex flex-wrap gap-2">
                      {incident.flags.map((flag, i) => (
                        <Badge key={i} variant="outline">
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {incident.reasons && incident.reasons.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Reasons</p>
                    <ul className="list-disc list-inside space-y-1">
                      {incident.reasons.map((reason, i) => (
                        <li key={i} className="text-sm">{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* AI Analysis */}
          <Tabs defaultValue="gemini" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="gemini">
                <IconBrain className="h-4 w-4 mr-2" />
                Gemini AI
              </TabsTrigger>
              <TabsTrigger value="gpt4">
                <IconCloudComputing className="h-4 w-4 mr-2" />
                GPT-4
              </TabsTrigger>
              <TabsTrigger value="webacy">
                <IconShieldCheck className="h-4 w-4 mr-2" />
                Webacy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="gemini" className="mt-4">
              <Card>
                <CardContent className="p-4">
                  {incident.gemini_analysis ? (
                    <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-64">
                      {JSON.stringify(incident.gemini_analysis, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-sm text-muted-foreground">No Gemini analysis available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gpt4" className="mt-4">
              <Card>
                <CardContent className="p-4">
                  {incident.gpt4_analysis ? (
                    <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-64">
                      {JSON.stringify(incident.gpt4_analysis, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-sm text-muted-foreground">No GPT-4 analysis available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="webacy" className="mt-4">
              <Card>
                <CardContent className="p-4">
                  {incident.webacy_data ? (
                    <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-64">
                      {JSON.stringify(incident.webacy_data, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-sm text-muted-foreground">No Webacy data available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Investigation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Investigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Select value={status} onValueChange={(v) => setStatus(v as IncidentStatus)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="false_positive">False Positive</SelectItem>
                    <SelectItem value="confirmed_fraud">Confirmed Fraud</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Investigation Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add investigation notes..."
                  className="mt-2 min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
