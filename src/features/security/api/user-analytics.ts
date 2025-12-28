import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orvalMutator } from '@/api/orval-mutator';

// Types
export interface SuspiciousUser {
  id: number;
  nickname?: string;
  email?: string;
  risk_score: number;
  fraud_flags: string[];
  admin_tags: string[];
  last_analytics_at?: string;
  created_at: string;
}

export interface SuspiciousUsersResponse {
  users: SuspiciousUser[];
  total: number;
}

export interface UserAnalytics {
  userId: number;
  uid: string;
  basicInfo: {
    nickname?: string;
    email?: string;
    role: string;
    createdAt: string;
  };
  riskAssessment: {
    overallScore: number;
    overallLevel: string;
    flags: string[];
    factors: Array<{ factor: string; score: number }>;
  };
  aiSummary?: string;
  generatedAt: string;
}

export interface BatchAnalyticsResult {
  results: Array<{
    userId: number;
    success: boolean;
    analytics?: UserAnalytics;
    error?: string;
  }>;
  totalProcessed: number;
  successCount: number;
  errorCount: number;
}

export interface MultiAccountDetection {
  isLikelyMultiAccount: boolean;
  confidence: number;
  linkedAccounts: Array<{
    userId: number;
    nickname?: string;
    matchReason: string;
    matchScore: number;
  }>;
  matchingFactors: {
    sameIp: boolean;
    sameDevice: boolean;
    similarEmail: boolean;
    sameReferrer: boolean;
    sameTiming: boolean;
    sameWallet: boolean;
  };
  suspiciousPatterns: string[];
}

export interface CardFraudAnalysis {
  totalCards: number;
  activeCards: number;
  frozenCards: number;
  blockedCards: number;
  totalBalance: number;
  cardTransactions: {
    total: number;
    declined: number;
    chargebacks: number;
  };
  suspiciousPatterns: {
    multipleDeclines: boolean;
    rapidTransactions: boolean;
    highRiskMerchants: boolean;
    unusualAmounts: boolean;
    overdraftAttempts: boolean;
    nightActivity: boolean;
  };
  riskScore: number;
  recommendations: string[];
}

export interface SuspiciousCardsUser {
  userId: number;
  nickname?: string;
  email?: string;
  declineCount: number;
  hasZeroBalance: boolean;
  cardCount: number;
  riskScore: number;
}

// API Hooks

export const useSuspiciousUsers = (params: {
  minRiskScore?: number;
  hasFraudFlags?: boolean;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (params.minRiskScore) queryParams.set('minRiskScore', params.minRiskScore.toString());
  if (params.hasFraudFlags) queryParams.set('hasFraudFlags', 'true');
  if (params.limit) queryParams.set('limit', params.limit.toString());

  return useQuery({
    queryKey: ['admin', 'users', 'suspicious', params],
    queryFn: async (): Promise<SuspiciousUsersResponse> => {
      return orvalMutator({
        url: `/admin/users/analytics/suspicious?${queryParams.toString()}`,
        method: 'GET',
      });
    },
  });
};

export const useSuspiciousCards = (params: {
  minDeclines?: number;
  hasZeroBalance?: boolean;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (params.minDeclines) queryParams.set('minDeclines', params.minDeclines.toString());
  if (params.hasZeroBalance) queryParams.set('hasZeroBalance', 'true');
  if (params.limit) queryParams.set('limit', params.limit.toString());

  return useQuery({
    queryKey: ['admin', 'users', 'cards', 'suspicious', params],
    queryFn: async (): Promise<{ users: SuspiciousCardsUser[]; total: number }> => {
      return orvalMutator({
        url: `/admin/users/cards/suspicious?${queryParams.toString()}`,
        method: 'GET',
      });
    },
  });
};

export const useUserAnalytics = (userId: number, options?: { lang?: string; refresh?: boolean }) => {
  const queryParams = new URLSearchParams();
  if (options?.lang) queryParams.set('lang', options.lang);
  if (options?.refresh) queryParams.set('refresh', 'true');

  return useQuery({
    queryKey: ['admin', 'users', userId, 'analytics', options],
    queryFn: async (): Promise<UserAnalytics> => {
      return orvalMutator({
        url: `/admin/users/${userId}/analytics?${queryParams.toString()}`,
        method: 'GET',
      });
    },
    enabled: !!userId,
  });
};

export const useMultiAccountDetection = (userId: number) => {
  return useQuery({
    queryKey: ['admin', 'users', userId, 'multi-account'],
    queryFn: async (): Promise<MultiAccountDetection> => {
      return orvalMutator({
        url: `/admin/users/${userId}/multi-account`,
        method: 'GET',
      });
    },
    enabled: !!userId,
  });
};

export const useCardFraudAnalysis = (userId: number) => {
  return useQuery({
    queryKey: ['admin', 'users', userId, 'card-fraud'],
    queryFn: async (): Promise<CardFraudAnalysis> => {
      return orvalMutator({
        url: `/admin/users/${userId}/card-fraud`,
        method: 'GET',
      });
    },
    enabled: !!userId,
  });
};

export const useReferralFraudAnalysis = (userId: number) => {
  return useQuery({
    queryKey: ['admin', 'users', userId, 'referral-fraud'],
    queryFn: async (): Promise<any> => {
      return orvalMutator({
        url: `/admin/users/${userId}/referral-fraud`,
        method: 'GET',
      });
    },
    enabled: !!userId,
  });
};

export const useBatchAnalytics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { userIds: number[]; lang?: string }): Promise<BatchAnalyticsResult> => {
      return orvalMutator({
        url: '/admin/users/analytics/batch',
        method: 'POST',
        data: params,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

export const useAnalyzeAllUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      limit?: number;
      offset?: number;
      onlyWithoutAnalytics?: boolean;
      lang?: string;
    }): Promise<BatchAnalyticsResult> => {
      return orvalMutator({
        url: '/admin/users/analytics/all',
        method: 'POST',
        data: params,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

export const useRefreshUserAnalytics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number): Promise<UserAnalytics> => {
      return orvalMutator({
        url: `/admin/users/${userId}/analytics/refresh`,
        method: 'POST',
      });
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] });
    },
  });
};

// External checks
export const useCheckHashDit = (address: string, chain?: string) => {
  return useQuery({
    queryKey: ['admin', 'check', 'hashdit', address, chain],
    queryFn: async () => {
      const params = chain ? `?chain=${chain}` : '';
      return orvalMutator({
        url: `/admin/users/check/hashdit/${address}${params}`,
        method: 'GET',
      });
    },
    enabled: !!address,
  });
};

export const useCheckChainalysis = (address: string) => {
  return useQuery({
    queryKey: ['admin', 'check', 'chainalysis', address],
    queryFn: async () => {
      return orvalMutator({
        url: `/admin/users/check/chainalysis/${address}`,
        method: 'GET',
      });
    },
    enabled: !!address,
  });
};

export const useCheckIP = (ip: string) => {
  return useQuery({
    queryKey: ['admin', 'check', 'ip', ip],
    queryFn: async () => {
      return orvalMutator({
        url: `/admin/users/check/ip/${ip}`,
        method: 'GET',
      });
    },
    enabled: !!ip,
  });
};
