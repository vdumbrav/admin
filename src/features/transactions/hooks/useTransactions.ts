import { useMemo } from 'react';
import { useAdminCardTransactions } from '../api/admin-transactions';
import type { TransactionFilters, TransactionItemDto } from '../types';

export function useTransactions(filters?: TransactionFilters) {
  const cardId = filters?.cardId ? String(filters.cardId) : undefined;

  const { data, isLoading, error, refetch } = useAdminCardTransactions(cardId);

  // Map AdminCardTransaction to TransactionItemDto format for table compatibility
  const mappedItems: TransactionItemDto[] = useMemo(() => {
    return (data || []).map((tx) => ({
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
  }, [data]);

  // Apply filters (client-side for multi-select)
  const filteredItems = useMemo(() => {
    let items = mappedItems;

    // Filter by wallet ID
    if (filters?.walletId) {
      items = items.filter((tx) => tx.walletId === filters.walletId);
    }

    // Filter by types (multi-select)
    if (filters?.types && filters.types.length > 0) {
      items = items.filter((tx) => filters.types!.includes(tx.type as string));
    } else if (filters?.type) {
      items = items.filter((tx) => tx.type === filters.type);
    }

    // Filter by sources (multi-select)
    if (filters?.sources && filters.sources.length > 0) {
      items = items.filter((tx) => filters.sources!.includes(tx.source as string));
    } else if (filters?.source) {
      items = items.filter((tx) => tx.source === filters.source);
    }

    // Filter by statuses (multi-select)
    if (filters?.statuses && filters.statuses.length > 0) {
      items = items.filter((tx) => filters.statuses!.includes(tx.status as string));
    } else if (filters?.status) {
      items = items.filter((tx) => tx.status === filters.status);
    }

    return items;
  }, [mappedItems, filters]);

  // Paginate
  const page = filters?.page || 1;
  const itemsPerPage = filters?.itemsPerPage || 50;
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIdx = (page - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIdx, startIdx + itemsPerPage);

  const transformedData = {
    items: paginatedItems,
    totalItems,
    page,
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
