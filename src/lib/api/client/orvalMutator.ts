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
    : (import.meta.env.VITE_API_URL as string | undefined); // Use direct URL in production

  if (!baseURL) {
    throw new Error('API URL is not defined');
  }

  const client = axios.create({
    baseURL,
    timeout: 30000,
    // Don't set default Content-Type - let axios handle it automatically
    // For JSON: axios will set application/json
    // For FormData: axios will set multipart/form-data with boundary
  });

  // Add response interceptor to handle 401 errors gracefully
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.warn('[API Client] 401 Unauthorized - token may be expired');
        // Don't automatically logout, just log the warning
      }
      return Promise.reject(error);
    },
  );

  return client;
};

export async function orvalMutator<TResponse>(
  config: AxiosRequestConfig,
  options: OrvalRequestOptions = {},
): Promise<TResponse> {
  const client = options.client ?? createApiClient();

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data, headers, ...restConfig } = config as AxiosRequestConfig & {
      data?: unknown;
      headers?: Record<string, string>;
    };

    const resolvedHeaders = { ...(headers ?? {}) };

    // Handle content type based on data type
    if (data instanceof FormData) {
      // Remove any Content-Type headers to let axios set multipart/form-data with boundary
      const headerKeys = Object.keys(resolvedHeaders);
      headerKeys.forEach((key) => {
        if (key.toLowerCase() === 'content-type') {
          delete resolvedHeaders[key];
        }
      });
    } else if (data && typeof data === 'object') {
      // For JSON data, ensure Content-Type is set
      resolvedHeaders['Content-Type'] = 'application/json';
    }

    const requestConfig: AxiosRequestConfig = {
      ...restConfig,
      data: data as unknown, // TODO: P3 - Improve typing for Axios data parameter (Orval limitation)
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
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const message = (error.response?.data as { message?: string })?.message ?? error.message;
      throw new Error(message);
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
