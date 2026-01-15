import { useState, useMemo, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  IconUser,
  IconExternalLink,
  IconArrowDown,
  IconArrowUp,
  IconArrowsExchange,
  IconActivity,
  IconSearch,
  IconCopy,
} from '@tabler/icons-react';
import { Cross2Icon, CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { loadJSON, saveJSON } from '@/utils/persist';
import { DataTableViewOptions } from '@/components/table/data-table-view-options';
import type { GlobalTransactionItem, TransactionFilterParams } from '../types';

// Token icon component (square like in Tokens tab)
const TokenIcon = ({ currency, logoUrl }: { currency: string; logoUrl?: string }) => {
  const symbol = currency?.toUpperCase()
    .replace('_TRC20', '').replace('_ERC20', '').replace('_BSC', '')
    .replace('_TON', '').replace('TRC20', '').replace('ERC20', '')
    .replace('BSC', '').replace('TON', '') || '?';

  return (
    <Avatar className="h-6 w-6 rounded-sm">
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

const LS_TX_TABLE_VIS = 'tx-table-visibility';

interface GlobalTransactionsTableProps {
  transactions: GlobalTransactionItem[];
  page: number;
  totalPages: number;
  total: number;
  isLoading?: boolean;
  filters?: TransactionFilterParams;
  onPageChange: (page: number) => void;
  onFilterChange: (filters: TransactionFilterParams) => void;
}

// Filter options - ETransactionDirections: accrual, retention, income, outgo
const directionOptions = [
  { value: 'income', label: 'Income' },
  { value: 'outgo', label: 'Outgo' },
  { value: 'accrual', label: 'Accrual' },
  { value: 'retention', label: 'Retention' },
];

// ETransactionGroups enum values
const groupOptions = [
  { value: 'on_ramp', label: 'Deposits' },
  { value: 'off_ramp', label: 'Withdrawals' },
  { value: 'withdraw', label: 'Withdraw' },
  { value: 'swap', label: 'Swap' },
  { value: 'send', label: 'Send' },
  { value: 'receive', label: 'Receive' },
  { value: 'payment', label: 'Payment' },
  { value: 'topup', label: 'Card Topup' },
  { value: 'cards', label: 'Cards' },
  { value: 'fee', label: 'Fee' },
];

const currencyOptions = [
  { value: 'BTC', label: 'Bitcoin (BTC)' },
  { value: 'ETH', label: 'Ethereum (ETH)' },
  { value: 'USDT', label: 'Tether (USDT)' },
  { value: 'USDC', label: 'USD Coin (USDC)' },
  { value: 'TRX', label: 'Tron (TRX)' },
  { value: 'TON', label: 'TON' },
  { value: 'LTC', label: 'Litecoin (LTC)' },
  { value: 'SOL', label: 'Solana (SOL)' },
  { value: 'BNB', label: 'BNB' },
];

// ETransactionStatuses: pending, success, failed
const statusOptions = [
  { value: 'success', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];


// Format amount with appropriate decimals
const formatAmount = (amount: number | string, _currency: string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';

  if (num === 0) return '0';
  if (num < 0.0001) return num.toExponential(2);
  if (num < 1) return num.toFixed(6);
  if (num < 1000) return num.toFixed(4);
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
};

// Format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Truncate address for display
const truncateAddress = (address?: string): string => {
  if (!address) return '-';
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
};

// Copy to clipboard helper
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

// Map backend group values to display names
const getGroupDisplayName = (group: string): string => {
  const map: Record<string, string> = {
    on_ramp: 'Deposit',
    withdraw: 'Withdraw',
    swap: 'Exchange',
    send: 'Send',
    receive: 'Receive',
  };
  return map[group] || group;
};

// Get transaction icon
const getTransactionIcon = (group: string) => {
  switch (group) {
    case 'on_ramp':
    case 'Deposit':
      return <IconArrowDown className="h-4 w-4 text-green-500" />;
    case 'withdraw':
    case 'Withdraw':
      return <IconArrowUp className="h-4 w-4 text-red-500" />;
    case 'swap':
    case 'Exchange':
      return <IconArrowsExchange className="h-4 w-4 text-purple-500" />;
    case 'send':
    case 'Send':
      return <IconArrowUp className="h-4 w-4 text-orange-500" />;
    case 'receive':
    case 'Receive':
      return <IconArrowDown className="h-4 w-4 text-blue-500" />;
    default:
      return <IconActivity className="h-4 w-4 text-gray-500" />;
  }
};

// Get status badge variant
const getStatusBadge = (status: string) => {
  const statusLower = status?.toLowerCase() || '';
  if (statusLower === 'completed' || statusLower === 'success') {
    return <Badge variant="default">{status}</Badge>;
  }
  if (statusLower === 'pending' || statusLower === 'processing') {
    return <Badge variant="secondary">{status}</Badge>;
  }
  if (statusLower === 'failed' || statusLower === 'error') {
    return <Badge variant="destructive">{status}</Badge>;
  }
  return <Badge variant="outline">{status}</Badge>;
};

// Multi-select faceted filter component
interface FacetedFilterProps {
  title: string;
  selectedValues: string[];
  options: { value: string; label: string }[];
  onSelect: (values: string[]) => void;
}

function FacetedFilter({ title, selectedValues, options, onSelect }: FacetedFilterProps) {
  const handleSelect = (value: string) => {
    if (selectedValues.includes(value)) {
      onSelect(selectedValues.filter((v) => v !== value));
    } else {
      onSelect([...selectedValues, value]);
    }
  };

  const handleClear = () => {
    onSelect([]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          {title}
          {selectedValues.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selectedValues.length}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.length > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedValues.length} selected
                  </Badge>
                ) : (
                  selectedValues.map((value) => {
                    const option = options.find((o) => o.value === value);
                    return (
                      <Badge key={value} variant="secondary" className="rounded-sm px-1 font-normal">
                        {option?.label || value}
                      </Badge>
                    );
                  })
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${title.toLowerCase()}...`} />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="flex items-center gap-2"
                  >
                    <div
                      className={cn(
                        'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.length > 0 && (
              <>
                <Separator />
                <CommandGroup>
                  <CommandItem onSelect={handleClear} className="justify-center text-center">
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function GlobalTransactionsTable({
  transactions,
  page,
  totalPages,
  total,
  isLoading,
  filters,
  onPageChange,
  onFilterChange,
}: GlobalTransactionsTableProps) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() =>
    loadJSON(LS_TX_TABLE_VIS, {})
  );

  useEffect(() => {
    saveJSON(LS_TX_TABLE_VIS, columnVisibility);
  }, [columnVisibility]);

  // Convert single filters to arrays for multi-select
  const selectedDirections = filters?.direction ? [filters.direction] : [];
  const selectedGroups = filters?.groups || [];
  const selectedCurrencies = filters?.currencies || [];
  const selectedStatuses = filters?.statuses || [];

  const hasFilters =
    selectedDirections.length > 0 ||
    selectedGroups.length > 0 ||
    selectedCurrencies.length > 0 ||
    selectedStatuses.length > 0 ||
    !!filters?.search;

  const handleReset = () => {
    onFilterChange({});
  };

  const columns: ColumnDef<GlobalTransactionItem>[] = useMemo(
    () => [
      {
        id: 'type',
        accessorKey: 'group',
        header: 'Type',
        cell: ({ row }) => {
          const group = row.original.group;
          return (
            <div className="flex items-center gap-2" title={getGroupDisplayName(group)}>
              {getTransactionIcon(group)}
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {getGroupDisplayName(group)}
              </span>
            </div>
          );
        },
      },
      {
        id: 'currency',
        accessorKey: 'currency',
        header: 'Currency',
        cell: ({ row }) => {
f          const tx = row.original;
          return (
            <div className="flex items-center gap-2">
              <TokenIcon currency={tx.currency} logoUrl={tx.logoUrl} />
              <span className="font-medium">{tx.currency}</span>
            </div>
          );
        },
      },
      {
        id: 'amount',
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => {
          const tx = row.original;
          const isIncome = tx.direction === 'Income';
          const amount = Math.abs(parseFloat(tx.amount));
          return (
            <span className={`font-mono ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
              {formatAmount(amount, tx.currency)}
            </span>
          );
        },
      },
      {
        id: 'user',
        accessorKey: 'user',
        header: 'User',
        cell: ({ row }) => {
          const tx = row.original;
          return tx.user?.id ? (
            <Link
              to="/users/$userId"
              params={{ userId: tx.user.id.toString() }}
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              <IconUser className="h-3 w-3" />
              {tx.user.nickname || tx.user.email || `User #${tx.user.id}`}
            </Link>
          ) : (
            <span className="text-muted-foreground">-</span>
          );
        },
      },
      {
        id: 'txHash',
        accessorKey: 'txHash',
        header: 'TX Hash',
        cell: ({ row }) => {
          const txHash = row.original.txHash;
          if (!txHash) return <span className="text-muted-foreground">-</span>;
          return (
            <div className="flex items-center gap-1">
              <span className="font-mono text-xs" title={txHash}>
                {truncateAddress(txHash)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(txHash)}
                title="Copy hash"
              >
                <IconCopy className="h-3 w-3" />
              </Button>
            </div>
          );
        },
      },
      {
        id: 'fromAddress',
        accessorKey: 'fromAddress',
        header: 'From',
        cell: ({ row }) => {
          const address = row.original.fromAddress;
          if (!address) return <span className="text-muted-foreground">-</span>;
          return (
            <div className="flex items-center gap-1">
              <span className="font-mono text-xs" title={address}>
                {truncateAddress(address)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(address)}
                title="Copy address"
              >
                <IconCopy className="h-3 w-3" />
              </Button>
            </div>
          );
        },
      },
      {
        id: 'toAddress',
        accessorKey: 'toAddress',
        header: 'To',
        cell: ({ row }) => {
          const address = row.original.toAddress;
          if (!address) return <span className="text-muted-foreground">-</span>;
          return (
            <div className="flex items-center gap-1">
              <span className="font-mono text-xs" title={address}>
                {truncateAddress(address)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(address)}
                title="Copy address"
              >
                <IconCopy className="h-3 w-3" />
              </Button>
            </div>
          );
        },
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        id: 'date',
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const tx = row.original;
          return tx.txHash ? (
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <a
                href={`https://etherscan.io/tx/${tx.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                title="View on Explorer"
              >
                <IconExternalLink className="h-4 w-4" />
              </a>
            </Button>
          ) : null;
        },
        enableHiding: false,
      },
    ],
    []
  );

  const table = useReactTable({
    data: transactions,
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const searchValue = filters?.search || '';

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search hash, address..."
              value={searchValue}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  search: e.target.value || undefined,
                })
              }
              className="h-8 w-[300px] pl-8"
            />
          </div>
          <FacetedFilter
            title="Direction"
            selectedValues={selectedDirections}
            options={directionOptions}
            onSelect={(values) =>
              onFilterChange({
                ...filters,
                direction: values[0] as 'Income' | 'Outgo' | undefined,
              })
            }
          />
          <FacetedFilter
            title="Type"
            selectedValues={selectedGroups}
            options={groupOptions}
            onSelect={(values) =>
              onFilterChange({
                ...filters,
                groups: values.length > 0 ? values : undefined,
              })
            }
          />
          <FacetedFilter
            title="Currency"
            selectedValues={selectedCurrencies}
            options={currencyOptions}
            onSelect={(values) =>
              onFilterChange({
                ...filters,
                currencies: values.length > 0 ? values : undefined,
              })
            }
          />
          <FacetedFilter
            title="Status"
            selectedValues={selectedStatuses}
            options={statusOptions}
            onSelect={(values) =>
              onFilterChange({
                ...filters,
                statuses: values.length > 0 ? values : undefined,
              })
            }
          />
          {hasFilters && (
            <Button
              variant="ghost"
              onClick={handleReset}
              className="h-8 px-2 text-sm leading-5 font-medium lg:px-3"
            >
              Reset
              <Cross2Icon className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
        <DataTableViewOptions table={table} />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-3 py-2">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn('h-11', {
                    'bg-background': row.index % 2 === 0,
                    'bg-muted/20': row.index % 2 !== 0,
                  })}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Showing {transactions.length} of {total.toLocaleString()} transactions
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
