import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IconPlus, IconLoader2 } from '@tabler/icons-react';
import { useCreateCryptoTopup, useCryptoTopupStatus } from '../hooks/useTrcTopups';
import type { CryptoNetwork } from '../types/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function CreateCryptoTopupDialog() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState<CryptoNetwork>('TRC20');
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const createMutation = useCreateCryptoTopup();
  const { data: paymentStatus } = useCryptoTopupStatus(paymentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);

    // Confirmation dialog for financial operation (PCI DSS compliance)
    const confirmed = window.confirm(
      `Create a topup for $${numAmount.toFixed(2)} USDT on ${network}?\n\n` +
      `This action will generate a payment request and cannot be undone once paid.`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await createMutation.mutateAsync({
        amount: numAmount,
        currency: 'USDT',
        network,
      });

      setPaymentId(response.paymentId);

      // Open payment URL in new window
      window.open(response.paymentUrl, '_blank');
    } catch (error) {
      console.error('Failed to create crypto topup:', error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setAmount('');
    setNetwork('TRC20');
    setPaymentId(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconPlus className="mr-2 h-4 w-4" />
          USDT Topup
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Top Up with USDT</DialogTitle>
          <DialogDescription>
            Add funds to your ADScard Master Balance using USDT cryptocurrency
          </DialogDescription>
        </DialogHeader>

        {!paymentId ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="10"
                placeholder="100.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Minimum: $10.00
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="network">Network</Label>
              <Select
                value={network}
                onValueChange={(value) => setNetwork(value as CryptoNetwork)}
              >
                <SelectTrigger id="network">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRC20">USDT TRC20 (Tron)</SelectItem>
                  <SelectItem value="ERC20">USDT ERC20 (Ethereum)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                TRC20 recommended for lower fees
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Payment
              </Button>
            </div>

            {createMutation.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  Failed to create payment. Please try again.
                </AlertDescription>
              </Alert>
            )}
          </form>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Payment window has been opened. Please complete the payment in the new window.
              </AlertDescription>
            </Alert>

            {paymentStatus && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium capitalize">
                    {paymentStatus.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">
                    ${paymentStatus.priceAmount} USD
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pay:</span>
                  <span className="font-medium">
                    {paymentStatus.actuallyPaid || 0} {paymentStatus.payCurrency}
                  </span>
                </div>
              </div>
            )}

            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
