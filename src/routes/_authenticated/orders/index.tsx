import { useState, useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { IconSearch } from '@tabler/icons-react';
import { CheckIcon, PlusCircledIcon, Cross2Icon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { useAdminOrders } from '@/features/orders/api/admin-orders';
import { Skeleton } from '@/components/ui/skeleton';
import { OrdersTableServer } from '@/features/orders/components/orders-table-server';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

export const Route = createFileRoute('/_authenticated/orders/')({
  component: OrdersPage,
});

// Faceted Filter Component
interface FacetedFilterProps {
  title: string;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onSelect: (values: string[]) => void;
  multiple?: boolean;
}

function FacetedFilter({
  title,
  options,
  selectedValues,
  onSelect,
  multiple = true,
}: FacetedFilterProps) {
  const selected = new Set(selectedValues);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          {title}
          {selected.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selected.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selected.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selected.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selected.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (multiple) {
                        const newSet = new Set(selected);
                        if (isSelected) newSet.delete(option.value);
                        else newSet.add(option.value);
                        onSelect(Array.from(newSet));
                      } else {
                        onSelect(isSelected ? [] : [option.value]);
                      }
                    }}
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
            {selected.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={() => onSelect([])} className="justify-center text-center">
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

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'partially_paid', label: 'Partially Paid' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
];

// Actual EPaymentType enum values
const typeOptions = [
  { value: 'card_purchase', label: 'Card Creation' },
  { value: 'card_topup', label: 'Card Topup' },
];

function OrdersPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const limit = 20;

  // Debounce search input
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const { data: orders, isLoading, error, total, totalPages } = useAdminOrders({
    page,
    limit,
    status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
    type: selectedTypes.length > 0 ? selectedTypes : undefined,
    search: debouncedSearch || undefined,
  });

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setPage(1);
  }, []);

  const handleReset = useCallback(() => {
    setSearchInput('');
    setSelectedStatuses([]);
    setSelectedTypes([]);
    setPage(1);
  }, []);

  const isFiltered = searchInput || selectedStatuses.length > 0 || selectedTypes.length > 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Card Orders</h1>
        <p className="text-muted-foreground">
          {total > 0 ? `Manage ${total.toLocaleString()} card orders` : 'Manage card creation and topup orders'}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="relative">
              <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reference, email..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-8 w-[300px] pl-8"
              />
            </div>

            <FacetedFilter
              title="Status"
              options={statusOptions}
              selectedValues={selectedStatuses}
              onSelect={(values) => {
                setSelectedStatuses(values);
                setPage(1);
              }}
            />

            <FacetedFilter
              title="Type"
              options={typeOptions}
              selectedValues={selectedTypes}
              onSelect={(values) => {
                setSelectedTypes(values);
                setPage(1);
              }}
            />

            {isFiltered && (
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

          {/* Table */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              Error loading orders. Please try again.
            </div>
          ) : (
            <OrdersTableServer
              orders={orders}
              page={page}
              totalPages={totalPages}
              total={total}
              onPageChange={setPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
