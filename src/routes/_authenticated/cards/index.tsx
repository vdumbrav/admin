import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/cards/')({
  component: CardsPage,
});

function CardsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Cards Management</h1>
        <p className="text-muted-foreground">
          Manage user cards, freeze/unfreeze, and view transactions
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Cards table will be implemented here...
        </p>
      </div>
    </div>
  );
}
