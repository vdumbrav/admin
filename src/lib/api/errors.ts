import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data as
      | {
          message?: string;
          error?: string;
          code?: string;
        }
      | string
      | undefined;

    // Extract error message from response
    let message = error.message;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (typeof data === 'object' && data?.message) {
      message = data.message;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    } else if (typeof data === 'object' && data?.error) {
      message = data.error;
    } else if (typeof data === 'string') {
      message = data;
    }

    return {
      message,
      status,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      code: typeof data === 'object' ? (data?.code ?? error.code) : error.code,
      details: data,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: 'An unknown error occurred',
    details: error,
  };
}
