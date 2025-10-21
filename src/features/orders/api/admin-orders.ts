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
    ? (data as any[]).map((order) => {
        // Map backend payment_type to frontend orderType
        const orderType = order.paymentType === 'purchase'
          ? 'card_creation'
          : 'card_topup';

        // Map backend status to frontend status
        let status = order.status;
        if (status === 'confirmed') status = 'processing';

        return {
          id: order.id,
          userId: order.user?.id,
          orderType,
          status,
          amount: parseFloat(order.amount || 0),
          currency: order.currency || 'USD',
          cardId: order.cardIds?.[0] || undefined,
          cardNumber: undefined, // Not included in API response
          createdAt: order.createdAt,
          updatedAt: order.createdAt,
          reference: order.reference,
          userEmail: order.user?.email || 'No email',
          userName: order.user?.nickname || 'Anonymous',
        };
      })
    : [];

  return {
    data: orders,
    isLoading,
    error,
    total: orders.length,
  };
};
