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
import { IconPlus, IconLoader2, IconCopy, IconCheck } from '@tabler/icons-react';
import { useCreateCryptoTopup } from '../hooks/useTrcTopups';
import type { CryptoNetwork, CryptoTopupData } from '../types/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export function CreateCryptoTopupDialog() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [network, setNetwork] = useState<CryptoNetwork>('TRC20');
  const [topupData, setTopupData] = useState<CryptoTopupData | null>(null);
  const [copied, setCopied] = useState(false);

  const createMutation = useCreateCryptoTopup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);

    // Confirmation dialog for financial operation (PCI DSS compliance)
    const confirmed = window.confirm(
      `Create a topup for $${numAmount.toFixed(2)} USDT on ${network}?\n\n` +
      `This action will generate a wallet address for payment.`
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

      // ADScard API returns { data: { id, wallet, amount, status, qr?, created_at } }
      setTopupData(response.data);
      toast.success('Topup request created! Send USDT to the wallet address below.');
    } catch (error) {
      console.error('Failed to create crypto topup:', error);
      toast.error('Failed to create topup request');
    }
  };

  const handleCopyWallet = async () => {
    if (topupData?.wallet) {
      await navigator.clipboard.writeText(topupData.wallet);
      setCopied(true);
      toast.success('Wallet address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setAmount('');
    setNetwork('TRC20');
    setTopupData(null);
    setCopied(false);
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

        {!topupData ? (
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
                Send exactly <strong>${topupData.amount} USDT</strong> on <strong>{network}</strong> to the wallet address below.
                The balance will be credited automatically after confirmation.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Topup ID:</span>
                <span className="font-medium">#{topupData.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">${topupData.amount} USDT</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Network:</span>
                <span className="font-medium">{network}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium capitalize">{topupData.status}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Wallet Address ({network})</Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={topupData.wallet}
                  className="font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyWallet}
                >
                  {copied ? (
                    <IconCheck className="h-4 w-4 text-green-500" />
                  ) : (
                    <IconCopy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {topupData.qr && (
              <div className="flex justify-center">
                <img
                  src={topupData.qr}
                  alt="QR Code"
                  className="w-48 h-48 border rounded-lg"
                />
              </div>
            )}

            <Alert variant="default" className="bg-yellow-50 border-yellow-200">
              <AlertDescription className="text-yellow-800">
                Important: Send only USDT on {network} network. Sending other tokens or using wrong network may result in loss of funds.
              </AlertDescription>
            </Alert>

            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
