export type CardStatus = 'active' | 'frozen' | 'blocked';

export interface Card {
  id: string;
  userId: number;
  cardNumber: string; // masked, e.g., "**** **** **** 1234"
  cardholderName: string;
  balance: number;
  currency: string;
  status: CardStatus;
  bin: string;
  createdAt: string;
  lastUsed: string | null;
}

export interface TopupSource {
  type: 'master_balance' | 'external_wallet';
  label: string;
}

export interface TopupFormData {
  cardId: string;
  amount: number;
  source: TopupSource['type'];
  note?: string;
}

export interface TopupOrder {
  id: number;
  cardId: string;
  userId: number;
  amount: number;
  currency: string;
  source: TopupSource['type'];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt: string | null;
  note?: string;
}
