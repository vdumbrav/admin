// TRC Topup Types
export type TrcTopupStatus = 'pending' | 'success' | 'cancelled' | 'failed';

export interface TrcTopupRequest {
  auth_token: string;
  amount: number;
}

export interface TrcTopupData {
  id: number;
  status: TrcTopupStatus;
  amount: number;
  wallet: string;
  created_at: string;
  qr?: string;
}

export interface TrcTopupResponse {
  data: TrcTopupData;
  request_id: string;
}

// TRC List Types
export interface TrcListRequest {
  auth_token: string;
  time?: string;
  status?: TrcTopupStatus;
  id?: number;
}

export interface TrcListResponse {
  data: Omit<TrcTopupData, 'qr'>[];
  request_id: string;
}

// TRC Cancel Types
export interface TrcCancelRequest {
  auth_token: string;
  id: number;
}

export interface TrcCancelResponse {
  data: TrcTopupData;
  request_id: string;
}

// Balance Info Types
export interface BalanceInfo {
  currentBalance: number;
  pendingTopups: number;
  availableForCards: number;
}

// NOWPayments Topup Types
export type CryptoNetwork = 'TRC20' | 'ERC20';
export type CryptoCurrency = 'USDT';

export interface CryptoTopupRequest {
  amount: number; // USD amount
  currency: CryptoCurrency;
  network: CryptoNetwork;
}

export interface CryptoTopupResponse {
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

export interface CryptoTopupStatusResponse {
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
