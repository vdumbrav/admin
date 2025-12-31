import { useQuery } from '@tanstack/react-query';
import { orvalMutator } from '@/lib/api/client/orvalMutator';
import { useAppAuth } from '@/auth/hooks';

// Types
export interface BundleResource {
  bestChoose?: boolean;
  [key: string]: unknown;
}

export interface Bundle {
  id: number;
  level: number;
  title: string;
  price: number;
  price_twa: number;
  boost: number;
  referrals: number;
  referrals_earn: number;
  resource?: BundleResource;
}

// Hooks
export const useBundles = () => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'bundles'],
    queryFn: async (): Promise<Bundle[]> => {
      const token = await auth.getAccessToken();
      const response = await orvalMutator<{ success: boolean; bundles: Bundle[] }>({
        url: '/admin/bundles',
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.bundles || [];
    },
  });
};
