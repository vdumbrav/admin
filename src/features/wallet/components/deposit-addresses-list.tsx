import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { IconCopy, IconMapPin } from '@tabler/icons-react';
import { toast } from 'sonner';
import type { DepositAddress } from '../types';

interface DepositAddressesListProps {
  addresses?: DepositAddress[];
  isLoading?: boolean;
}

// Square token icon component - uses logoUrl from API
const TokenIcon = ({ currency, logoUrl }: { currency: string; logoUrl?: string }) => {
  const symbol = currency?.toUpperCase()
    .replace('_TRC20', '').replace('_ERC20', '').replace('_BSC', '')
    .replace('_TON', '').replace('TRC20', '').replace('ERC20', '')
    .replace('BSC', '').replace('TON', '') || '?';

  return (
    <Avatar className="h-8 w-8 rounded-sm">
      {logoUrl && (
        <AvatarImage
          src={logoUrl}
          alt={symbol}
          className="rounded-sm object-cover"
        />
      )}
      <AvatarFallback className="text-xs rounded-sm bg-muted">
        {symbol.slice(0, 2)}
      </AvatarFallback>
    </Avatar>
  );
};

// Get network name from currency or network field
const getNetworkName = (currency: string, network?: string) => {
  // If network is provided from API, use it
  if (network) {
    const lower = network.toLowerCase();
    const networkNames: Record<string, string> = {
      btc: 'Bitcoin',
      bitcoin: 'Bitcoin',
      eth: 'Ethereum',
      ethereum: 'Ethereum',
      trx: 'Tron',
      tron: 'Tron',
      ltc: 'Litecoin',
      litecoin: 'Litecoin',
      ton: 'TON',
      bsc: 'BSC',
      sol: 'Solana',
      solana: 'Solana',
    };
    return networkNames[lower] || network;
  }

  // Fallback: try to extract from currency name
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
              const networkName = getNetworkName(addr.currency, addr.network);
              return (
                <div
                  key={addr.id}
                  className="flex items-start justify-between p-3 rounded-lg bg-muted/50 gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="flex-shrink-0 mt-0.5">
                      <TokenIcon currency={addr.currency} logoUrl={addr.logoUrl} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{addr.currency?.toUpperCase() || 'N/A'}</Badge>
                        {networkName && (
                          <span className="text-xs text-muted-foreground">{networkName}</span>
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
