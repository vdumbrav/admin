import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminStatisticsControllerGetRecentOrders } from '@/lib/api/generated/admin-statistics/admin-statistics';
import { orvalMutator } from '@/lib/api/client/orvalMutator';
import { useAppAuth } from '@/auth/hooks';
import { toast } from 'sonner';
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
          userName: order.user?.name || order.user?.nickname || order.user?.email || 'Anonymous',
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

/**
 * Hook to cancel an order (admin only)
 */
export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  const { getAccessToken } = useAppAuth();

  return useMutation({
    mutationFn: async (orderId: number) => {
      const token = await getAccessToken();
      const response = await orvalMutator<{
        success: boolean;
        message: string;
        orderId: number;
      }>({
        url: `/admin/statistics/cancel-order/${orderId}`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'statistics', 'recent-orders'] });
      toast.success(data.message || 'Order cancelled successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to cancel order';
      toast.error(errorMessage);
    },
  });
};
