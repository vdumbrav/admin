import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { IconCurrencyBitcoin, IconCurrencyEthereum, IconCoin } from '@tabler/icons-react';
import type { BalanceItem } from '../types';

interface BalanceDisplayProps {
  balances?: BalanceItem[];
  isLoading?: boolean;
  title?: string;
}

const getCurrencyIcon = (currency: string) => {
  const upperCurrency = currency.toUpperCase();
  switch (upperCurrency) {
    case 'BTC':
      return <IconCurrencyBitcoin className="h-5 w-5 text-orange-500" />;
    case 'ETH':
      return <IconCurrencyEthereum className="h-5 w-5 text-blue-500" />;
    default:
      return <IconCoin className="h-5 w-5 text-gray-500" />;
  }
};

const formatBalance = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (num === 0) return '0';
  if (num < 0.00001) return num.toExponential(4);
  if (num < 1) return num.toFixed(8);
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 });
};

export function BalanceDisplay({ balances, isLoading, title = 'Balances' }: BalanceDisplayProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const nonZeroBalances = balances?.filter(
    (b) => parseFloat(b.available) > 0 || (b.pending && parseFloat(b.pending) > 0)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {!nonZeroBalances || nonZeroBalances.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No balances available
          </div>
        ) : (
          <div className="space-y-4">
            {nonZeroBalances.map((balance) => (
              <div
                key={balance.currency}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  {getCurrencyIcon(balance.currency)}
                  <div>
                    <div className="font-medium">{balance.currency.toUpperCase()}</div>
                    {balance.pending && parseFloat(balance.pending) > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {formatBalance(balance.pending)} pending
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-medium">
                    {formatBalance(balance.available)}
                  </div>
                  {balance.total && (
                    <div className="text-xs text-muted-foreground">
                      Total: {formatBalance(balance.total)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
