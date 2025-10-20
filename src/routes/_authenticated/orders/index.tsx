import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/orders/')({
  component: OrdersPage,
});

function OrdersPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Card Orders</h1>
        <p className="text-muted-foreground">
          Manage card purchase and topup orders
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Orders table will be implemented here...
        </p>
      </div>
    </div>
  );
}
