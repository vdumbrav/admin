// Crypto Topup Types (TRC20/ERC20)
export type CryptoTopupStatus = 'pending' | 'success' | 'cancelled' | 'failed';

export interface CryptoTopupData {
  id: number;
  status: CryptoTopupStatus;
  amount: number;
  wallet: string;
  created_at: string;
  qr?: string;
}

export interface CryptoTopupApiResponse {
  data: CryptoTopupData;
  request_id: string;
}

// Crypto Topup List Types
export interface CryptoTopupListResponse {
  data: Omit<CryptoTopupData, 'qr'>[];
  request_id: string;
}

// Crypto Topup Cancel Types
export interface CryptoTopupCancelResponse {
  data: CryptoTopupData;
  request_id: string;
}

// Legacy type aliases for backward compatibility
export type TrcTopupStatus = CryptoTopupStatus;
export type TrcTopupData = CryptoTopupData;
export type TrcTopupResponse = CryptoTopupApiResponse;
export type TrcListResponse = CryptoTopupListResponse;
export type TrcCancelResponse = CryptoTopupCancelResponse;

// Balance Info Types
export interface BalanceInfo {
  currentBalance: number;
  pendingTopups: number;
  availableForCards: number;
}

// NOWPayments Integration Types
export type CryptoNetwork = 'TRC20' | 'ERC20';
export type CryptoCurrency = 'USDT';

export interface NOWPaymentsTopupRequest {
  amount: number; // USD amount
  currency: CryptoCurrency;
  network: CryptoNetwork;
}

export interface NOWPaymentsTopupResponse {
  paymentId: string;
  paymentUrl: string;
  payAddress: string;
  payAmount: number;
  payCurrency: string;
  priceAmount: number;
  priceCurrency: string;
  orderDescription: string;
  orderId: string;
  paymentStatus: 'waiting' | 'confirming' | 'confirmed' | 'sending' | 'partially_paid' | 'finished' | 'failed' | 'refunded' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface NOWPaymentsStatusResponse {
  paymentId: string;
  paymentStatus: string;
  payAddress: string;
  payCurrency: string;
  priceAmount: number;
  priceCurrency: string;
  actuallyPaid: number;
  purchaseId: string;
  orderId: string;
  orderDescription: string;
  outcomeAmount: number;
  outcomeCurrency: string;
}

// Legacy type aliases
export type CryptoTopupRequest = NOWPaymentsTopupRequest;
export type CryptoTopupResponse = NOWPaymentsTopupResponse;
export type CryptoTopupStatusResponse = NOWPaymentsStatusResponse;
