// User Analytics Types - Aligned with Backend

export interface MultiAccountDetection {
  sameIpUsers: Array<{
    userId: number;
    email?: string;
    ips: string[];
    overlapCount: number;
  }>;
  sameDeviceUsers: Array<{
    userId: number;
    email?: string;
    devices: string[];
    overlapCount: number;
  }>;
  similarEmails: Array<{
    userId: number;
    email: string;
    similarity: number;
  }>;
  sameReferrer: Array<{
    userId: number;
    email?: string;
    referrerId: number;
  }>;
  sharedWallets: Array<{
    userId: number;
    email?: string;
    walletAddress: string;
  }>;
  totalSuspiciousConnections: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface ReferralFraudAnalysis {
  totalReferrals: number;
  suspiciousReferrals: number;
  patterns: {
    sameIpReferrals: number;
    rapidReferrals: number;
    disposableEmailReferrals: number;
    noActivityReferrals: number;
  };
  suspiciousUsers: Array<{
    userId: number;
    email?: string;
    flags: string[];
  }>;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface CardFraudAnalysis {
  totalCards: number;
  totalTransactions: number;
  declinedTransactions: number;
  failedTransactions: number;
  zeroBalanceAttempts: number;
  suspiciousPatterns: {
    rapidDeclines: boolean;
    unusualMerchants: boolean;
    subscriptionWithoutFunds: boolean;
    highDeclineRate: boolean;
    multipleCardsNoBalance: boolean;
  };
  suspiciousCards: Array<{
    cardId: number;
    cardMasked: string;
    declineCount: number;
    balance: number;
    flags: string[];
  }>;
  recentDeclines: Array<{
    cardId: number;
    amount: number;
    merchant?: string;
    reason?: string;
    createdAt: string;
  }>;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface IpGeoAnalysis {
  ip: string;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  isp?: string;
  org?: string;
  isProxy: boolean;
  isVpn: boolean;
  isHosting: boolean;
  isTor: boolean;
  timezone?: string;
  lat?: number;
  lon?: number;
  threatLevel: 'low' | 'medium' | 'high';
}

export interface DepositWalletAnalysis {
  totalDeposits: number;
  analyzedAddresses: number;
  riskyAddresses: Array<{
    address: string;
    chain: string;
    amount: number;
    currency: string;
    riskScore: number;
    flags: string[];
    createdAt: string;
  }>;
  summary: {
    totalRiskScore: number;
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
  };
}

export interface BlockchainRiskCheck {
  address: string;
  chain: string;
  provider: 'hashdit' | 'chainalysis' | 'webacy';
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
  categories?: string[];
  details?: Record<string, unknown>;
}

export interface KeycloakData {
  sessions: Array<{
    id: string;
    ipAddress: string;
    started: number;
    lastAccess: number;
    clients: Record<string, string>;
  }>;
  loginHistory: Array<{
    type: string;
    time: number;
    ipAddress: string;
    details: Record<string, string>;
  }>;
  devices: Array<{
    device: string;
    os: string;
    osVersion: string;
    browser: string;
    lastAccess: number;
    current: boolean;
    mobile: boolean;
    ipAddress: string;
  }>;
  profile: {
    id: string;
    email: string;
    emailVerified: boolean;
    enabled: boolean;
    createdTimestamp: number;
    username: string;
    firstName?: string;
    lastName?: string;
    attributes: Record<string, string[]>;
    federatedIdentities: Array<{ identityProvider: string; userId: string; userName?: string }>;
    requiredActions: string[];
  } | null;
  uniqueIps: string[];
}

export interface ComprehensiveUserAnalytics {
  userId: number;
  email?: string;
  analyzedAt: string;

  // Basic user info
  basicInfo: {
    createdAt: string;
    lastLogin?: string;
    emailVerified: boolean;
    role: string;
    premiumLevel?: number;
  };

  // Financial summary
  financialSummary: {
    totalCards: number;
    totalBalance: number;
    totalTransactions: number;
    totalSpent: number;
    totalDeposits: number;
  };

  // Risk scoring
  riskAssessment: {
    overallScore: number;
    overallLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: Array<{
      factor: string;
      score: number;
      details: string;
    }>;
    flags: string[];
  };

  // Fraud detection
  multiAccountDetection: MultiAccountDetection;
  referralFraudAnalysis: ReferralFraudAnalysis;
  cardFraudAnalysis?: CardFraudAnalysis;

  // IP/Geo data
  ipAnalysis: {
    uniqueIps: string[];
    countries: string[];
    suspiciousIps: Array<IpGeoAnalysis & { reason: string }>;
    hasVpn: boolean;
    hasProxy: boolean;
    hasTor: boolean;
  };

  // Blockchain analysis
  blockchainRisk?: {
    depositAddresses: DepositWalletAnalysis;
    walletChecks: BlockchainRiskCheck[];
  };

  // Spam/Abuse checks
  spamChecks: {
    stopForumSpam: { isSpammer: boolean; confidence: number; reports: number } | null;
    abuseIpDb: { abuseScore: number; reports: number; isPublic: boolean } | null;
    disposableEmail: { isDisposable: boolean; domain: string; reputation: string } | null;
  };

  // AI summary
  aiSummary?: string;

  // Tags
  suggestedTags: string[];
  existingTags: string[];

  // Keycloak data
  keycloakData?: KeycloakData;
}

export interface SuspiciousUser {
  userId: number;
  email?: string;
  riskScore: number;
  flags: string[];
  lastAnalyzedAt?: string;
  tags: string[];
}

export interface BatchAnalyticsResult {
  userId: number;
  success: boolean;
  error?: string;
}

export interface AnalyzeAllResult {
  processed: number;
  success: number;
  failed: number;
  results: BatchAnalyticsResult[];
}
