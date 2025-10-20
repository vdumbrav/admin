// Common types
export interface MarketsPagination {
  page: number;
  pageSize: number;
  total: number;
}

// Coin types
export interface Coin {
  id: number;
  uid: string;
  name: string;
  code: string;
  coingecko_id?: string;
  price?: number;
  description?: string;
  security?: string;
  links?: string; // JSON string
  created_at?: string;
  updated_at?: string;
}

export interface CoinFormData {
  uid: string;
  name: string;
  code: string;
  coingecko_id?: string;
  price?: number;
  description?: string;
  security?: string;
  links?: string;
}

// Category types
export interface Category {
  id: number;
  uid: string;
  name: string;
  order: number;
  description?: string;
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryFormData {
  uid: string;
  name: string;
  order: number;
  description?: string;
  enabled: boolean;
}

// Exchange types
export interface VerifiedExchange {
  id: number;
  uid: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

// Platform types
export interface Platform {
  id: number;
  uid: string;
  name: string;
  chain_uid?: string;
  decimals?: number;
  symbol?: string;
  created_at?: string;
  updated_at?: string;
}

// Chain types
export interface Chain {
  id: number;
  uid: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

// Fund types
export interface Fund {
  id: number;
  uid: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Treasury Entity types
export interface TreasuryEntity {
  id: number;
  uid: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

// Treasury types
export interface Treasury {
  id: number;
  entity_uid: string;
  coin_uid: string;
  amount: number;
  amount_in_usd: number;
  created_at?: string;
  updated_at?: string;
}

// Language types
export interface Language {
  id: number;
  code: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}
