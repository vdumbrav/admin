import { authenticatedMutator } from '@/lib/api/client/authenticatedMutator';
import type {
  TrcTopupRequest,
  TrcTopupResponse,
  TrcListRequest,
  TrcListResponse,
  TrcCancelRequest,
  TrcCancelResponse,
  TrcTopupStatus,
  BalanceInfo,
  CryptoTopupRequest,
  CryptoTopupResponse,
  CryptoTopupStatusResponse,
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
    status?: TrcTopupStatus;
    id?: number;
  },
): Promise<TrcListResponse> {
  const request: TrcListRequest = {
    auth_token: authToken,
    ...filters,
  };

  return authenticatedMutator<TrcListResponse>({
    url: '/users/erc_topup',
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
  // Call the correct balance endpoint
  const response = await authenticatedMutator<{ data: { usd: number; eur: number } }>({
    url: '/users/balance',
    method: 'POST',
    data: { auth_token: authToken },
  });

  // Calculate derived values
  // TODO: Get pending topups and calculate available balance
  const balanceUsd = response.data?.usd || 0;
  return {
    currentBalance: balanceUsd,
    pendingTopups: 0,
    availableForCards: balanceUsd,
  };
}

/**
 * Create a new crypto topup (USDT TRC20/ERC20)
 */
export async function createCryptoTopup(
  request: CryptoTopupRequest,
): Promise<CryptoTopupResponse> {
  return authenticatedMutator<CryptoTopupResponse>({
    url: '/adscard/balance/crypto_topup',
    method: 'POST',
    data: request,
  });
}

/**
 * Get crypto topup payment status
 */
export async function getCryptoTopupStatus(
  paymentId: string,
): Promise<CryptoTopupStatusResponse> {
  return authenticatedMutator<CryptoTopupStatusResponse>({
    url: `/adscard/balance/crypto_topup/${paymentId}`,
    method: 'GET',
  });
}
