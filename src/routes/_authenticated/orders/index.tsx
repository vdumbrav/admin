import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { OrdersTable } from '@/features/orders/components/orders-table';
import { useAdminOrders } from '@/features/orders/api/admin-orders';
import { Skeleton } from '@/components/ui/skeleton';

export const Route = createFileRoute('/_authenticated/orders/')({
  component: OrdersPage,
});

function OrdersPage() {
  const { data: orders, isLoading, total } = useAdminOrders();

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Card Orders</h1>
        <p className="text-muted-foreground">
          {total > 0
            ? `Showing ${total} recent card orders`
            : 'Manage card creation and topup orders, retry failed orders, and cancel pending ones'}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <OrdersTable orders={orders} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
