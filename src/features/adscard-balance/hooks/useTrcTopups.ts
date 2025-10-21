import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTrcTopup,
  getTrcTopups,
  cancelTrcTopup,
  getBalanceInfo,
} from '../api/adscard-balance';
import type { TrcTopupStatus } from '../types/api';

// Query keys
const trcTopupKeys = {
  all: ['trc-topups'] as const,
  lists: () => [...trcTopupKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...trcTopupKeys.lists(), filters] as const,
  details: () => [...trcTopupKeys.all, 'detail'] as const,
  detail: (id: number) => [...trcTopupKeys.details(), id] as const,
};

const balanceKeys = {
  all: ['adscard-balance'] as const,
  info: () => [...balanceKeys.all, 'info'] as const,
};

/**
 * Hook to fetch TRC topups list
 */
export function useTrcTopups(
  authToken: string,
  filters?: {
    time?: string;
    status?: TrcTopupStatus;
    id?: number;
  },
) {
  return useQuery({
    queryKey: trcTopupKeys.list(filters),
    queryFn: async () => {
      const response = await getTrcTopups(authToken, filters);
      // Convert object to array
      return Object.values(response.data);
    },
    enabled: !!authToken,
  });
}

/**
 * Hook to create a new TRC topup
 */
export function useCreateTrcTopup(authToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (amount: number) => createTrcTopup(amount, authToken),
    onSuccess: () => {
      // Invalidate topups list to refetch
      queryClient.invalidateQueries({ queryKey: trcTopupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: balanceKeys.info() });
    },
  });
}

/**
 * Hook to cancel a TRC topup
 */
export function useCancelTrcTopup(authToken: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cancelTrcTopup(id, authToken),
    onSuccess: () => {
      // Invalidate topups list to refetch
      queryClient.invalidateQueries({ queryKey: trcTopupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: balanceKeys.info() });
    },
  });
}

/**
 * Hook to fetch balance information
 */
export function useBalanceInfo(authToken: string) {
  return useQuery({
    queryKey: balanceKeys.info(),
    queryFn: () => getBalanceInfo(authToken),
    enabled: !!authToken,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
