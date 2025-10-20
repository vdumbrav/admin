import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/transactions/')({
  component: TransactionsPage,
});

function TransactionsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">
          View all platform transactions and payments
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Transactions table will be implemented here...
        </p>
      </div>
    </div>
  );
}
