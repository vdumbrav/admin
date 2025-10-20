import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/adscard-balance/')({
  component: AdscardBalancePage,
});

function AdscardBalancePage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">ADScard Master Balance</h1>
        <p className="text-muted-foreground">
          Manage master wallet topups and balance
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm font-medium text-muted-foreground">
            Current Balance
          </div>
          <div className="text-2xl font-bold">$0</div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm font-medium text-muted-foreground">
            Pending Topups
          </div>
          <div className="text-2xl font-bold">$0</div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-sm font-medium text-muted-foreground">
            Available for Cards
          </div>
          <div className="text-2xl font-bold">$0</div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Balance management interface coming soon...
        </p>
      </div>
    </div>
  );
}
