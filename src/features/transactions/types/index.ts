export * from '@/lib/api/generated/model/transactionItemDto';
export * from '@/lib/api/generated/model/transactionsControllerListParams';
export * from '@/lib/api/generated/model/transactionItemDtoCurrency';
export * from '@/lib/api/generated/model/transactionItemDtoDirection';
export * from '@/lib/api/generated/model/transactionItemDtoType';
export * from '@/lib/api/generated/model/transactionItemDtoSource';
export * from '@/lib/api/generated/model/transactionItemDtoStatus';

export interface TransactionFilters {
  page?: number;
  itemsPerPage?: number;
  walletId?: number;
  cardId?: number;
  userId?: number;
  type?: string;
  source?: string;
  search?: string;
}
