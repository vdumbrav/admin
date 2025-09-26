import React from 'react';
import { type AxiosRequestConfig } from 'axios';
import { useAppAuth } from '@/auth/hooks';
import { setAuthenticatedMutator } from './authenticatedMutator';
import { orvalMutator } from './orvalMutator';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { getAccessToken } = useAppAuth();

  React.useEffect(() => {
    // Set the global authenticated mutator
    const authenticatedMutator = async function <TResponse>(
      config: AxiosRequestConfig,
    ): Promise<TResponse> {
      // Get token using our smart logic
      const token = await getAccessToken();

      // Add auth header if token is available
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      } else {
        // Throw error to prevent request without token
        throw new Error('No valid token available');
      }

      return orvalMutator<TResponse>(config);
    };

    setAuthenticatedMutator(authenticatedMutator);
  }, [getAccessToken]);

  return <>{children}</>;
}
