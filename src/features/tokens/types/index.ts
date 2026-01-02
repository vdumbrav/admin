// Token Statistics
export interface TokenStatistics {
  totalTokens: number;
  activeTokens: number;
  visibleOnWeb: number;
  visibleOnMobile: number;
  visibleOnTelegram: number;
  depositEnabled: number;
  withdrawEnabled: number;
  exchangeEnabled: number;
  uniqueNetworks: number;
}

// Token List Item
export interface TokenListItem {
  id: number;
  symbol: string;
  network: string;
  name: string;
  logoUrl?: string;
  fallbackLogoUrl?: string;
  coingeckoId?: string;
  isActive: boolean;
  visibleOnWeb: boolean;
  visibleOnMobile: boolean;
  visibleOnTelegram: boolean;
  depositEnabled: boolean;
  withdrawEnabled: boolean;
  exchangeEnabled: boolean;
  sortOrder: number;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

// Paginated Tokens Response
export interface PaginatedTokensResponse {
  items: TokenListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Token Filter Params
export interface TokenFilterParams {
  search?: string;
  network?: string;
  platform?: 'web' | 'mobile' | 'telegram';
  isActive?: boolean;
}

// Update Token Request
export interface UpdateTokenRequest {
  isActive?: boolean;
  visibleOnWeb?: boolean;
  visibleOnMobile?: boolean;
  visibleOnTelegram?: boolean;
  depositEnabled?: boolean;
  withdrawEnabled?: boolean;
  exchangeEnabled?: boolean;
  sortOrder?: number;
  logoUrl?: string;
}

// Bulk Platform Update Request
export interface BulkPlatformUpdateRequest {
  tokenIds: number[];
  platform: 'web' | 'mobile' | 'telegram';
  visible: boolean;
}

// Bulk Feature Update Request
export interface BulkFeatureUpdateRequest {
  tokenIds: number[];
  feature: 'deposit' | 'withdraw' | 'exchange';
  enabled: boolean;
}

// Sync Result
export interface SyncResult {
  added: number;
  updated: number;
  total: number;
}

// Icon Download Result
export interface IconDownloadResult {
  coinsDownloaded: number;
  blockchainsDownloaded: number;
  coinsFailed: number;
  blockchainsFailed: number;
}

// CDN Config
export interface CdnConfig {
  coinCdnBase: string;
  blockchainCdnBase: string;
  sourceCoinCdnBase: string;
  sourceBlockchainCdnBase: string;
  iconSuffix: string;
  localPath: string;
}

// Network Option
export interface NetworkOption {
  value: string;
  label: string;
  count: number;
}
