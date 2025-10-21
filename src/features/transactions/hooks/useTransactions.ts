import { useAdminCardTransactions } from '../api/admin-transactions';
import type { TransactionFilters, TransactionItemDto } from '../types';

export function useTransactions(filters?: TransactionFilters) {
  const cardId = filters?.cardId ? String(filters.cardId) : undefined;

  const { data, isLoading, error, refetch } = useAdminCardTransactions(cardId);

  // Map AdminCardTransaction to TransactionItemDto format for table compatibility
  const mappedItems: TransactionItemDto[] = (data || []).map((tx) => ({
    id: tx.id,
    walletId: tx.userId, // Use userId as walletId for display
    amount: tx.amount,
    currency: tx.currency as any,
    direction: tx.direction as any,
    type: tx.group as any, // Map group to type
    source: 'card' as any, // All admin card transactions are from cards
    status: tx.status as any,
    createdAt: tx.createdAt,
    txHash: tx.cardIds?.[0] || undefined, // Use first cardId as reference
  }));

  // Transform admin data to match the existing Transaction interface
  const totalItems = data?.length || 0;
  const itemsPerPage = filters?.itemsPerPage || 50;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const transformedData = {
    items: mappedItems,
    totalItems,
    page: filters?.page || 1,
    itemsPerPage,
    totalPages,
  };

  return {
    data: transformedData,
    isLoading,
    error,
    refetch,
  };
}
