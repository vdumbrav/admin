import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/dashboard/')({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your platform metrics and activity
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder for metric cards */}
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm font-medium text-muted-foreground">
            Total Users
          </div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm font-medium text-muted-foreground">
            Active Cards
          </div>
          <div className="text-2xl font-bold">0</div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm font-medium text-muted-foreground">
            Total Revenue
          </div>
          <div className="text-2xl font-bold">$0</div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm font-medium text-muted-foreground">
            Pending Orders
          </div>
          <div className="text-2xl font-bold">0</div>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        More detailed metrics coming soon...
      </div>
    </div>
  );
}
