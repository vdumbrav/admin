import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppAuth } from '@/auth/hooks';
import type { FraudFilters } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'https://api2.moliedev.xyz';

export const useFraudIncidents = (filters?: FraudFilters) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['fraud', 'incidents', filters],
    queryFn: async () => {
      const token = await auth.getAccessToken();
      const params = new URLSearchParams();

      if (filters?.status) params.append('status', filters.status);
      if (filters?.riskLevel) params.append('riskLevel', filters.riskLevel);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`${API_URL}/fraud/incidents?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch incidents');

      return await response.json();
    },
  });
};

export const useFraudStats = () => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['fraud', 'stats'],
    queryFn: async () => {
      const token = await auth.getAccessToken();
      const response = await fetch(`${API_URL}/fraud/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch stats');

      return await response.json();
    },
  });
};

export const useUpdateFraudIncident = () => {
  const queryClient = useQueryClient();
  const auth = useAppAuth();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { status?: string; investigation_notes?: string } }) => {
      const token = await auth.getAccessToken();
      const response = await fetch(`${API_URL}/fraud/incidents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update incident');

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fraud'] });
    },
  });
};
