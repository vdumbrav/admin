import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/analytics/')({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Platform statistics and insights
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Analytics dashboard will be implemented here...
        </p>
      </div>
    </div>
  );
}
