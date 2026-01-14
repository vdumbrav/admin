import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orvalMutator } from '@/lib/api/client/orvalMutator';
import { useAppAuth } from '@/auth/hooks';
import type {
  WalletStatistics,
  ExtendedWalletStatistics,
  PaginatedWalletsResponse,
  PaginatedGlobalTransactions,
  TransactionFilterParams,
  WalletDetails,
  WalletBalanceResponse,
  WalletTransactionsResponse,
  WalletDepositsResponse,
  WalletWithdrawalsResponse,
  UserWalletInfo,
  DepositAddressesResponse,
  WalletFilterParams,
  AdminTransferRequest,
  AdminWithdrawRequest,
  WalletOperationResponse,
} from '../types';

// ==================== Statistics ====================

export const useWalletStatistics = () => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'wallet', 'statistics'],
    queryFn: async (): Promise<WalletStatistics> => {
      const token = await auth.getAccessToken();

      const response = await orvalMutator<{ success: boolean; data: WalletStatistics }>({
        url: '/admin/wallet/statistics',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
  });
};

// ==================== Wallet List ====================

export const useWalletList = (
  page: number = 1,
  limit: number = 20,
  filters?: WalletFilterParams
) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'wallet', 'list', page, limit, JSON.stringify(filters || {})],
    queryFn: async (): Promise<PaginatedWalletsResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters?.search) {
        params.append('search', filters.search);
      }
      if (filters?.sortBy) {
        params.append('sortBy', filters.sortBy);
      }
      if (filters?.sortOrder) {
        params.append('sortOrder', filters.sortOrder);
      }

      const token = await auth.getAccessToken();

      const response = await orvalMutator<{ success: boolean; data: PaginatedWalletsResponse }>({
        url: `/admin/wallet/list?${params.toString()}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
  });
};

// ==================== Wallet Details by PartnerId ====================

export const useWalletDetails = (partnerId: string) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'wallet', 'details', partnerId],
    queryFn: async (): Promise<WalletDetails> => {
      const token = await auth.getAccessToken();

      const response = await orvalMutator<{ success: boolean; data: WalletDetails }>({
        url: `/admin/wallet/${partnerId}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
    enabled: !!partnerId,
  });
};

// ==================== Wallet Balance by PartnerId ====================

export const useWalletBalance = (partnerId: string) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'wallet', 'balance', partnerId],
    queryFn: async (): Promise<WalletBalanceResponse> => {
      const token = await auth.getAccessToken();

      const response = await orvalMutator<{ success: boolean; data: WalletBalanceResponse }>({
        url: `/admin/wallet/${partnerId}/balance`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
    enabled: !!partnerId,
  });
};

// ==================== Wallet Transactions by PartnerId ====================

export const useWalletTransactions = (partnerId: string, limit: number = 50) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'wallet', 'transactions', partnerId, limit],
    queryFn: async (): Promise<WalletTransactionsResponse> => {
      const token = await auth.getAccessToken();

      const response = await orvalMutator<{ success: boolean; data: WalletTransactionsResponse }>({
        url: `/admin/wallet/${partnerId}/transactions?limit=${limit}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
    enabled: !!partnerId,
  });
};

// ==================== Wallet Deposits by PartnerId ====================

export const useWalletDeposits = (partnerId: string, limit: number = 50) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'wallet', 'deposits', partnerId, limit],
    queryFn: async (): Promise<WalletDepositsResponse> => {
      const token = await auth.getAccessToken();

      const response = await orvalMutator<{ success: boolean; data: WalletDepositsResponse }>({
        url: `/admin/wallet/${partnerId}/deposits?limit=${limit}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
    enabled: !!partnerId,
  });
};

// ==================== Wallet Withdrawals by PartnerId ====================

export const useWalletWithdrawals = (partnerId: string, limit: number = 50) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'wallet', 'withdrawals', partnerId, limit],
    queryFn: async (): Promise<WalletWithdrawalsResponse> => {
      const token = await auth.getAccessToken();

      const response = await orvalMutator<{ success: boolean; data: WalletWithdrawalsResponse }>({
        url: `/admin/wallet/${partnerId}/withdrawals?limit=${limit}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
    enabled: !!partnerId,
  });
};

// ==================== User Wallet Operations ====================

export const useUserWallet = (userId: number) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'users', userId, 'wallet'],
    queryFn: async (): Promise<UserWalletInfo> => {
      const token = await auth.getAccessToken();

      const response = await orvalMutator<{ success: boolean; data: UserWalletInfo }>({
        url: `/admin/users/${userId}/wallet`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
    enabled: !!userId,
  });
};

export const useUserWalletBalance = (userId: number) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'users', userId, 'wallet', 'balance'],
    queryFn: async (): Promise<WalletBalanceResponse> => {
      const token = await auth.getAccessToken();

      const response = await orvalMutator<{ success: boolean; data: WalletBalanceResponse }>({
        url: `/admin/users/${userId}/wallet/balance`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
    enabled: !!userId,
  });
};

export const useUserWalletTransactions = (userId: number, limit: number = 50) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'users', userId, 'wallet', 'transactions', limit],
    queryFn: async (): Promise<WalletTransactionsResponse> => {
      const token = await auth.getAccessToken();

      const response = await orvalMutator<{ success: boolean; data: WalletTransactionsResponse }>({
        url: `/admin/users/${userId}/wallet/transactions?limit=${limit}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
    enabled: !!userId,
  });
};

export const useUserWalletDeposits = (userId: number, limit: number = 50) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'users', userId, 'wallet', 'deposits', limit],
    queryFn: async (): Promise<WalletDepositsResponse> => {
      const token = await auth.getAccessToken();

      const response = await orvalMutator<{ success: boolean; data: WalletDepositsResponse }>({
        url: `/admin/users/${userId}/wallet/deposits?limit=${limit}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
    enabled: !!userId,
  });
};

export const useUserWalletWithdrawals = (userId: number, limit: number = 50) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'users', userId, 'wallet', 'withdrawals', limit],
    queryFn: async (): Promise<WalletWithdrawalsResponse> => {
      const token = await auth.getAccessToken();

      const response = await orvalMutator<{ success: boolean; data: WalletWithdrawalsResponse }>({
        url: `/admin/users/${userId}/wallet/withdrawals?limit=${limit}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
    enabled: !!userId,
  });
};

export const useUserDepositAddresses = (userId: number) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'users', userId, 'wallet', 'deposit-addresses'],
    queryFn: async (): Promise<DepositAddressesResponse> => {
      const token = await auth.getAccessToken();

      const response = await orvalMutator<{ success: boolean; data: DepositAddressesResponse }>({
        url: `/admin/users/${userId}/wallet/deposit-addresses`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
    enabled: !!userId,
  });
};

// ==================== Admin Actions ====================

export const useAdminTransfer = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, ...data }: AdminTransferRequest & { userId: number }) => {
      const token = await auth.getAccessToken();

      return orvalMutator<WalletOperationResponse>({
        url: `/admin/users/${userId}/wallet/transfer`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.userId, 'wallet'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'wallet'] });
    },
  });
};

export const useAdminWithdraw = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, ...data }: AdminWithdrawRequest & { userId: number }) => {
      const token = await auth.getAccessToken();

      return orvalMutator<WalletOperationResponse>({
        url: `/admin/wallet/user/${userId}/withdraw`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data,
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.userId, 'wallet'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'wallet'] });
    },
  });
};

// ==================== Extended Statistics ====================

export const useExtendedWalletStatistics = () => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'wallet', 'extended-statistics'],
    queryFn: async (): Promise<ExtendedWalletStatistics> => {
      const token = await auth.getAccessToken();

      const response = await orvalMutator<{ success: boolean; data: ExtendedWalletStatistics }>({
        url: '/admin/wallet/extended-statistics',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
  });
};

// ==================== Global Transactions ====================

export const useGlobalTransactions = (
  page: number = 1,
  limit: number = 50,
  filters?: TransactionFilterParams
) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'wallet', 'transactions', page, limit, JSON.stringify(filters || {})],
    queryFn: async (): Promise<PaginatedGlobalTransactions> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters?.direction) {
        params.append('direction', filters.direction);
      }
      // Support multi-select groups (comma-separated)
      if (filters?.groups && filters.groups.length > 0) {
        params.append('group', filters.groups.join(','));
      } else if (filters?.group) {
        params.append('group', filters.group);
      }
      // Support multi-select currencies (comma-separated)
      if (filters?.currencies && filters.currencies.length > 0) {
        params.append('currency', filters.currencies.join(','));
      } else if (filters?.currency) {
        params.append('currency', filters.currency);
      }
      // Support multi-select statuses (comma-separated)
      if (filters?.statuses && filters.statuses.length > 0) {
        params.append('status', filters.statuses.join(','));
      } else if (filters?.status) {
        params.append('status', filters.status);
      }
      // Search by txHash, from/to address
      if (filters?.search) {
        params.append('search', filters.search);
      }

      const token = await auth.getAccessToken();

      const response = await orvalMutator<{ success: boolean; data: PaginatedGlobalTransactions }>({
        url: `/admin/wallet/transactions?${params.toString()}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    },
  });
};
