import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { CardsTable } from '@/features/cards/components/cards-table';
import type { Card as CardType } from '@/features/cards/types';

export const Route = createFileRoute('/_authenticated/cards/')({
  component: CardsPage,
});

// Mock data - will be replaced with API call
const mockCards: CardType[] = [
  {
    id: 'card-1',
    userId: 1,
    cardNumber: '**** **** **** 1234',
    cardholderName: 'John Doe',
    balance: 1250.75,
    currency: 'USD',
    status: 'active',
    bin: '424242',
    createdAt: new Date(2024, 0, 15).toISOString(),
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'card-2',
    userId: 2,
    cardNumber: '**** **** **** 5678',
    cardholderName: 'Jane Smith',
    balance: 450.0,
    currency: 'USD',
    status: 'active',
    bin: '424242',
    createdAt: new Date(2024, 1, 20).toISOString(),
    lastUsed: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'card-3',
    userId: 3,
    cardNumber: '**** **** **** 9012',
    cardholderName: 'Bob Wilson',
    balance: 0.0,
    currency: 'USD',
    status: 'frozen',
    bin: '424242',
    createdAt: new Date(2024, 2, 10).toISOString(),
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: 'card-4',
    userId: 4,
    cardNumber: '**** **** **** 3456',
    cardholderName: 'Alice Johnson',
    balance: 3200.5,
    currency: 'USD',
    status: 'active',
    bin: '424242',
    createdAt: new Date(2024, 1, 5).toISOString(),
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'card-5',
    userId: 5,
    cardNumber: '**** **** **** 7890',
    cardholderName: 'Charlie Brown',
    balance: 100.0,
    currency: 'USD',
    status: 'blocked',
    bin: '424242',
    createdAt: new Date(2024, 3, 1).toISOString(),
    lastUsed: null,
  },
  {
    id: 'card-6',
    userId: 1,
    cardNumber: '**** **** **** 2468',
    cardholderName: 'John Doe',
    balance: 750.25,
    currency: 'USD',
    status: 'active',
    bin: '424242',
    createdAt: new Date(2024, 2, 12).toISOString(),
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

function CardsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Cards Management</h1>
        <p className="text-muted-foreground">
          Manage user cards, topup balances, freeze/unfreeze, and block cards
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <CardsTable cards={mockCards} />
        </CardContent>
      </Card>
    </div>
  );
}
