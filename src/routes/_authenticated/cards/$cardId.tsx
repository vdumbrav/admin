import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  IconCreditCard,
  IconUser,
  IconCalendar,
  IconWallet,
  IconSnowflake,
  IconLock,
  IconCirclePlus,
  IconArrowsExchange,
} from '@tabler/icons-react';
import { useState } from 'react';
import { TopupDialog } from '@/features/cards/components/topup-dialog';
import type { Card as CardType, TopupFormData } from '@/features/cards/types';

export const Route = createFileRoute('/_authenticated/cards/$cardId')({
  component: CardDetailsPage,
});

const statusConfig = {
  active: {
    label: 'Active',
    variant: 'default' as const,
    icon: IconCreditCard,
    color: 'text-green-600',
  },
  frozen: {
    label: 'Frozen',
    variant: 'secondary' as const,
    icon: IconSnowflake,
    color: 'text-blue-600',
  },
  blocked: {
    label: 'Blocked',
    variant: 'destructive' as const,
    icon: IconLock,
    color: 'text-red-600',
  },
};

function CardDetailsPage() {
  const { cardId } = Route.useParams();
  const [topupDialogOpen, setTopupDialogOpen] = useState(false);

  // Mock card data - will be replaced with API call
  const card: CardType = {
    id: cardId,
    userId: 1,
    cardNumber: '**** **** **** 1234',
    cardholderName: 'John Doe',
    balance: 1250.75,
    currency: 'USD',
    status: 'active',
    bin: '424242',
    createdAt: new Date(2024, 0, 15).toISOString(),
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  };

  const config = statusConfig[card.status];
  const StatusIcon = config.icon;

  const handleTopupSubmit = async (data: TopupFormData) => {
    console.log('Topup data:', data);
    // TODO: Implement topup API call
  };

  const handleFreeze = () => {
    console.log('Freeze card:', card.id);
    // TODO: Implement freeze API call
  };

  const handleUnfreeze = () => {
    console.log('Unfreeze card:', card.id);
    // TODO: Implement unfreeze API call
  };

  const handleBlock = () => {
    console.log('Block card:', card.id);
    // TODO: Implement block API call
  };

  return (
    <>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Card Details</h1>
          <p className="text-muted-foreground">View and manage card information</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Card Info</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60">
                <IconCreditCard className="h-12 w-12 text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold">{card.cardNumber}</h2>
                <p className="text-sm text-muted-foreground">
                  {card.cardholderName}
                </p>
              </div>
              <Badge variant={config.variant}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {config.label}
              </Badge>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Balance & Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <IconWallet className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Balance</p>
                    <p className="text-2xl font-bold">
                      {card.balance.toFixed(2)} {card.currency}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <IconUser className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">User ID</p>
                    <p className="text-sm text-muted-foreground">{card.userId}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <IconCreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">BIN</p>
                    <p className="text-sm text-muted-foreground">{card.bin}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <IconCalendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(card.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <IconCalendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Used</p>
                    <p className="text-sm text-muted-foreground">
                      {card.lastUsed
                        ? new Date(card.lastUsed).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              onClick={() => setTopupDialogOpen(true)}
              disabled={card.status === 'blocked'}
            >
              <IconCirclePlus className="mr-2 h-4 w-4" />
              Topup Card
            </Button>

            {card.status === 'active' && (
              <Button variant="secondary" onClick={handleFreeze}>
                <IconSnowflake className="mr-2 h-4 w-4" />
                Freeze Card
              </Button>
            )}

            {card.status === 'frozen' && (
              <Button variant="secondary" onClick={handleUnfreeze}>
                <IconSnowflake className="mr-2 h-4 w-4" />
                Unfreeze Card
              </Button>
            )}

            {card.status !== 'blocked' && (
              <Button variant="destructive" onClick={handleBlock}>
                <IconLock className="mr-2 h-4 w-4" />
                Block Card
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <IconArrowsExchange className="h-5 w-5" />
                Recent Transactions
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Recent transactions will be displayed here...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Topup History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Card topup history will be displayed here...
            </p>
          </CardContent>
        </Card>
      </div>

      <TopupDialog
        card={card}
        open={topupDialogOpen}
        onOpenChange={setTopupDialogOpen}
        onSubmit={handleTopupSubmit}
      />
    </>
  );
}
