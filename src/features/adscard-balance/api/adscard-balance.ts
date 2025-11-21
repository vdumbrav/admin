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
 * Routes to the appropriate endpoint based on network
 */
export async function createCryptoTopup(
  request: CryptoTopupRequest,
): Promise<TrcTopupResponse> {
  // Route to the correct endpoint based on network
  const endpoint = request.network === 'TRC20'
    ? `${ADSCARD_API_BASE}/trc_topup`
    : `${ADSCARD_API_BASE}/erc_topup`;

  return authenticatedMutator<TrcTopupResponse>({
    url: endpoint,
    method: 'POST',
    data: { amount: request.amount },
  });
}

/**
 * Get crypto topup list by ID (for status checking)
 */
export async function getCryptoTopupStatus(
  topupId: string,
  network: 'TRC20' | 'ERC20' = 'TRC20',
): Promise<TrcListResponse> {
  const endpoint = network === 'TRC20'
    ? `${ADSCARD_API_BASE}/trc_list`
    : `${ADSCARD_API_BASE}/erc_list`;

  return authenticatedMutator<TrcListResponse>({
    url: endpoint,
    method: 'POST',
    data: { id: parseInt(topupId, 10) },
  });
}

// =====================================================
// Admin Balance Settings API
// =====================================================

export interface BalanceSettingsData {
  id: number;
  minTopupAmount: number;
  maxTopupAmount: number;
  autoTopupEnabled: boolean;
  autoTopupThreshold: number;
  autoTopupAmount: number;
  adscardFeePercent: number;
  ourFeePercent: number;
  minCardTopup: number;
  defaultDailyLimit: number;
  defaultMonthlyLimit: number;
  maxSingleTransaction: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateBalanceSettingsRequest {
  minTopupAmount?: number;
  maxTopupAmount?: number;
  autoTopupEnabled?: boolean;
  autoTopupThreshold?: number;
  autoTopupAmount?: number;
  ourFeePercent?: number;
  minCardTopup?: number;
  defaultDailyLimit?: number;
  defaultMonthlyLimit?: number;
  maxSingleTransaction?: number;
}

export interface BalanceStatusData {
  currentBalance: number;
  autoTopupEnabled: boolean;
  autoTopupThreshold: number;
  autoTopupAmount: number;
  belowThreshold: boolean;
}

const ADMIN_SETTINGS_BASE = '/admin/balance-settings';

/**
 * Get balance settings
 */
export async function getBalanceSettings(): Promise<{ success: boolean; data: BalanceSettingsData }> {
  return authenticatedMutator<{ success: boolean; data: BalanceSettingsData }>({
    url: ADMIN_SETTINGS_BASE,
    method: 'GET',
  });
}

/**
 * Update balance settings
 */
export async function updateBalanceSettings(
  data: UpdateBalanceSettingsRequest,
): Promise<{ success: boolean; message: string; data: BalanceSettingsData }> {
  return authenticatedMutator<{ success: boolean; message: string; data: BalanceSettingsData }>({
    url: ADMIN_SETTINGS_BASE,
    method: 'PUT',
    data,
  });
}

/**
 * Get current balance status with auto-topup info
 */
export async function getBalanceStatus(): Promise<{ success: boolean; data: BalanceStatusData }> {
  return authenticatedMutator<{ success: boolean; data: BalanceStatusData }>({
    url: `${ADMIN_SETTINGS_BASE}/balance`,
    method: 'GET',
  });
}

/**
 * Manually trigger auto-topup check
 */
export async function triggerAutoTopup(): Promise<{
  success: boolean;
  data: {
    triggered: boolean;
    currentBalance: number;
    threshold: number;
    message: string;
  };
}> {
  return authenticatedMutator({
    url: `${ADMIN_SETTINGS_BASE}/trigger-auto-topup`,
    method: 'POST',
  });
}
