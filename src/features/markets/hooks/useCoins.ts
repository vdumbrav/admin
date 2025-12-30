import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketsApi } from '../api/client';
import type { Coin, CoinFormData } from '../types';

const COINS_QUERY_KEY = ['markets', 'coins'];

export function useCoins() {
  return useQuery<Coin[]>({
    queryKey: COINS_QUERY_KEY,
    queryFn: () => marketsApi.coins.getAll(),
  });
}

export function useCoin(id: number) {
  return useQuery<Coin>({
    queryKey: [...COINS_QUERY_KEY, id],
    queryFn: () => marketsApi.coins.getOne(id),
    enabled: !!id,
  });
}

export function useCreateCoin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CoinFormData) => marketsApi.coins.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COINS_QUERY_KEY });
    },
  });
}

export function useUpdateCoin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CoinFormData }) =>
      marketsApi.coins.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COINS_QUERY_KEY });
    },
  });
}

export function useDeleteCoin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => marketsApi.coins.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COINS_QUERY_KEY });
    },
  });
}
