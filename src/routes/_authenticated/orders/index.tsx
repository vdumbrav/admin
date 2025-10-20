import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { OrdersTable } from '@/features/orders/components/orders-table';
import type { CardOrder } from '@/features/orders/types';

export const Route = createFileRoute('/_authenticated/orders/')({
  component: OrdersPage,
});

// Mock data - will be replaced with API call
const mockOrders: CardOrder[] = [
  {
    id: 1,
    userId: 1,
    orderType: 'card_creation',
    status: 'completed',
    cardId: 'card-1',
    cardNumber: '**** **** **** 1234',
    createdAt: new Date(2024, 0, 15).toISOString(),
    updatedAt: new Date(2024, 0, 15).toISOString(),
    completedAt: new Date(2024, 0, 15).toISOString(),
  },
  {
    id: 2,
    userId: 1,
    orderType: 'card_topup',
    status: 'completed',
    amount: 500,
    currency: 'USD',
    cardId: 'card-1',
    cardNumber: '**** **** **** 1234',
    topupSource: 'master_balance',
    createdAt: new Date(2024, 1, 20).toISOString(),
    updatedAt: new Date(2024, 1, 20).toISOString(),
    completedAt: new Date(2024, 1, 20).toISOString(),
  },
  {
    id: 3,
    userId: 2,
    orderType: 'card_creation',
    status: 'processing',
    createdAt: new Date(2024, 2, 10).toISOString(),
    updatedAt: new Date(2024, 2, 10).toISOString(),
  },
  {
    id: 4,
    userId: 3,
    orderType: 'card_topup',
    status: 'failed',
    amount: 100,
    currency: 'USD',
    cardId: 'card-3',
    cardNumber: '**** **** **** 9012',
    topupSource: 'external_wallet',
    errorMessage: 'Insufficient funds in external wallet',
    createdAt: new Date(2024, 2, 15).toISOString(),
    updatedAt: new Date(2024, 2, 15).toISOString(),
  },
  {
    id: 5,
    userId: 4,
    orderType: 'card_topup',
    status: 'pending',
    amount: 250,
    currency: 'USD',
    cardId: 'card-4',
    cardNumber: '**** **** **** 3456',
    topupSource: 'master_balance',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 6,
    userId: 2,
    orderType: 'card_creation',
    status: 'completed',
    cardId: 'card-2',
    cardNumber: '**** **** **** 5678',
    createdAt: new Date(2024, 1, 20).toISOString(),
    updatedAt: new Date(2024, 1, 20).toISOString(),
    completedAt: new Date(2024, 1, 20).toISOString(),
  },
  {
    id: 7,
    userId: 5,
    orderType: 'card_creation',
    status: 'cancelled',
    errorMessage: 'User cancelled the request',
    createdAt: new Date(2024, 3, 1).toISOString(),
    updatedAt: new Date(2024, 3, 1).toISOString(),
    cancelledAt: new Date(2024, 3, 1).toISOString(),
  },
  {
    id: 8,
    userId: 1,
    orderType: 'card_topup',
    status: 'failed',
    amount: 1000,
    currency: 'USD',
    cardId: 'card-1',
    cardNumber: '**** **** **** 1234',
    topupSource: 'master_balance',
    errorMessage: 'ADScard API timeout - please retry',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];

function OrdersPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Card Orders</h1>
        <p className="text-muted-foreground">
          Manage card creation and topup orders, retry failed orders, and cancel pending ones
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <OrdersTable orders={mockOrders} />
        </CardContent>
      </Card>
    </div>
  );
}
