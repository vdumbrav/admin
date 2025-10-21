import { useQuery } from '@tanstack/react-query';
import { orvalMutator } from '@/lib/api/client/orvalMutator';
import { useAppAuth } from '@/auth/hooks';
import type { User } from '../types';

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PremiumBundle {
  id: number;
  title: string;
  level: number;
  boost: number;
  price: number;
}

export interface PremiumStatus {
  isActive: boolean;
  bundle?: PremiumBundle;
  activeFrom?: string;
  activeTo?: string;
}

export interface XpHistoryItem {
  id: number;
  type: string;
  reward: number;
  boost: number;
  taskId: number;
  createdAt: string;
}

export interface XpSummary {
  totalXp: number;
  history: XpHistoryItem[];
  byType: Record<string, number>;
}

export interface CompletedQuest {
  id: number;
  taskId: number;
  taskTitle: string;
  status: string;
  completedAt?: string;
  reward?: number;
}

export interface UserCard {
  id: number;
  cardMasked: string;
  status: string;
  balance: number;
  currency: string;
  cardName?: string;
  createdAt: string;
}

export interface Transaction {
  id: number;
  type: string;
  amount: number;
  currency: string;
  status: string;
  merchant?: string;
  category?: string;
  createdAt: string;
}

export interface Referral {
  id: number;
  email?: string;
  nickname?: string;
  createdAt: string;
}

export interface ReferralStats {
  totalReferrals: number;
  referredBy?: {
    id: number;
    email?: string;
    nickname?: string;
  };
  referrals: Referral[];
  totalEarnings: number;
}

export interface ActivityStats {
  daysOnPlatform: number;
  lastLogin?: string;
  totalTransactions: number;
  totalCards: number;
  completedQuests: number;
}

export interface UserDetails {
  // Basic info
  id: number;
  uid: string;
  email?: string;
  nickname?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  avatarUri?: string;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  matrixId?: string;
  cardEmail?: string;

  // Additional comprehensive data
  premiumStatus: PremiumStatus;
  xp: XpSummary;
  completedQuests: CompletedQuest[];
  cards: UserCard[];
  recentTransactions: Transaction[];
  referralStats: ReferralStats;
  activityStats: ActivityStats;
}

export const useAdminUsers = (page: number = 1, limit: number = 50, search?: string) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'users', page, limit, search],
    queryFn: async (): Promise<UserListResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) {
        params.append('search', search);
      }

      const token = await auth.getAccessToken();

      return orvalMutator<UserListResponse>({
        url: `/admin/users?${params.toString()}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });
};

export const useAdminUserDetails = (userId: string) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'users', userId, 'details'],
    queryFn: async (): Promise<UserDetails> => {
      const token = await auth.getAccessToken();

      return orvalMutator<UserDetails>({
        url: `/admin/users/${userId}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    enabled: !!userId,
  });
};
