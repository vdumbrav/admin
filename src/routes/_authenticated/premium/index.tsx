import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/premium/')({
  component: PremiumPage,
});

function PremiumPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Premium Management</h1>
        <p className="text-muted-foreground">
          Manage premium users and subscriptions
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Premium users table will be implemented here...
        </p>
      </div>
    </div>
  );
}
