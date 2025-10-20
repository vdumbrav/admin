import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Card, TopupFormData, TopupSource } from '../types';

const topupSources: TopupSource[] = [
  { type: 'master_balance', label: 'Master Balance' },
  { type: 'external_wallet', label: 'External Wallet' },
];

const topupFormSchema = z.object({
  amount: z
    .number()
    .min(1, 'Amount must be at least 1')
    .max(10000, 'Amount must not exceed 10,000'),
  source: z.enum(['master_balance', 'external_wallet']),
  note: z.string().optional(),
});

type TopupFormValues = z.infer<typeof topupFormSchema>;

interface TopupDialogProps {
  card: Card | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TopupFormData) => Promise<void>;
}

export function TopupDialog({
  card,
  open,
  onOpenChange,
  onSubmit,
}: TopupDialogProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingData, setPendingData] = useState<TopupFormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TopupFormValues>({
    resolver: zodResolver(topupFormSchema),
    defaultValues: {
      amount: 0,
      source: 'master_balance',
      note: '',
    },
  });

  const handleFormSubmit = (data: TopupFormValues) => {
    setPendingData(data);
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (!pendingData || !card) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        cardId: card.id,
        ...pendingData,
      });
      setShowConfirmation(false);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Failed to topup card:', error);
    } finally {
      setIsSubmitting(false);
      setPendingData(null);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setPendingData(null);
  };

  const selectedSource = topupSources.find(
    (s) => s.type === form.watch('source')
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Topup Card</DialogTitle>
            <DialogDescription>
              Add funds to card {card?.cardNumber || ''}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0.00"
                          step="0.01"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                          <span className="text-sm text-muted-foreground">
                            {card?.currency || 'USD'}
                          </span>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter the amount to add to the card
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topup Source</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select topup source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {topupSources.map((source) => (
                          <SelectItem key={source.type} value={source.type}>
                            {source.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the source of funds for this topup
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add a note about this topup (e.g., promotion, special action)"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Add any relevant information about this topup
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Continue</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to topup card {card?.cardNumber} with{' '}
              {pendingData?.amount} {card?.currency || 'USD'} from{' '}
              {selectedSource?.label}.
              {pendingData?.note && (
                <span className="mt-2 block text-sm">
                  Note: {pendingData.note}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Confirm Topup'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
