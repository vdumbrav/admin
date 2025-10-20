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
}

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
