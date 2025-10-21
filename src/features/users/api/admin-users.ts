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
