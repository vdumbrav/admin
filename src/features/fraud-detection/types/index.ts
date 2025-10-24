export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type DetectionTier = 'rules' | 'ml' | 'gemini' | 'gpt4';
export type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'false_positive' | 'confirmed_fraud';

export interface FraudIncident {
  id: number;
  user_id: number;
  user_email: string;
  risk_score: number;
  risk_level: RiskLevel;
  detection_tier: DetectionTier;
  status: IncidentStatus;
  should_block: boolean;
  was_blocked: boolean;
  flags?: string[];
  reasons?: string[];
  amount?: number;
  currency?: string;
  transaction_id?: string;
  gemini_analysis?: Record<string, unknown>;
  gpt4_analysis?: Record<string, unknown>;
  webacy_data?: Record<string, unknown>;
  investigation_notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface FraudStats {
  byStatus: Record<IncidentStatus, number>;
  byRiskLevel: Record<RiskLevel, number>;
  byTier: Record<DetectionTier, number>;
  recentIncidents24h: number;
  blockedTransactions: number;
  averageFraudScore: string;
}

export interface FraudFilters {
  status?: IncidentStatus;
  riskLevel?: RiskLevel;
  limit?: number;
  offset?: number;
}
