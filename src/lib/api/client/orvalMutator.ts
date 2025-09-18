import axios, { type AxiosInstance, type AxiosRequestConfig, AxiosResponse } from "axios";
import { useAuth } from "react-oidc-context";

export type OrvalClient = AxiosInstance;

export interface OrvalRequestOptions {
  client?: OrvalClient;
}

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const rawApiUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (!rawApiUrl) {
    throw new Error("VITE_API_URL is not defined");
  }

  return axios.create({
    baseURL: rawApiUrl,
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
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
        if (key.toLowerCase() === "content-type") {
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
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
}

// Hook version for components that need authentication
export function useOrvalMutator() {
  const auth = useAuth();

  return async function authenticatedOrvalMutator<TResponse>(
    config: AxiosRequestConfig,
    options: OrvalRequestOptions = {},
  ): Promise<TResponse> {
    // Add authorization header if user is authenticated
    if (auth.user?.access_token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${auth.user.access_token}`,
      };
    }

    return orvalMutator<TResponse>(config, options);
  };
}