export interface AuthIdentity {
  provider: string;
  authId: string;
  authName?: string;
}

export interface PremiumInfo {
  isActive: boolean;
  level?: number;
  bundleTitle?: string;
  expiresAt?: string;
}

export interface User {
  id: number;
  uid: string;
  email: string | null;
  nickname: string | null;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  role: 'Client' | 'Admin' | 'Moderator';
  avatarUri: string | null;
  emailVerified: boolean;
  referrerId: number | null;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string | null;
  matrixId: string | null;
  cardEmail: string | null;
  authIdentities?: AuthIdentity[];
  // New fields
  premium?: PremiumInfo;
  cardsCount?: number;
  referralsCount?: number;
  totalXp?: number;
  referralCode?: string;
  // Analytics fields
  admin_tags?: string[];
  risk_score?: number;
  fraud_flags?: string[];
  admin_notes?: string;
  last_analytics_at?: string;
}

export * from './analytics';

export interface UserWithStats extends User {
  cardsCount: number;
  totalSpent: number;
  questsCompleted: number;
  referralsCount: number;
}

export interface UsersFilter {
  search?: string;
  role?: string;
  emailVerified?: boolean;
  hasCards?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface UsersPagination {
  page: number;
  limit: number;
  total: number;
}
