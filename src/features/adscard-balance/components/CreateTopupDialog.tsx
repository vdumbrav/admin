import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IconPlus } from '@tabler/icons-react';
import { useCreateTrcTopup } from '../hooks/useTrcTopups';
import { toast } from 'sonner';

interface CreateTopupDialogProps {
  authToken: string;
  onSuccess?: (qr: string, wallet: string) => void;
}

export function CreateTopupDialog({
  authToken,
  onSuccess,
}: CreateTopupDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const createTopup = useCreateTrcTopup(authToken);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const response = await createTopup.mutateAsync(numAmount);
      toast.success('Topup created successfully');

      if (onSuccess && response.data.qr && response.data.wallet) {
        onSuccess(response.data.qr, response.data.wallet);
      }

      setOpen(false);
      setAmount('');
    } catch (error) {
      toast.error('Failed to create topup');
      console.error('Create topup error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <IconPlus className="w-4 h-4 mr-2" />
          Create Topup
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create TRC Topup</DialogTitle>
          <DialogDescription>
            Create a new TRC (USDT) topup for the master balance
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter amount in USD"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                Minimum topup amount may apply
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createTopup.isPending}>
              {createTopup.isPending ? 'Creating...' : 'Create Topup'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
