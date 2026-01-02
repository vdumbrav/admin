import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orvalMutator } from '@/lib/api/client/orvalMutator';
import { useAppAuth } from '@/auth/hooks';
import type {
  TokenStatistics,
  TokenListItem,
  PaginatedTokensResponse,
  TokenFilterParams,
  UpdateTokenRequest,
  BulkPlatformUpdateRequest,
  BulkFeatureUpdateRequest,
  SyncResult,
  IconDownloadResult,
  CdnConfig,
} from '../types';

// ==================== Statistics ====================

export const useTokenStatistics = () => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'tokens', 'stats'],
    queryFn: async (): Promise<TokenStatistics> => {
      const token = await auth.getAccessToken();

      const response = await orvalMutator<{ success: boolean; data: TokenStatistics }>({
        url: '/admin/tokens/stats',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
  });
};

// ==================== Networks ====================

export const useTokenNetworks = () => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'tokens', 'networks'],
    queryFn: async (): Promise<string[]> => {
      const token = await auth.getAccessToken();

      const response = await orvalMutator<{ success: boolean; data: string[] }>({
        url: '/admin/tokens/networks',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
  });
};

// ==================== Token List ====================

export const useTokenList = (
  page: number = 1,
  limit: number = 50,
  filters?: TokenFilterParams
) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'tokens', 'list', page, limit, JSON.stringify(filters || {})],
    queryFn: async (): Promise<PaginatedTokensResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters?.search) {
        params.append('search', filters.search);
      }
      if (filters?.network) {
        params.append('network', filters.network);
      }
      if (filters?.platform) {
        params.append('platform', filters.platform);
      }
      if (filters?.isActive !== undefined) {
        params.append('isActive', filters.isActive.toString());
      }

      const token = await auth.getAccessToken();

      const response = await orvalMutator<{ success: boolean; data: PaginatedTokensResponse }>({
        url: `/admin/tokens?${params.toString()}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
  });
};

// ==================== Single Token ====================

export const useToken = (id: number) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'tokens', id],
    queryFn: async (): Promise<TokenListItem> => {
      const token = await auth.getAccessToken();

      const response = await orvalMutator<{ success: boolean; data: TokenListItem }>({
        url: `/admin/tokens/${id}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
    enabled: !!id,
  });
};

// ==================== Update Token ====================

export const useUpdateToken = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateTokenRequest & { id: number }) => {
      const token = await auth.getAccessToken();

      return orvalMutator<{ success: boolean; data: TokenListItem }>({
        url: `/admin/tokens/${id}`,
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tokens'] });
    },
  });
};

// ==================== Bulk Platform Visibility ====================

export const useBulkPlatformVisibility = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkPlatformUpdateRequest) => {
      const token = await auth.getAccessToken();

      return orvalMutator<{ success: boolean; data: { updated: number } }>({
        url: '/admin/tokens/bulk/platform-visibility',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tokens'] });
    },
  });
};

// ==================== Bulk Feature Update ====================

export const useBulkFeatureUpdate = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkFeatureUpdateRequest) => {
      const token = await auth.getAccessToken();

      return orvalMutator<{ success: boolean; data: { updated: number } }>({
        url: '/admin/tokens/bulk/feature',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tokens'] });
    },
  });
};

// ==================== Sync from ChangeNow ====================

export const useSyncFromChangeNow = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await auth.getAccessToken();

      return orvalMutator<{ success: boolean; data: SyncResult }>({
        url: '/admin/tokens/sync',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tokens'] });
    },
  });
};

// ==================== Download Icons ====================

export const useDownloadIcons = () => {
  const auth = useAppAuth();

  return useMutation({
    mutationFn: async () => {
      const token = await auth.getAccessToken();

      return orvalMutator<{ success: boolean; data: IconDownloadResult }>({
        url: '/admin/tokens/download-icons',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });
};

// ==================== CDN Config ====================

export const useCdnConfig = () => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'tokens', 'cdn-config'],
    queryFn: async (): Promise<CdnConfig> => {
      const token = await auth.getAccessToken();

      const response = await orvalMutator<{ success: boolean; data: CdnConfig }>({
        url: '/admin/tokens/cdn-config',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
  });
};
