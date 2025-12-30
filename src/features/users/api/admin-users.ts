import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  canAccessCameraQuest?: boolean;
  authIdentities?: { provider: string; authId: string; authName?: string }[];

  // Additional comprehensive data
  premiumStatus: PremiumStatus;
  xp: XpSummary;
  completedQuests: CompletedQuest[];
  cards: UserCard[];
  recentTransactions: Transaction[];
  referralStats: ReferralStats;
  activityStats: ActivityStats;
}

export interface UsersFilterParams {
  search?: string;
  roles?: string[];
  emailVerified?: boolean;
  premiumActive?: boolean;
  hasCards?: boolean;
}

export const useAdminUsers = (
  page: number = 1,
  limit: number = 50,
  filters?: UsersFilterParams
) => {
  const auth = useAppAuth();

  // Serialize filters for stable query key to prevent infinite loops
  const queryKey = ['admin', 'users', page, limit, JSON.stringify(filters || {})];

  return useQuery({
    queryKey,
    queryFn: async (): Promise<UserListResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters?.search) {
        params.append('search', filters.search);
      }

      if (filters?.roles && filters.roles.length > 0) {
        filters.roles.forEach(role => params.append('roles', role));
      }

      if (filters?.emailVerified !== undefined) {
        params.append('emailVerified', filters.emailVerified.toString());
      }

      if (filters?.premiumActive !== undefined) {
        params.append('premiumActive', filters.premiumActive.toString());
      }

      if (filters?.hasCards !== undefined) {
        params.append('hasCards', filters.hasCards.toString());
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

// Mutation for updating user role
export const useUpdateUserRole = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const token = await auth.getAccessToken();

      return orvalMutator({
        url: `/admin/users/${userId}/role`,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { role },
      });
    },
    onSuccess: (_data, variables) => {
      // Invalidate user details query to refetch
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.userId.toString(), 'details'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

// Mutation for freezing a card
export const useFreezeCard = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, cardId }: { userId: number; cardId: number }) => {
      const token = await auth.getAccessToken();

      return orvalMutator({
        url: `/admin/users/${userId}/cards/${cardId}/freeze`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.userId.toString(), 'details'] });
    },
  });
};

// Mutation for unfreezing a card
export const useUnfreezeCard = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, cardId }: { userId: number; cardId: number }) => {
      const token = await auth.getAccessToken();

      return orvalMutator({
        url: `/admin/users/${userId}/cards/${cardId}/unfreeze`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.userId.toString(), 'details'] });
    },
  });
};

// Mutation for blocking a card
export const useBlockCard = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, cardId }: { userId: number; cardId: number }) => {
      const token = await auth.getAccessToken();

      return orvalMutator({
        url: `/admin/users/${userId}/cards/${cardId}/block`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.userId.toString(), 'details'] });
    },
  });
};

// Mutation for adjusting user XP (add or remove)
export const useAdjustUserXP = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, amount, reason }: { userId: number; amount: number; reason: string }) => {
      const token = await auth.getAccessToken();

      return orvalMutator({
        url: `/admin/users/${userId}/xp`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { amount, reason },
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.userId.toString(), 'details'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

// Mutation for granting premium
export const useGrantPremium = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, bundleId, duration }: { userId: number; bundleId: number; duration: number }) => {
      const token = await auth.getAccessToken();

      return orvalMutator({
        url: `/admin/users/${userId}/premium/grant`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { bundleId, duration },
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.userId.toString(), 'details'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

// Mutation for revoking premium
export const useRevokePremium = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: number }) => {
      const token = await auth.getAccessToken();

      return orvalMutator({
        url: `/admin/users/${userId}/premium/revoke`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.userId.toString(), 'details'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

// Mutation for deleting user (GDPR)
export const useDeleteUser = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: number }) => {
      const token = await auth.getAccessToken();

      return orvalMutator({
        url: `/admin/users/${userId}`,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

// Mutation for updating Camera Quest access
export const useUpdateCameraQuestAccess = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, canAccess }: { userId: number; canAccess: boolean }) => {
      const token = await auth.getAccessToken();

      return orvalMutator({
        url: `/admin/users/${userId}/camera-quest-access`,
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { canAccess },
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.userId.toString(), 'details'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

// Mutation for blocking a user
export const useBlockUser = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: number }) => {
      const token = await auth.getAccessToken();

      return orvalMutator({
        url: `/admin/users/${userId}/block`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.userId.toString(), 'details'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

// Mutation for unblocking a user
export const useUnblockUser = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: number }) => {
      const token = await auth.getAccessToken();

      return orvalMutator({
        url: `/admin/users/${userId}/unblock`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.userId.toString(), 'details'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};
