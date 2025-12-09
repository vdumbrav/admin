import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { IconWallet, IconClock, IconCreditCard } from '@tabler/icons-react';
import type { BalanceInfo } from '../types/api';

interface BalanceCardsProps {
  balance?: BalanceInfo;
  isLoading?: boolean;
}

export function BalanceCards({ balance, isLoading }: BalanceCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="mb-2 h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Current Balance',
      value: `$${balance?.currentBalance.toFixed(2) || '0.00'}`,
      icon: IconWallet,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Pending Topups',
      value: `$${balance?.pendingTopups.toFixed(2) || '0.00'}`,
      icon: IconClock,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Available for Cards',
      value: `$${balance?.availableForCards.toFixed(2) || '0.00'}`,
      icon: IconCreditCard,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="border hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
                <div
                  className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}
                >
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
