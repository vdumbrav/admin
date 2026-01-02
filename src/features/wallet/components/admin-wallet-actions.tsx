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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IconSend, IconArrowUpRight, IconAlertTriangle } from '@tabler/icons-react';
import { toast } from 'sonner';
import { useAdminTransfer, useAdminWithdraw } from '../api/admin-wallet';

interface AdminWalletActionsProps {
  userId: number;
}

const COMMON_CURRENCIES = ['usdt', 'btc', 'eth', 'trx', 'sol', 'matic'];

export function AdminWalletActions({ userId }: AdminWalletActionsProps) {
  return (
    <div className="flex gap-2">
      <TransferDialog userId={userId} />
      <WithdrawDialog userId={userId} />
    </div>
  );
}

function TransferDialog({ userId }: { userId: number }) {
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState('usdt');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const transfer = useAdminTransfer();

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await transfer.mutateAsync({
        userId,
        currency,
        amount: parseFloat(amount),
        reason: reason || undefined,
      });
      toast.success(`Transfer of ${amount} ${currency.toUpperCase()} initiated`);
      setOpen(false);
      setAmount('');
      setReason('');
    } catch (error) {
      toast.error(`Transfer failed: ${(error as Error).message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconSend className="h-4 w-4 mr-2" />
          Transfer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Admin Transfer</DialogTitle>
          <DialogDescription>
            Transfer funds to user's wallet (from master account). This is for admin operations like bonuses, refunds, etc.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Bonus for referral, Refund for failed transaction..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={transfer.isPending}>
            {transfer.isPending ? 'Processing...' : 'Transfer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function WithdrawDialog({ userId }: { userId: number }) {
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState('usdt');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [memo, setMemo] = useState('');
  const [reason, setReason] = useState('');

  const withdraw = useAdminWithdraw();

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!address) {
      toast.error('Please enter a destination address');
      return;
    }

    try {
      await withdraw.mutateAsync({
        userId,
        currency,
        amount: parseFloat(amount),
        address,
        memo: memo || undefined,
        reason: reason || undefined,
      });
      toast.success(`Withdrawal of ${amount} ${currency.toUpperCase()} initiated`);
      setOpen(false);
      setAmount('');
      setAddress('');
      setMemo('');
      setReason('');
    } catch (error) {
      toast.error(`Withdrawal failed: ${(error as Error).message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <IconArrowUpRight className="h-4 w-4 mr-2" />
          Withdraw
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <IconAlertTriangle className="h-5 w-5" />
            Emergency Withdrawal
          </DialogTitle>
          <DialogDescription>
            Withdraw funds from user's wallet. This is an emergency admin operation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Destination Address</Label>
            <Input
              id="address"
              placeholder="Enter wallet address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="memo">Memo/Tag (if required)</Label>
            <Input
              id="memo"
              placeholder="Optional memo or tag"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              placeholder="Explain the reason for this withdrawal..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={withdraw.isPending}>
            {withdraw.isPending ? 'Processing...' : 'Withdraw'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
