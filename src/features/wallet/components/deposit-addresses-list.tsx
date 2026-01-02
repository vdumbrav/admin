import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { IconCopy, IconMapPin, IconCurrencyBitcoin, IconCurrencyEthereum, IconCoin } from '@tabler/icons-react';
import { toast } from 'sonner';
import type { DepositAddress } from '../types';

interface DepositAddressesListProps {
  addresses?: DepositAddress[];
  isLoading?: boolean;
}

// Get icon for currency/network
const getCurrencyIcon = (currency: string) => {
  const iconClass = 'h-5 w-5';
  const upper = currency?.toUpperCase() || '';

  if (upper === 'BTC' || upper === 'BITCOIN') {
    return <IconCurrencyBitcoin className={`${iconClass} text-orange-500`} />;
  }
  if (upper === 'ETH' || upper.includes('ERC20') || upper === 'ETHEREUM') {
    return <IconCurrencyEthereum className={`${iconClass} text-blue-500`} />;
  }
  if (upper === 'LTC' || upper === 'LITECOIN') {
    return <IconCoin className={`${iconClass} text-gray-400`} />;
  }
  if (upper === 'TRX' || upper.includes('TRC20') || upper === 'TRON') {
    return <IconCoin className={`${iconClass} text-red-500`} />;
  }
  if (upper === 'TON' || upper === 'TONCOIN') {
    return <IconCoin className={`${iconClass} text-blue-400`} />;
  }
  if (upper.includes('USDT')) {
    return <IconCoin className={`${iconClass} text-green-500`} />;
  }
  if (upper.includes('USDC')) {
    return <IconCoin className={`${iconClass} text-blue-600`} />;
  }
  return <IconCoin className={`${iconClass} text-muted-foreground`} />;
};

// Get network name from currency
const getNetworkName = (currency: string) => {
  const upper = currency?.toUpperCase() || '';
  if (upper.includes('TRC20') || upper === 'TRX') return 'Tron';
  if (upper.includes('ERC20') || upper === 'ETH') return 'Ethereum';
  if (upper === 'BTC') return 'Bitcoin';
  if (upper === 'LTC') return 'Litecoin';
  if (upper === 'TON') return 'TON';
  if (upper.includes('BSC') || upper.includes('BEP20')) return 'BSC';
  return '';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export function DepositAddressesList({ addresses, isLoading }: DepositAddressesListProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Address copied to clipboard');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <IconMapPin className="h-5 w-5" />
            Deposit Addresses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <IconMapPin className="h-5 w-5" />
          Deposit Addresses ({addresses?.length ?? 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!addresses || addresses.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No deposit addresses generated
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => {
              const network = getNetworkName(addr.currency);
              return (
                <div
                  key={addr.id}
                  className="flex items-start justify-between p-3 rounded-lg bg-muted/50 gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex-shrink-0 mt-0.5">
                      {getCurrencyIcon(addr.currency)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{addr.currency?.toUpperCase() || 'N/A'}</Badge>
                        {network && (
                          <span className="text-xs text-muted-foreground">{network}</span>
                        )}
                      </div>
                      <div className="font-mono text-xs break-all select-all bg-background/50 p-2 rounded border">
                        {addr.address}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Created {formatDate(addr.createdAt)}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => copyToClipboard(addr.address)}
                  >
                    <IconCopy className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
