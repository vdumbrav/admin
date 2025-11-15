import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orvalMutator } from '@/lib/api/client/orvalMutator';
import { useAppAuth } from '@/auth/hooks';
import { toast } from 'sonner';
import type {
  CameraQuestSettings,
  PrizeCard,
  CameraQuestSession,
  CameraQuestStatistics,
  GetPrizeCardsParams,
  GetAvailableCardsParams,
  GetSessionsParams,
  UpdateSettingsDto,
  AddCardDto,
  BatchAddCardsDto,
  CancelSessionDto,
} from './types';

const BASE_URL = '/admin/camera-quest';

// Settings
export const useSettings = () => {
  const { getAccessToken } = useAppAuth();

  return useQuery({
    queryKey: ['camera-quest', 'settings'],
    queryFn: async () => {
      const token = await getAccessToken();
      const response = await orvalMutator<{ success: boolean; settings: CameraQuestSettings }>({
        url: `${BASE_URL}/settings`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.settings;
    },
    enabled: true,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  const { getAccessToken } = useAppAuth();

  return useMutation({
    mutationFn: async (data: UpdateSettingsDto) => {
      const token = await getAccessToken();
      const response = await orvalMutator<{ success: boolean; settings: CameraQuestSettings }>({
        url: `${BASE_URL}/settings`,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data,
      });
      return response.settings;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['camera-quest', 'settings'] });
      toast.success('Settings updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update settings');
    },
  });
};

// Prize Cards
export const usePrizeCards = (params: GetPrizeCardsParams) => {
  const { getAccessToken } = useAppAuth();

  return useQuery({
    queryKey: ['camera-quest', 'prize-cards', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.status) searchParams.set('status', params.status);
      if (params.search) searchParams.set('search', params.search);
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.offset) searchParams.set('offset', params.offset.toString());

      const token = await getAccessToken();
      const response = await orvalMutator<{
        success: boolean;
        cards: PrizeCard[];
        total: number;
      }>({
        url: `${BASE_URL}/cards?${searchParams.toString()}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    },
    enabled: true,
  });
};

export const useAvailableCards = (params: GetAvailableCardsParams) => {
  const { getAccessToken } = useAppAuth();

  return useQuery({
    queryKey: ['camera-quest', 'available-cards', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.set('search', params.search);
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.offset) searchParams.set('offset', params.offset.toString());

      const token = await getAccessToken();
      const response = await orvalMutator<{
        success: boolean;
        cards: any[];
        total: number;
      }>({
        url: `${BASE_URL}/cards/available?${searchParams.toString()}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    },
    enabled: true,
  });
};

export const useAddCardToPool = () => {
  const queryClient = useQueryClient();
  const { getAccessToken } = useAppAuth();

  return useMutation({
    mutationFn: async (data: AddCardDto) => {
      const token = await getAccessToken();
      const response = await orvalMutator<{ success: boolean; prizeCard: PrizeCard }>({
        url: `${BASE_URL}/cards`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data,
      });
      return response.prizeCard;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['camera-quest', 'prize-cards'] });
      void queryClient.invalidateQueries({ queryKey: ['camera-quest', 'available-cards'] });
      void queryClient.invalidateQueries({ queryKey: ['camera-quest', 'statistics'] });
      toast.success('Card added to prize pool');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add card');
    },
  });
};

export const useBatchAddCardsToPool = () => {
  const queryClient = useQueryClient();
  const { getAccessToken } = useAppAuth();

  return useMutation({
    mutationFn: async (data: BatchAddCardsDto) => {
      const token = await getAccessToken();
      const response = await orvalMutator<{
        success: boolean;
        added: number;
        failed: number;
        errors?: string[];
      }>({
        url: `${BASE_URL}/cards/batch`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data,
      });
      return response;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['camera-quest', 'prize-cards'] });
      void queryClient.invalidateQueries({ queryKey: ['camera-quest', 'available-cards'] });
      void queryClient.invalidateQueries({ queryKey: ['camera-quest', 'statistics'] });

      if (data.failed > 0) {
        toast.warning(`Added ${data.added} cards, ${data.failed} failed`);
      } else {
        toast.success(`Successfully added ${data.added} cards to prize pool`);
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add cards');
    },
  });
};

export const useRemoveCardFromPool = () => {
  const queryClient = useQueryClient();
  const { getAccessToken } = useAppAuth();

  return useMutation({
    mutationFn: async (id: number) => {
      const token = await getAccessToken();
      const response = await orvalMutator<{ success: boolean; message: string }>({
        url: `${BASE_URL}/cards/${id}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['camera-quest', 'prize-cards'] });
      void queryClient.invalidateQueries({ queryKey: ['camera-quest', 'available-cards'] });
      void queryClient.invalidateQueries({ queryKey: ['camera-quest', 'statistics'] });
      toast.success('Card removed from prize pool');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to remove card');
    },
  });
};

export const useRefreshBalances = () => {
  const queryClient = useQueryClient();
  const { getAccessToken } = useAppAuth();

  return useMutation({
    mutationFn: async (cardIds: number[]) => {
      const token = await getAccessToken();
      const response = await orvalMutator<{
        success: boolean;
        balances: Record<number, number>;
        totalCards: number;
      }>({
        url: `${BASE_URL}/cards/refresh-balances`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { cardIds },
      });
      return response;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['camera-quest', 'prize-cards'] });
      toast.success(`Refreshed balances for ${data.totalCards} cards`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to refresh balances');
    },
  });
};

export const useReturnCardToPool = () => {
  const queryClient = useQueryClient();
  const { getAccessToken } = useAppAuth();

  return useMutation({
    mutationFn: async (id: number) => {
      const token = await getAccessToken();
      const response = await orvalMutator<{ success: boolean; message: string }>({
        url: `${BASE_URL}/cards/${id}/return`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['camera-quest', 'prize-cards'] });
      void queryClient.invalidateQueries({ queryKey: ['camera-quest', 'available-cards'] });
      void queryClient.invalidateQueries({ queryKey: ['camera-quest', 'statistics'] });
      toast.success('Card returned to pool successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to return card to pool');
    },
  });
};

export const useManuallyGiveCard = () => {
  const queryClient = useQueryClient();
  const { getAccessToken } = useAppAuth();

  return useMutation({
    mutationFn: async (data: { userId: number; prizeCardId?: number }) => {
      const token = await getAccessToken();
      const response = await orvalMutator<{
        success: boolean;
        message: string;
        userCard: any;
        prizeCard: PrizeCard;
        user: any;
      }>({
        url: `${BASE_URL}/cards/manual-give`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { userIdOrEmail: data.userId, prizeCardId: data.prizeCardId },
      });
      return response;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['camera-quest', 'prize-cards'] });
      void queryClient.invalidateQueries({ queryKey: ['camera-quest', 'available-cards'] });
      void queryClient.invalidateQueries({ queryKey: ['camera-quest', 'statistics'] });
      toast.success(data.message || 'Card given to user successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to give card to user');
    },
  });
};

// Search users
export const useSearchUsers = (query: string) => {
  const { getAccessToken } = useAppAuth();

  return useQuery({
    queryKey: ['camera-quest', 'search-users', query],
    queryFn: async () => {
      if (!query || query.length < 2) {
        return { users: [], total: 0 };
      }

      const token = await getAccessToken();
      const response = await orvalMutator<{
        success: boolean;
        users: Array<{
          id: number;
          email: string | null;
          firstName: string | null;
          lastName: string | null;
          username: string | null;
        }>;
        total: number;
      }>({
        url: `${BASE_URL}/users/search?q=${encodeURIComponent(query)}&limit=20`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    },
    enabled: query.length >= 2,
  });
};

// Sessions
export const useSessions = (params: GetSessionsParams) => {
  const { getAccessToken } = useAppAuth();

  return useQuery({
    queryKey: ['camera-quest', 'sessions', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.status) searchParams.set('status', params.status);
      if (params.userId) searchParams.set('userId', params.userId.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.offset) searchParams.set('offset', params.offset.toString());

      const token = await getAccessToken();
      const response = await orvalMutator<{
        success: boolean;
        sessions: CameraQuestSession[];
        total: number;
      }>({
        url: `${BASE_URL}/sessions?${searchParams.toString()}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    },
    enabled: true,
  });
};

export const useCancelSession = () => {
  const queryClient = useQueryClient();
  const { getAccessToken } = useAppAuth();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CancelSessionDto }) => {
      const token = await getAccessToken();
      const response = await orvalMutator<{ success: boolean; message: string }>({
        url: `${BASE_URL}/sessions/${id}/cancel`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data,
      });
      return response;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['camera-quest', 'sessions'] });
      void queryClient.invalidateQueries({ queryKey: ['camera-quest', 'statistics'] });
      toast.success('Session cancelled');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to cancel session');
    },
  });
};

// Statistics
export const useStatistics = () => {
  const { getAccessToken } = useAppAuth();

  return useQuery({
    queryKey: ['camera-quest', 'statistics'],
    queryFn: async () => {
      const token = await getAccessToken();
      const response = await orvalMutator<{
        success: boolean;
        statistics: CameraQuestStatistics;
      }>({
        url: `${BASE_URL}/statistics`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.statistics;
    },
    enabled: true,
  });
};
