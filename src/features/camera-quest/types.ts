export enum EPrizeCardStatus {
  Available = 'available',
  Reserved = 'reserved',
  Distributed = 'distributed',
}

export enum ECameraQuestSessionStatus {
  Active = 'active',
  Playing = 'playing',
  Won = 'won',
  Lost = 'lost',
  Completed = 'completed',
  Cancelled = 'cancelled',
  Expired = 'expired',
}

export interface CameraQuestSettings {
  id: number;
  requiredPipes: number;
  isEnabled: boolean;
  sessionTimeoutMinutes: number;
  maxActiveSessions: number;
  createdAt: string;
  updatedAt: string;
}

export interface PrizeCard {
  id: number;
  adscardCardId: number;
  status: EPrizeCardStatus;
  sessionId?: number;
  distributedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Card details
  cardNumber?: string;
  cardMasked?: string;
  currency?: string;
  balance?: number;
  comment?: string; // Card name from ADScard
  email?: string; // Billing email from ADScard
}

export interface CameraQuestSession {
  id: number;
  userId: number;
  status: ECameraQuestSessionStatus;
  score: number;
  passedPipes: number;
  prizeCardId?: number;
  startedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  expiresAt: string;
  // User details
  user?: {
    id: number;
    firstName?: string;
    lastName?: string;
    username?: string;
  };
}

export interface CameraQuestStatistics {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  expiredSessions: number;
  totalPrizeCards: number;
  availablePrizeCards: number;
  reservedPrizeCards: number;
  distributedPrizeCards: number;
  averageScore: number;
  highestScore: number;
}

export interface GetPrizeCardsParams {
  status?: EPrizeCardStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface GetAvailableCardsParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export interface GetSessionsParams {
  status?: ECameraQuestSessionStatus;
  userId?: number;
  limit?: number;
  offset?: number;
}

export interface UpdateSettingsDto {
  requiredPipes?: number;
  isEnabled?: boolean;
  sessionTimeoutMinutes?: number;
  maxActiveSessions?: number;
}

export interface AddCardDto {
  adscardCardId: number;
}

export interface BatchAddCardsDto {
  adscardCardIds: number[];
}

export interface CancelSessionDto {
  reason?: string;
}
