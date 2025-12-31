import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orvalMutator } from '@/lib/api/client/orvalMutator';
import { useAppAuth } from '@/auth/hooks';

// Types
export enum FeatureValueType {
  BOOLEAN = 'boolean',
  TEXT = 'text',
  NUMBER = 'number',
  PERCENTAGE = 'percentage',
  CURRENCY = 'currency',
  XP = 'xp',
  MULTIPLIER = 'multiplier',
}

export interface TierValue {
  enabled: boolean;
  value?: string | number | boolean;
  displayText?: string;
}

export interface FeatureValues {
  free: TierValue;
  level1: TierValue;
  level2: TierValue;
  level3: TierValue;
}

export interface Feature {
  key: string;
  name: string;
  description?: string;
  valueType: FeatureValueType;
  values: FeatureValues;
  order: number;
  enabled: boolean;
  icon?: string;
  tooltip?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeatureDto {
  key: string;
  name: string;
  description?: string;
  valueType: FeatureValueType;
  values: FeatureValues;
  order?: number;
  enabled?: boolean;
  icon?: string;
  tooltip?: string;
  category?: string;
}

export interface UpdateFeatureDto {
  name?: string;
  description?: string;
  valueType?: FeatureValueType;
  values?: FeatureValues;
  order?: number;
  enabled?: boolean;
  icon?: string;
  tooltip?: string;
  category?: string;
}

// Premium Stats Types
export interface PremiumStats {
  overview: {
    totalRevenue: number;
    revenueToday: number;
    revenueLast7Days: number;
    revenueLast30Days: number;
    revenueChange: number;
    totalSubscriptions: number;
    churnRate: number;
  };
  byLevel: Array<{
    level: number;
    title: string;
    activeUsers: number;
    price: number;
    priceTwa: number;
  }>;
  trend: Array<{
    date: string;
    subscriptions: number;
    revenue: number;
  }>;
  distribution: Array<{
    level: number;
    title: string;
    count: number;
  }>;
  recentSubscriptions: Array<{
    id: number;
    userId: number;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    bundleTitle: string;
    bundleLevel: number;
    userNickname: string;
    userEmail: string;
  }>;
  timestamp: string;
}

// Hooks
export const useFeatures = () => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'features'],
    queryFn: async (): Promise<Feature[]> => {
      const token = await auth.getAccessToken();
      return orvalMutator<Feature[]>({
        url: '/admin/features',
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });
};

export const useFeature = (key: string) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'feature', key],
    queryFn: async (): Promise<Feature> => {
      const token = await auth.getAccessToken();
      return orvalMutator<Feature>({
        url: `/admin/features/${encodeURIComponent(key)}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    enabled: !!key,
  });
};

export const useCreateFeature = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFeatureDto) => {
      const token = await auth.getAccessToken();
      return orvalMutator<Feature>({
        url: '/admin/features',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'features'] });
    },
  });
};

export const useUpdateFeature = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, data }: { key: string; data: UpdateFeatureDto }) => {
      const token = await auth.getAccessToken();
      return orvalMutator<Feature>({
        url: `/admin/features/${encodeURIComponent(key)}`,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'features'] });
    },
  });
};

export const useDeleteFeature = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (key: string) => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/features/${encodeURIComponent(key)}`,
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'features'] });
    },
  });
};

export const useToggleFeature = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (key: string) => {
      const token = await auth.getAccessToken();
      return orvalMutator<Feature>({
        url: `/admin/features/${encodeURIComponent(key)}/toggle`,
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'features'] });
    },
  });
};

export const useReorderFeatures = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keys: string[]) => {
      const token = await auth.getAccessToken();
      return orvalMutator<Feature[]>({
        url: '/admin/features/reorder',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { keys },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'features'] });
    },
  });
};

export const useGenerateFeatureDescription = () => {
  const auth = useAppAuth();

  return useMutation({
    mutationFn: async (data: { name: string; valueType: FeatureValueType; exampleValues?: Record<string, unknown>; language?: string }) => {
      const token = await auth.getAccessToken();
      return orvalMutator<{ description: string; tooltip: string }>({
        url: '/admin/features/generate-description',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data,
      });
    },
  });
};

export const useSeedFeatures = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await auth.getAccessToken();
      return orvalMutator<{ seeded: number }>({
        url: '/admin/features/seed',
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'features'] });
    },
  });
};

// Premium Stats Hook
export const usePremiumStats = () => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'statistics', 'premium'],
    queryFn: async (): Promise<PremiumStats> => {
      const token = await auth.getAccessToken();
      return orvalMutator<PremiumStats>({
        url: '/admin/statistics/premium',
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    refetchInterval: 60000, // Refresh every minute
  });
};
