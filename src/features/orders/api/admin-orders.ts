import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orvalMutator } from '@/lib/api/client/orvalMutator';
import { useAppAuth } from '@/auth/hooks';
import { toast } from 'sonner';
import type { CardOrder } from '../types';

interface OrdersFilterParams {
  page?: number;
  limit?: number;
  status?: string[];
  type?: string[];
  search?: string;
}

interface OrdersResponse {
  orders: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Hook to get all orders with pagination and filters
 */
export const useAdminOrders = (filters: OrdersFilterParams = {}) => {
  const { getAccessToken } = useAppAuth();
  const { page = 1, limit = 50, status, type, search } = filters;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'orders', 'all', { page, limit, status, type, search }],
    queryFn: async () => {
      const token = await getAccessToken();
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (status && status.length > 0) {
        params.set('status', status.join(','));
      }
      if (type && type.length > 0) {
        params.set('type', type.join(','));
      }
      if (search) {
        params.set('search', search);
      }

      const response = await orvalMutator<OrdersResponse>({
        url: `/admin/statistics/all-orders?${params.toString()}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    },
    staleTime: 30000,
  });

  // Transform the API response to match CardOrder type
  const orders: CardOrder[] = data?.orders
    ? data.orders.map((order) => {
        // Map backend payment_type to frontend orderType
        const orderType = order.paymentType === 'purchase'
          ? 'card_creation'
          : 'card_topup';

        return {
          id: order.id,
          userId: order.user?.id,
          orderType,
          status: order.status,
          amount: order.amount,
          currency: order.currency || 'USD',
          cardId: order.cardIds?.[0] || undefined,
          cardNumber: undefined,
          createdAt: order.createdAt,
          updatedAt: order.createdAt,
          reference: order.reference,
          userEmail: order.user?.email || 'No email',
          userName: order.user?.name || 'Anonymous',
        };
      })
    : [];

  return {
    data: orders,
    isLoading,
    error,
    refetch,
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 1,
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
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      toast.success(data.message || 'Order cancelled successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to cancel order';
      toast.error(errorMessage);
    },
  });
};
