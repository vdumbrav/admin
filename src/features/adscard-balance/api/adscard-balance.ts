import { authenticatedMutator } from '@/lib/api/client/authenticatedMutator';
import type {
  TrcTopupRequest,
  TrcTopupResponse,
  TrcListRequest,
  TrcListResponse,
  TrcCancelRequest,
  TrcCancelResponse,
  BalanceInfo,
} from '../types/api';

const ADSCARD_API_BASE = '/adscard/balance';

/**
 * Create a new TRC topup request
 */
export async function createTrcTopup(
  amount: number,
  authToken: string,
): Promise<TrcTopupResponse> {
  const request: TrcTopupRequest = {
    auth_token: authToken,
    amount,
  };

  return authenticatedMutator<TrcTopupResponse>({
    url: `${ADSCARD_API_BASE}/trc_topup`,
    method: 'POST',
    data: request,
  });
}

/**
 * Get list of TRC topups with optional filters
 */
export async function getTrcTopups(
  authToken: string,
  filters?: {
    time?: string;
    status?: string;
    id?: number;
  },
): Promise<TrcListResponse> {
  const request: TrcListRequest = {
    auth_token: authToken,
    ...filters,
  };

  return authenticatedMutator<TrcListResponse>({
    url: `${ADSCARD_API_BASE}/trc_list`,
    method: 'POST',
    data: request,
  });
}

/**
 * Cancel a pending TRC topup
 */
export async function cancelTrcTopup(
  id: number,
  authToken: string,
): Promise<TrcCancelResponse> {
  const request: TrcCancelRequest = {
    auth_token: authToken,
    id,
  };

  return authenticatedMutator<TrcCancelResponse>({
    url: `${ADSCARD_API_BASE}/trc_cancel`,
    method: 'POST',
    data: request,
  });
}

/**
 * Get balance information from ADScard
 */
export async function getBalanceInfo(
  authToken: string,
): Promise<BalanceInfo> {
  // This would call the actual balance endpoint
  // For now, returning mock data structure
  const response = await authenticatedMutator<{ balance: number }>({
    url: '/adscard/balance/info',
    method: 'POST',
    data: { auth_token: authToken },
  });

  // Calculate derived values
  // TODO: Get pending topups and calculate available balance
  return {
    currentBalance: response.balance || 0,
    pendingTopups: 0,
    availableForCards: response.balance || 0,
  };
}
