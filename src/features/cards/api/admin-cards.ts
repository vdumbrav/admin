import { useQuery } from '@tanstack/react-query';
import { useAppAuth } from '@/auth/hooks';

export interface AdminCard {
  id: string;
  userId: number;
  cardNumber: string;
  cardholderName?: string;
  balance: number;
  currency: string;
  status: 'active' | 'frozen' | 'blocked';
  bin?: string;
  createdAt: string;
  lastUsed?: string | null;
  userEmail?: string;
  userName?: string;
}

export interface AdminCardsListResponse {
  cards: AdminCard[];
  total: number;
}

/**
 * Hook to get all cards for admin management
 * Uses admin/statistics/all-cards endpoint
 */
export const useAdminCards = () => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'cards', 'list'],
    queryFn: async (): Promise<AdminCardsListResponse> => {
      const token = await auth.getAccessToken();

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/statistics/all-cards`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }

      const data = await response.json();

      // Transform the response to match our AdminCard interface
      const cards: AdminCard[] = Array.isArray(data)
        ? data.map((card: any) => ({
            id: card.id,
            userId: card.userId,
            cardNumber: card.cardNumber,
            cardholderName: card.cardholderName,
            balance: card.balance,
            currency: card.currency,
            status: card.status,
            createdAt: card.createdAt,
            userEmail: card.userEmail,
            userName: card.userName,
          }))
        : [];

      return {
        cards,
        total: cards.length,
      };
    },
  });
};
