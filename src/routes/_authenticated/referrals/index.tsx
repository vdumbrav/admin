import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/referrals/')({
  component: ReferralsPage,
});

function ReferralsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Referral Program</h1>
        <p className="text-muted-foreground">
          Manage referrals and rewards
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Referrals dashboard will be implemented here...
        </p>
      </div>
    </div>
  );
}
