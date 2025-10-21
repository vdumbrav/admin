import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { IconFilter, IconX } from '@tabler/icons-react';
import type { TransactionFilters } from '../types';

interface TransactionsFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
}

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'deposit', label: 'Deposit' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'swap', label: 'Swap' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'refund', label: 'Refund' },
];

const sourceOptions = [
  { value: 'all', label: 'All Sources' },
  { value: 'internal', label: 'Internal' },
  { value: 'external', label: 'External' },
  { value: 'card', label: 'Card' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'fiat', label: 'Fiat' },
];

export function TransactionsFilters({
  filters,
  onFiltersChange,
}: TransactionsFiltersProps) {
  const [walletId, setWalletId] = useState(filters.walletId?.toString() || '');

  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      type: value === 'all' ? undefined : value,
      page: 1,
    });
  };

  const handleSourceChange = (value: string) => {
    onFiltersChange({
      ...filters,
      source: value === 'all' ? undefined : value,
      page: 1,
    });
  };

  const handleWalletIdChange = (value: string) => {
    setWalletId(value);
    const numValue = parseInt(value);
    onFiltersChange({
      ...filters,
      walletId: value && !isNaN(numValue) ? numValue : undefined,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    setWalletId('');
    onFiltersChange({
      page: 1,
      itemsPerPage: filters.itemsPerPage,
    });
  };

  const hasActiveFilters = filters.type || filters.source || filters.walletId;

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconFilter className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8"
          >
            <IconX className="mr-1 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="type">Transaction Type</Label>
          <Select
            value={filters.type || 'all'}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="source">Source</Label>
          <Select
            value={filters.source || 'all'}
            onValueChange={handleSourceChange}
          >
            <SelectTrigger id="source">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {sourceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="walletId">Wallet ID</Label>
          <Input
            id="walletId"
            type="number"
            placeholder="Enter wallet ID"
            value={walletId}
            onChange={(e) => handleWalletIdChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
