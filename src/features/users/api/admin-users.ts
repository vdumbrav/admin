import { useQuery } from '@tanstack/react-query';
import { customInstance } from '@/lib/api/client/orvalMutator';
import type { User } from '../types';

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const useAdminUsers = (page: number = 1, limit: number = 50, search?: string) => {
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

      const response = await customInstance<UserListResponse>({
        url: `/admin/users?${params.toString()}`,
        method: 'GET',
      });

      return response.data;
    },
  });
};
