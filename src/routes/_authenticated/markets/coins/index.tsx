import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';

export const Route = createFileRoute('/_authenticated/markets/coins/')({
  component: MarketCoinsPage,
});

function MarketCoinsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Coins</h1>
        <p className="text-muted-foreground">
          Manage cryptocurrency coins and tokens data
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Coins table will be implemented here...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
