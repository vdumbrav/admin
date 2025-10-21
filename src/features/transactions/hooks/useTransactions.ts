import { useTransactionsControllerList } from '@/lib/api/generated/transactions/transactions';
import type { TransactionFilters } from '../types';

export function useTransactions(filters?: TransactionFilters) {
  const params = {
    page: filters?.page,
    itemsPerPage: filters?.itemsPerPage || 50,
    walletId: filters?.walletId,
    type: filters?.type as any,
    source: filters?.source as any,
  };

  return useTransactionsControllerList(params, {
    query: {
      enabled: true,
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  });
}
