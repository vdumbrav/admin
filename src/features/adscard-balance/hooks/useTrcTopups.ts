import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTrcTopup,
  getTrcTopups,
  cancelTrcTopup,
  getBalanceInfo,
  createCryptoTopup,
  getCryptoTopupStatus,
} from '../api/adscard-balance';
import type { TrcTopupStatus, CryptoTopupRequest } from '../types/api';

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
  filters?: {
    time?: string;
    status?: TrcTopupStatus;
    id?: number;
  },
) {
  return useQuery({
    queryKey: trcTopupKeys.list(filters),
    queryFn: async () => {
      const response = await getTrcTopups(filters);
      // Data is already an array
      return response.data;
    },
  });
}

/**
 * Hook to create a new TRC topup
 */
export function useCreateTrcTopup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (amount: number) => createTrcTopup(amount),
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
export function useCancelTrcTopup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cancelTrcTopup(id),
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
export function useBalanceInfo() {
  return useQuery({
    queryKey: balanceKeys.info(),
    queryFn: () => getBalanceInfo(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Hook to create a crypto topup (USDT TRC20/ERC20)
 */
export function useCreateCryptoTopup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CryptoTopupRequest) => createCryptoTopup(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: balanceKeys.info() });
    },
  });
}

/**
 * Hook to get crypto topup status
 */
export function useCryptoTopupStatus(paymentId: string | null) {
  return useQuery({
    queryKey: ['crypto-topup-status', paymentId],
    queryFn: () => getCryptoTopupStatus(paymentId!),
    enabled: !!paymentId,
    refetchInterval: 5000, // Poll every 5 seconds
  });
}
