import { useQuery } from '@tanstack/react-query';

const MARKETS_API_URL = 'https://api-markets.moliedev.xyz/v1';

export interface Platform {
  id: number;
  type: string;
  chain_uid: string;
  symbol: string | null;
  address: string | null;
  decimals: number;
  coin: {
    uid: string;
    name: string;
    code: string;
    image: string | null;
  } | null;
}

export interface PlatformsResponse {
  platforms: Platform[];
  total: number;
}

export interface PlatformsFilters {
  limit?: number;
  offset?: number;
  search?: string;
  type?: string;
  chain_uid?: string;
}

export async function fetchPlatforms(filters: PlatformsFilters = {}): Promise<PlatformsResponse> {
  const params = new URLSearchParams();

  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.offset) params.append('offset', filters.offset.toString());
  if (filters.search) params.append('search', filters.search);
  if (filters.type && filters.type !== 'all') params.append('type', filters.type);
  if (filters.chain_uid && filters.chain_uid !== 'all') params.append('chain_uid', filters.chain_uid);

  const response = await fetch(`${MARKETS_API_URL}/platforms?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch platforms');
  }

  return response.json();
}

export function usePlatforms(filters: PlatformsFilters = {}) {
  return useQuery({
    queryKey: ['platforms', filters],
    queryFn: () => fetchPlatforms(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
