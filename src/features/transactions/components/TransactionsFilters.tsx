import { CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons';
import { Cross2Icon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Separator } from '@/components/ui/separator';
import { IconSearch } from '@tabler/icons-react';
import type { TransactionFilters } from '../types';

interface TransactionsFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
}

const typeOptions = [
  { value: 'deposit', label: 'Deposit' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'swap', label: 'Swap' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'refund', label: 'Refund' },
];

const sourceOptions = [
  { value: 'internal', label: 'Internal' },
  { value: 'external', label: 'External' },
  { value: 'card', label: 'Card' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'fiat', label: 'Fiat' },
];

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

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

export function TransactionsFilters({
  filters,
  onFiltersChange,
}: TransactionsFiltersProps) {
  const selectedTypes = filters.types || (filters.type ? [filters.type] : []);
  const selectedSources = filters.sources || (filters.source ? [filters.source] : []);
  const selectedStatuses = filters.statuses || (filters.status ? [filters.status] : []);

  const hasFilters =
    selectedTypes.length > 0 ||
    selectedSources.length > 0 ||
    selectedStatuses.length > 0 ||
    filters.search;

  const handleClearFilters = () => {
    onFiltersChange({
      page: 1,
      itemsPerPage: filters.itemsPerPage,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative">
        <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search transactions..."
          value={filters.search || ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              search: e.target.value || undefined,
              page: 1,
            })
          }
          className="h-8 w-[300px] pl-8"
        />
      </div>

      {/* Type Filter */}
      <FacetedFilter
        title="Type"
        options={typeOptions}
        selectedValues={selectedTypes}
        onSelect={(values) =>
          onFiltersChange({
            ...filters,
            types: values.length > 0 ? values : undefined,
            type: undefined,
            page: 1,
          })
        }
      />

      {/* Source Filter */}
      <FacetedFilter
        title="Source"
        options={sourceOptions}
        selectedValues={selectedSources}
        onSelect={(values) =>
          onFiltersChange({
            ...filters,
            sources: values.length > 0 ? values : undefined,
            source: undefined,
            page: 1,
          })
        }
      />

      {/* Status Filter */}
      <FacetedFilter
        title="Status"
        options={statusOptions}
        selectedValues={selectedStatuses}
        onSelect={(values) =>
          onFiltersChange({
            ...filters,
            statuses: values.length > 0 ? values : undefined,
            status: undefined,
            page: 1,
          })
        }
      />

      {/* Reset Button */}
      {hasFilters && (
        <Button
          variant="ghost"
          onClick={handleClearFilters}
          className="h-8 px-2 text-sm leading-5 font-medium lg:px-3"
        >
          Reset
          <Cross2Icon className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
