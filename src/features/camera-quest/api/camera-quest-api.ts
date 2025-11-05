import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { client } from '@/lib/api-client';

export interface CameraQuestSettings {
  id: number;
  requiredPipes: number;
  isEnabled: boolean;
  sessionTimeoutMinutes: number;
  maxActiveSessions: number;
  createdAt: string;
  updatedAt: string;
}

export interface PrizeCard {
  id: number;
  adscardCardId: number;
  cardNumber: string;
  cardMasked: string;
  cvv: string;
  expiryDate: string;
  currency: string;
  binId: number;
  status: 'available' | 'reserved' | 'distributed';
  reservedForSessionId?: number;
  distributedToUserId?: number;
  distributedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: number;
  userId: number;
  playerUserId?: number;
  qrToken: string;
  status: 'active' | 'playing' | 'won' | 'failed' | 'cancelled' | 'expired';
  pipesPassed: number;
  expiresAt: string;
  completedAt?: string;
  createdAt: string;
  user?: {
    id: number;
    nickname: string;
  };
  playerUser?: {
    id: number;
    nickname: string;
  };
}

export interface Statistics {
  totalSessions: number;
  activeSessions: number;
  wonSessions: number;
  lostSessions: number;
  totalCardsDistributed: number;
  availableCardsCount: number;
  averageScore: number;
}

// Settings
export const useCameraQuestSettings = () => {
  return useQuery({
    queryKey: ['camera-quest', 'settings'],
    queryFn: async () => {
      const res = await client.get('/admin/camera-quest/settings');
      return res.data.settings as CameraQuestSettings;
    },
  });
};

export const useUpdateCameraQuestSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Partial<CameraQuestSettings>) => {
      const res = await client.put('/admin/camera-quest/settings', data);
      return res.data.settings as CameraQuestSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['camera-quest', 'settings'] });
      toast({
        title: 'Settings updated',
        description: 'Camera Quest settings have been updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update settings',
      });
    },
  });
};

// Prize Cards
export const usePrizeCards = (filters?: { status?: string; search?: string }) => {
  return useQuery({
    queryKey: ['camera-quest', 'cards', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);

      const res = await client.get(`/admin/camera-quest/cards?${params}`);
      return {
        cards: res.data.cards as PrizeCard[],
        total: res.data.total as number,
      };
    },
  });
};

export const useAddCardToPool = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (adscardCardId: number) => {
      const res = await client.post('/admin/camera-quest/cards', { adscardCardId });
      return res.data.prizeCard as PrizeCard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['camera-quest', 'cards'] });
      queryClient.invalidateQueries({ queryKey: ['camera-quest', 'statistics'] });
      toast({
        title: 'Card added',
        description: 'Card has been added to prize pool',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to add card',
      });
    },
  });
};

export const useRemoveCardFromPool = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      await client.delete(`/admin/camera-quest/cards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['camera-quest', 'cards'] });
      queryClient.invalidateQueries({ queryKey: ['camera-quest', 'statistics'] });
      toast({
        title: 'Card removed',
        description: 'Card has been removed from prize pool',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to remove card',
      });
    },
  });
};

// Sessions
export const useSessions = (filters?: { status?: string; userId?: number }) => {
  return useQuery({
    queryKey: ['camera-quest', 'sessions', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.userId) params.append('userId', filters.userId.toString());

      const res = await client.get(`/admin/camera-quest/sessions?${params}`);
      return {
        sessions: res.data.sessions as Session[],
        total: res.data.total as number,
      };
    },
  });
};

export const useCancelSession = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason?: string }) => {
      await client.post(`/admin/camera-quest/sessions/${id}/cancel`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['camera-quest', 'sessions'] });
      queryClient.invalidateQueries({ queryKey: ['camera-quest', 'statistics'] });
      toast({
        title: 'Session cancelled',
        description: 'Game session has been cancelled',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to cancel session',
      });
    },
  });
};

// Statistics
export const useStatistics = () => {
  return useQuery({
    queryKey: ['camera-quest', 'statistics'],
    queryFn: async () => {
      const res = await client.get('/admin/camera-quest/statistics');
      return res.data as Statistics;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
