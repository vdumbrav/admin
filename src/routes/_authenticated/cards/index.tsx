import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { CardsTable } from '@/features/cards/components/cards-table';
import { useAdminCards } from '@/features/cards/api/admin-cards';
import { Skeleton } from '@/components/ui/skeleton';

export const Route = createFileRoute('/_authenticated/cards/')({
  component: CardsPage,
});

function CardsPage() {
  const { data, isLoading } = useAdminCards();
  const cards = data?.cards || [];
  const total = data?.total || 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Cards Management</h1>
        <p className="text-muted-foreground">
          {total > 0
            ? `Manage ${total} user cards, topup balances, freeze/unfreeze, and block cards`
            : 'Manage user cards, topup balances, freeze/unfreeze, and block cards'}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <CardsTable cards={cards} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
