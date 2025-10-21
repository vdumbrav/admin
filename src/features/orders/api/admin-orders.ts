import { useAdminStatisticsControllerGetRecentOrders } from '@/lib/api/generated/admin-statistics/admin-statistics';
import type { CardOrder } from '../types';

/**
 * Hook to get orders for admin management
 * Currently uses the recent-orders endpoint which returns the latest 10 orders
 * TODO: Replace with dedicated admin orders endpoint with pagination when available
 */
export const useAdminOrders = () => {
  const { data, isLoading, error } = useAdminStatisticsControllerGetRecentOrders();

  // Transform the API response to match CardOrder type
  const orders: CardOrder[] = Array.isArray(data)
    ? (data as any[]).map((order) => ({
        id: order.id,
        userId: order.user?.id,
        orderType: order.paymentType === 'purchase' ? 'card_creation' : 'card_topup',
        status: order.status,
        amount: order.amount,
        currency: order.currency,
        cardId: order.cardIds?.[0] || undefined,
        cardNumber: undefined, // Not included in API response
        createdAt: order.createdAt,
        updatedAt: order.createdAt,
        reference: order.reference,
        userEmail: order.user?.email,
        userName: order.user?.nickname,
      }))
    : [];

  return {
    data: orders,
    isLoading,
    error,
    total: orders.length,
  };
};
