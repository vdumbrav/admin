import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { useAppAuth } from '@/auth/hooks';

export type OrvalClient = AxiosInstance;

export interface OrvalRequestOptions {
  client?: OrvalClient;
}

// Create axios instance
const createApiClient = (): AxiosInstance => {
  // In development, use the proxy path to avoid CORS issues
  // In production, use the full API URL
  const isDevelopment = import.meta.env.DEV;
  const baseURL = isDevelopment
    ? '/' // Use Vite proxy in development (proxy handles /api prefix)
    : import.meta.env.VITE_API_URL; // Use direct URL in production

  if (!baseURL) {
    throw new Error('API URL is not defined');
  }

  return axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export async function orvalMutator<TResponse>(
  config: AxiosRequestConfig,
  options: OrvalRequestOptions = {},
): Promise<TResponse> {
  const client = options.client ?? createApiClient();

  try {
    const { data, headers, ...restConfig } = config;

    const resolvedHeaders = { ...(headers ?? {}) };

    // Handle FormData content type
    if (data instanceof FormData) {
      const headerKeys = Object.keys(resolvedHeaders);
      headerKeys.forEach((key) => {
        if (key.toLowerCase() === 'content-type') {
          delete resolvedHeaders[key];
        }
      });
    }

    const requestConfig: AxiosRequestConfig = {
      ...restConfig,
      data,
      headers: resolvedHeaders,
      signal: config.signal,
    };

    const response: AxiosResponse<TResponse> = await client.request<TResponse>(requestConfig);

    if (response.status === 204) {
      return undefined as TResponse;
    }

    return response.data;
  } catch (error) {
    // Simple error handling
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message ?? error.message);
    }
    throw error;
  }
}

// Hook version for components that need authentication
export function useOrvalMutator() {
  const auth = useAppAuth();

  return async function authenticatedOrvalMutator<TResponse>(
    config: AxiosRequestConfig,
    options: OrvalRequestOptions = {},
  ): Promise<TResponse> {
    // Add authorization header if user is authenticated
    const token = await auth.getAccessToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    return orvalMutator<TResponse>(config, options);
  };
}
