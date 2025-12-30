import { useQuery } from '@tanstack/react-query';
import { useAppAuth } from '@/auth/hooks';

export interface AdminCardTransaction {
  id: number;
  userId: number;
  cardIds: string[];
  amount: number;
  currency: string;
  direction: string;
  group: string;
  status: string;
  merchant: string;
  category: string;
  createdAt: string;
  userEmail: string;
  userName: string;
}

/**
 * Hook to get card transactions for admin management
 * Uses admin/statistics/card-transactions endpoint
 */
export const useAdminCardTransactions = (cardId?: string) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'card-transactions', cardId],
    queryFn: async (): Promise<AdminCardTransaction[]> => {
      const token = await auth.getAccessToken();

      const url = cardId
        ? `${import.meta.env.VITE_API_URL}/admin/statistics/card-transactions?cardId=${cardId}`
        : `${import.meta.env.VITE_API_URL}/admin/statistics/card-transactions`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch card transactions');
      }

      const data = await response.json();

      return Array.isArray(data)
        ? data.map((tx: any) => ({
            id: tx.id,
            userId: tx.userId,
            cardIds: tx.cardIds || [],
            amount: tx.amount,
            currency: tx.currency,
            direction: tx.direction,
            group: tx.group,
            status: tx.status,
            merchant: tx.merchant,
            category: tx.category,
            createdAt: tx.createdAt,
            userEmail: tx.userEmail,
            userName: tx.userName,
          }))
        : [];
    },
  });
};
