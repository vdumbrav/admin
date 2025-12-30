import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';

export const Route = createFileRoute('/_authenticated/markets/treasuries/')({
  component: MarketTreasuriesPage,
});

function MarketTreasuriesPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Treasuries</h1>
        <p className="text-muted-foreground">
          Manage cryptocurrency treasuries and reserves
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Treasuries table will be implemented here...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
