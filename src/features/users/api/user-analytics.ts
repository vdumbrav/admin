import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orvalMutator } from '@/lib/api/client/orvalMutator';
import { useAppAuth } from '@/auth/hooks';
import type {
  ComprehensiveUserAnalytics,
  MultiAccountDetection,
  ReferralFraudAnalysis,
  CardFraudAnalysis,
  DepositWalletAnalysis,
  BlockchainRiskCheck,
  KeycloakData,
  SuspiciousUser,
  BatchAnalyticsResult,
  AnalyzeAllResult,
} from '../types';

// ==================== Single User Analytics ====================

export const useUserAnalytics = (userId: number, enabled = true) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'users', userId, 'analytics'],
    queryFn: async (): Promise<ComprehensiveUserAnalytics> => {
      const token = await auth.getAccessToken();
      return orvalMutator<ComprehensiveUserAnalytics>({
        url: `/admin/users/${userId}/analytics?lang=ru`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRefreshUserAnalytics = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, lang = 'ru' }: { userId: number; lang?: string }): Promise<ComprehensiveUserAnalytics> => {
      const token = await auth.getAccessToken();
      return orvalMutator<ComprehensiveUserAnalytics>({
        url: `/admin/users/${userId}/analytics/refresh?lang=${lang}`,
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: (data, { userId }) => {
      queryClient.setQueryData(['admin', 'users', userId, 'analytics'], data);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

export const useCachedUserAnalytics = (userId: number) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'users', userId, 'analytics', 'cached'],
    queryFn: async (): Promise<ComprehensiveUserAnalytics | null> => {
      const token = await auth.getAccessToken();
      return orvalMutator<ComprehensiveUserAnalytics | null>({
        url: `/admin/users/${userId}/analytics/cached`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    enabled: !!userId,
  });
};

// ==================== Batch Analytics ====================

export const useAnalyzeBatch = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userIds, lang = 'ru' }: { userIds: number[]; lang?: string }): Promise<BatchAnalyticsResult[]> => {
      const token = await auth.getAccessToken();
      return orvalMutator<BatchAnalyticsResult[]>({
        url: '/admin/users/analytics/batch',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { userIds, lang },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

export const useAnalyzeAllUsers = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: {
      limit?: number;
      offset?: number;
      onlyWithoutAnalytics?: boolean;
      lang?: string;
    }): Promise<AnalyzeAllResult> => {
      const token = await auth.getAccessToken();
      return orvalMutator<AnalyzeAllResult>({
        url: '/admin/users/analytics/all',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: options,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

// ==================== Fraud Detection ====================

export const useMultiAccountDetection = (userId: number, enabled = true) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'users', userId, 'multi-account'],
    queryFn: async (): Promise<MultiAccountDetection> => {
      const token = await auth.getAccessToken();
      return orvalMutator<MultiAccountDetection>({
        url: `/admin/users/${userId}/multi-account`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    enabled: enabled && !!userId,
  });
};

export const useReferralFraudAnalysis = (userId: number, enabled = true) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'users', userId, 'referral-fraud'],
    queryFn: async (): Promise<ReferralFraudAnalysis> => {
      const token = await auth.getAccessToken();
      return orvalMutator<ReferralFraudAnalysis>({
        url: `/admin/users/${userId}/referral-fraud`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    enabled: enabled && !!userId,
  });
};

export const useCardFraudAnalysis = (userId: number, enabled = true) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'users', userId, 'card-fraud'],
    queryFn: async (): Promise<CardFraudAnalysis> => {
      const token = await auth.getAccessToken();
      return orvalMutator<CardFraudAnalysis>({
        url: `/admin/users/${userId}/card-fraud`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    enabled: enabled && !!userId,
  });
};

export const useDepositWalletAnalysis = (userId: number, enabled = true) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'users', userId, 'deposit-wallets'],
    queryFn: async (): Promise<DepositWalletAnalysis> => {
      const token = await auth.getAccessToken();
      return orvalMutator<DepositWalletAnalysis>({
        url: `/admin/users/${userId}/deposit-wallets`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    enabled: enabled && !!userId,
  });
};

// ==================== Keycloak Data ====================

export const useKeycloakData = (userId: number, enabled = true) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'users', userId, 'keycloak'],
    queryFn: async (): Promise<KeycloakData> => {
      const token = await auth.getAccessToken();
      return orvalMutator<KeycloakData>({
        url: `/admin/users/${userId}/keycloak`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    enabled: enabled && !!userId,
  });
};

export const useKeycloakIpAnalysis = (userId: number, enabled = true) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'users', userId, 'ip-analysis'],
    queryFn: async () => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/users/${userId}/ip-analysis`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    enabled: enabled && !!userId,
  });
};

// ==================== Blockchain Checks ====================

export const useCheckHashDit = () => {
  const auth = useAppAuth();

  return useMutation({
    mutationFn: async ({ address, chain = 'tron' }: { address: string; chain?: string }): Promise<BlockchainRiskCheck> => {
      const token = await auth.getAccessToken();
      return orvalMutator<BlockchainRiskCheck>({
        url: `/admin/users/check/hashdit/${encodeURIComponent(address)}?chain=${chain}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });
};

export const useCheckChainalysis = () => {
  const auth = useAppAuth();

  return useMutation({
    mutationFn: async (address: string): Promise<BlockchainRiskCheck> => {
      const token = await auth.getAccessToken();
      return orvalMutator<BlockchainRiskCheck>({
        url: `/admin/users/check/chainalysis/${encodeURIComponent(address)}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });
};

export const useCheckTronAddress = () => {
  const auth = useAppAuth();

  return useMutation({
    mutationFn: async (address: string) => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/users/check/tron/${encodeURIComponent(address)}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });
};

// Webacy check (PAID - use sparingly)
export const useCheckWebacy = () => {
  const auth = useAppAuth();

  return useMutation({
    mutationFn: async ({ address, chain = 'ethereum' }: { address: string; chain?: string }): Promise<{
      address: string;
      chain: string;
      riskScore: number;
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
      flags: { type: string; severity: string; description: string }[];
      labels: string[];
      isSanctioned: boolean;
      sanctionDetails?: { source: string; reason: string }[];
    }> => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/users/check/webacy/${encodeURIComponent(address)}?chain=${chain}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });
};

// ==================== IP/Email Checks ====================

export const useCheckEmail = () => {
  const auth = useAppAuth();

  return useMutation({
    mutationFn: async (email: string): Promise<{ isDisposable: boolean; domain: string; reputation: string }> => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/users/check/email/${encodeURIComponent(email)}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });
};

export const useCheckIp = () => {
  const auth = useAppAuth();

  return useMutation({
    mutationFn: async (ip: string) => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/users/check/ip/${encodeURIComponent(ip)}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });
};

export const useCheckSpam = () => {
  const auth = useAppAuth();

  return useMutation({
    mutationFn: async ({ email, ip }: { email?: string; ip?: string }): Promise<{ isSpammer: boolean; confidence: number; reports: number }> => {
      const params = new URLSearchParams();
      if (email) params.append('email', email);
      if (ip) params.append('ip', ip);
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/users/check/spam?${params.toString()}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });
};

export const useCheckAbuseIp = () => {
  const auth = useAppAuth();

  return useMutation({
    mutationFn: async (ip: string): Promise<{ abuseScore: number; reports: number; isPublic: boolean }> => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/users/check/abuse/${encodeURIComponent(ip)}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });
};

// ==================== Suspicious Users ====================

export const useSuspiciousUsers = (params?: { minRiskScore?: number; hasFraudFlags?: boolean; limit?: number }) => {
  const auth = useAppAuth();

  const queryParams = new URLSearchParams();
  if (params?.minRiskScore !== undefined) queryParams.append('minRiskScore', params.minRiskScore.toString());
  if (params?.hasFraudFlags !== undefined) queryParams.append('hasFraudFlags', params.hasFraudFlags.toString());
  if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());

  return useQuery({
    queryKey: ['admin', 'users', 'suspicious', params],
    queryFn: async (): Promise<SuspiciousUser[]> => {
      const token = await auth.getAccessToken();
      return orvalMutator<SuspiciousUser[]>({
        url: `/admin/users/analytics/suspicious?${queryParams.toString()}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });
};

export const useSuspiciousCardUsers = (params?: { minDeclines?: number; hasZeroBalance?: boolean; limit?: number }) => {
  const auth = useAppAuth();

  const queryParams = new URLSearchParams();
  if (params?.minDeclines !== undefined) queryParams.append('minDeclines', params.minDeclines.toString());
  if (params?.hasZeroBalance !== undefined) queryParams.append('hasZeroBalance', params.hasZeroBalance.toString());
  if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());

  return useQuery({
    queryKey: ['admin', 'users', 'cards', 'suspicious', params],
    queryFn: async () => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/users/cards/suspicious?${queryParams.toString()}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });
};

// ==================== Tagging ====================

export const useAddUserTags = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, tags }: { userId: number; tags: string[] }): Promise<{ success: boolean }> => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/users/${userId}/tags`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { tags },
      });
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

export const useRemoveUserTags = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, tags }: { userId: number; tags: string[] }): Promise<{ success: boolean }> => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/users/${userId}/tags`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { tags },
      });
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

export const useFindUsersByTags = (tags: string[], matchAll = false, enabled = true) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'users', 'by-tags', tags, matchAll],
    queryFn: async () => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/users/by-tags?tags=${tags.join(',')}&matchAll=${matchAll}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    enabled: enabled && tags.length > 0,
  });
};

// ==================== Admin Notes ====================

export const useUpdateAdminNotes = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, notes }: { userId: number; notes: string }): Promise<{ success: boolean }> => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/users/${userId}/notes`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { notes },
      });
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] });
    },
  });
};
