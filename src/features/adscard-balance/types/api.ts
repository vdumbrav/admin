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
  data: {
    [key: number]: Omit<TrcTopupData, 'qr'>;
  };
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
