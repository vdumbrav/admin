import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { IconCopy, IconMapPin } from '@tabler/icons-react';
import { toast } from 'sonner';
import type { DepositAddress } from '../types';

interface DepositAddressesListProps {
  addresses?: DepositAddress[];
  isLoading?: boolean;
}

const shortenAddress = (address: string) => {
  if (!address) return '-';
  if (address.length <= 20) return address;
  return `${address.slice(0, 12)}...${address.slice(-12)}`;
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
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{addr.currency.toUpperCase()}</Badge>
                  <div>
                    <div className="font-mono text-sm">{shortenAddress(addr.address)}</div>
                    <div className="text-xs text-muted-foreground">
                      Created {formatDate(addr.createdAt)}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(addr.address)}
                >
                  <IconCopy className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
