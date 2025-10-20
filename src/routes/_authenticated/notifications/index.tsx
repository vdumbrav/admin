import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/notifications/')({
  component: NotificationsPage,
});

function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">
          Send notifications and view history
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Notification management will be implemented here...
        </p>
      </div>
    </div>
  );
}
