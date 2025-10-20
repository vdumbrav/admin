export type OrderType = 'card_creation' | 'card_topup';
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface CardOrder {
  id: number;
  userId: number;
  orderType: OrderType;
  status: OrderStatus;
  amount?: number;
  currency?: string;
  cardId?: string;
  cardNumber?: string;
  topupSource?: 'master_balance' | 'external_wallet';
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface OrdersFilter {
  status?: OrderStatus[];
  orderType?: OrderType[];
  userId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface OrdersPagination {
  page: number;
  pageSize: number;
  total: number;
}
