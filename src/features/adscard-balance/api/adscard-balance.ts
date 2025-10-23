import { authenticatedMutator } from '@/lib/api/client/authenticatedMutator';
import type {
  TrcTopupResponse,
  TrcListResponse,
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
): Promise<TrcTopupResponse> {
  return authenticatedMutator<TrcTopupResponse>({
    url: `${ADSCARD_API_BASE}/trc_topup`,
    method: 'POST',
    data: { amount },
  });
}

/**
 * Get list of TRC topups with optional filters
 */
export async function getTrcTopups(
  filters?: {
    time?: string;
    status?: TrcTopupStatus;
    id?: number;
  },
): Promise<TrcListResponse> {
  return authenticatedMutator<TrcListResponse>({
    url: `${ADSCARD_API_BASE}/trc_list`,
    method: 'POST',
    data: filters || {},
  });
}

/**
 * Cancel a pending TRC topup
 */
export async function cancelTrcTopup(
  id: number,
): Promise<TrcCancelResponse> {
  return authenticatedMutator<TrcCancelResponse>({
    url: `${ADSCARD_API_BASE}/trc_cancel`,
    method: 'POST',
    data: { id },
  });
}

/**
 * Get balance information from ADScard
 */
export async function getBalanceInfo(): Promise<BalanceInfo> {
  // Call the correct balance endpoint
  const response = await authenticatedMutator<{ usd: string }>({
    url: '/adscard/users/balance',
    method: 'GET',
  });

  // Calculate derived values
  const balanceUsd = parseFloat(response.usd) || 0;
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
