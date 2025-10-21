import { useAdminCardTransactions } from '../api/admin-transactions';
import type { TransactionFilters } from '../types';

export function useTransactions(filters?: TransactionFilters) {
  const cardId = filters?.cardId ? String(filters.cardId) : undefined;

  const { data, isLoading, error, refetch } = useAdminCardTransactions(cardId);

  // Transform admin data to match the existing Transaction interface
  const transformedData = {
    items: data || [],
    totalItems: data?.length || 0,
    page: filters?.page || 1,
    itemsPerPage: filters?.itemsPerPage || 50,
  };

  return {
    data: transformedData,
    isLoading,
    error,
    refetch,
  };
}
