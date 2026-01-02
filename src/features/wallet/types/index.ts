// Wallet Statistics
export interface WalletStatistics {
  totalWallets: number;
  activeWallets: number;
  totalDepositAddresses: number;
  createdToday: number;
  createdThisWeek: number;
  createdThisMonth: number;
}

// Wallet List Item
export interface WalletListItem {
  id: number;
  partnerId: string;
  partnerName: string;
  isActive: boolean;
  createdAt: string;
  user: {
    id: number;
    nickname?: string;
    email?: string;
  };
}

// Paginated Wallets Response
export interface PaginatedWalletsResponse {
  items: WalletListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Wallet Details
export interface WalletDetails {
  id: number;
  partnerId: string;
  partnerName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    nickname?: string;
    email?: string;
  };
  depositAddressCount: number;
}

// Balance Item
export interface BalanceItem {
  currency: string;
  available: string;
  pending?: string;
  total?: string;
}

// Balance Response
export interface WalletBalanceResponse {
  balances: BalanceItem[];
  updatedAt?: string;
}

// Transaction
export interface WalletTransaction {
  id: string;
  currency: string;
  amount: string;
  direction: 'Income' | 'Outgo';
  group: 'Deposit' | 'Withdraw' | 'Send' | 'Receive';
  status: string;
  txHash?: string;
  createdAt: string;
}

// Transactions Response
export interface WalletTransactionsResponse {
  partnerId?: string;
  userId?: number;
  transactions: WalletTransaction[];
  total: number;
}

// Deposit
export interface WalletDeposit {
  id: string;
  currency: string;
  amount: string;
  status: string;
  txHash?: string;
  address?: string;
  createdAt: string;
}

// Deposits Response
export interface WalletDepositsResponse {
  deposits: WalletDeposit[];
  total: number;
}

// Withdrawal
export interface WalletWithdrawal {
  id: string;
  currency: string;
  amount: string;
  status: string;
  txHash?: string;
  address: string;
  createdAt: string;
}

// Withdrawals Response
export interface WalletWithdrawalsResponse {
  withdrawals: WalletWithdrawal[];
  total: number;
}

// Deposit Address
export interface DepositAddress {
  id: number;
  currency: string;
  address: string;
  subPartnerId: string;
  createdAt: string;
}

// Deposit Addresses Response
export interface DepositAddressesResponse {
  userId: number;
  addresses: DepositAddress[];
  total: number;
}

// User Wallet Info
export interface UserWalletInfo {
  hasWallet: boolean;
  id?: number;
  partnerId?: string;
  partnerName?: string;
  isActive?: boolean;
  createdAt?: string;
  message?: string;
  depositAddresses?: {
    currency: string;
    address: string;
    createdAt: string;
  }[];
}

// Admin Transfer Request
export interface AdminTransferRequest {
  currency: string;
  amount: number;
  reason?: string;
}

// Admin Withdraw Request
export interface AdminWithdrawRequest {
  currency: string;
  amount: number;
  address: string;
  memo?: string;
  reason?: string;
}

// Operation Response
export interface WalletOperationResponse {
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
}

// Filter params for wallet list
export interface WalletFilterParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
