import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
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
  return useQuery({
    queryKey: ['camera-quest', 'settings'],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; settings: CameraQuestSettings }>(
        `${BASE_URL}/settings`,
      );
      return response.data.settings;
    },
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateSettingsDto) => {
      const response = await apiClient.put<{ success: boolean; settings: CameraQuestSettings }>(
        `${BASE_URL}/settings`,
        data,
      );
      return response.data.settings;
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
  return useQuery({
    queryKey: ['camera-quest', 'prize-cards', params],
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        cards: PrizeCard[];
        total: number;
      }>(`${BASE_URL}/cards`, { params });
      return response.data;
    },
  });
};

export const useAvailableCards = (params: GetAvailableCardsParams) => {
  return useQuery({
    queryKey: ['camera-quest', 'available-cards', params],
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        cards: any[];
        total: number;
      }>(`${BASE_URL}/cards/available`, { params });
      return response.data;
    },
  });
};

export const useAddCardToPool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddCardDto) => {
      const response = await apiClient.post<{ success: boolean; prizeCard: PrizeCard }>(
        `${BASE_URL}/cards`,
        data,
      );
      return response.data.prizeCard;
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

  return useMutation({
    mutationFn: async (data: BatchAddCardsDto) => {
      const response = await apiClient.post<{
        success: boolean;
        added: number;
        failed: number;
        errors?: string[];
      }>(`${BASE_URL}/cards/batch`, data);
      return response.data;
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

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete<{ success: boolean; message: string }>(
        `${BASE_URL}/cards/${id}`,
      );
      return response.data;
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

// Sessions
export const useSessions = (params: GetSessionsParams) => {
  return useQuery({
    queryKey: ['camera-quest', 'sessions', params],
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        sessions: CameraQuestSession[];
        total: number;
      }>(`${BASE_URL}/sessions`, { params });
      return response.data;
    },
  });
};

export const useCancelSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CancelSessionDto }) => {
      const response = await apiClient.post<{ success: boolean; message: string }>(
        `${BASE_URL}/sessions/${id}/cancel`,
        data,
      );
      return response.data;
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
  return useQuery({
    queryKey: ['camera-quest', 'statistics'],
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        statistics: CameraQuestStatistics;
      }>(`${BASE_URL}/statistics`);
      return response.data.statistics;
    },
  });
};
