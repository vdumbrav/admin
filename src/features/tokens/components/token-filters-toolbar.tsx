import { Cross2Icon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Separator } from '@/components/ui/separator';
import { CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import {
  IconSearch,
  IconCloudDownload,
  IconCheck,
} from '@tabler/icons-react';
import type { TokenFilterParams } from '../types';
import {
  getNetworkLabel,
  isCustodySupported,
  statusOptions,
  featureOptions,
} from '../data/data';

interface TokenFiltersToolbarProps {
  filters: TokenFilterParams;
  networks: string[];
  onFiltersChange: (filters: TokenFilterParams) => void;
  onReset: () => void;
  onSync: () => void;
  isSyncing: boolean;
  children?: React.ReactNode;
}

export function TokenFiltersToolbar({
  filters,
  networks,
  onFiltersChange,
  onReset,
  onSync,
  isSyncing,
  children,
}: TokenFiltersToolbarProps) {
  const hasFilters =
    filters.search ||
    (filters.networks && filters.networks.length > 0) ||
    filters.isActive !== undefined ||
    filters.visibleOnWeb !== undefined ||
    filters.visibleOnMobile !== undefined ||
    filters.visibleOnTelegram !== undefined ||
    filters.depositEnabled !== undefined ||
    filters.withdrawEnabled !== undefined ||
    filters.exchangeEnabled !== undefined;

  // Sort networks: custody-supported first, then alphabetically by label
  const sortedNetworks = [...networks].sort((a, b) => {
    const aSupported = isCustodySupported(a);
    const bSupported = isCustodySupported(b);
    if (aSupported !== bSupported) {
      return aSupported ? -1 : 1;
    }
    return getNetworkLabel(a).localeCompare(getNetworkLabel(b));
  });

  return (
    <div className="flex flex-col gap-4 mb-4">
      {/* Search Row */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by symbol or name..."
            value={filters.search || ''}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value || undefined })
            }
            className="pl-9"
          />
        </div>

        <div className="flex-1" />

        {children}

        <Button
          variant="outline"
          size="sm"
          onClick={onSync}
          disabled={isSyncing}
        >
          <IconCloudDownload className="h-4 w-4 mr-2" />
          {isSyncing ? 'Syncing...' : 'Sync from CN'}
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Network Filter */}
        <NetworkFilter
          networks={sortedNetworks}
          selectedNetworks={filters.networks || []}
          onSelect={(networks) =>
            onFiltersChange({ ...filters, networks: networks.length > 0 ? networks : undefined })
          }
        />

        {/* Status Filter */}
        <FacetedFilter
          title="Status"
          value={filters.isActive?.toString()}
          options={statusOptions}
          onSelect={(value) =>
            onFiltersChange({
              ...filters,
              isActive: value === undefined ? undefined : value === 'true',
            })
          }
        />

        {/* Deposit Filter */}
        <FacetedFilter
          title="Deposit"
          value={filters.depositEnabled?.toString()}
          options={featureOptions}
          onSelect={(value) =>
            onFiltersChange({
              ...filters,
              depositEnabled: value === undefined ? undefined : value === 'true',
            })
          }
        />

        {/* Withdraw Filter */}
        <FacetedFilter
          title="Withdraw"
          value={filters.withdrawEnabled?.toString()}
          options={featureOptions}
          onSelect={(value) =>
            onFiltersChange({
              ...filters,
              withdrawEnabled: value === undefined ? undefined : value === 'true',
            })
          }
        />

        {/* Exchange Filter */}
        <FacetedFilter
          title="Exchange"
          value={filters.exchangeEnabled?.toString()}
          options={featureOptions}
          onSelect={(value) =>
            onFiltersChange({
              ...filters,
              exchangeEnabled: value === undefined ? undefined : value === 'true',
            })
          }
        />

        {/* Web Visibility Filter */}
        <FacetedFilter
          title="Web"
          value={filters.visibleOnWeb?.toString()}
          options={featureOptions.map((o) => ({
            value: o.value,
            label: o.value === 'true' ? 'Visible' : 'Hidden',
          }))}
          onSelect={(value) =>
            onFiltersChange({
              ...filters,
              visibleOnWeb: value === undefined ? undefined : value === 'true',
            })
          }
        />

        {/* Mobile Visibility Filter */}
        <FacetedFilter
          title="Mobile"
          value={filters.visibleOnMobile?.toString()}
          options={featureOptions.map((o) => ({
            value: o.value,
            label: o.value === 'true' ? 'Visible' : 'Hidden',
          }))}
          onSelect={(value) =>
            onFiltersChange({
              ...filters,
              visibleOnMobile: value === undefined ? undefined : value === 'true',
            })
          }
        />

        {/* Telegram Visibility Filter */}
        <FacetedFilter
          title="Telegram"
          value={filters.visibleOnTelegram?.toString()}
          options={featureOptions.map((o) => ({
            value: o.value,
            label: o.value === 'true' ? 'Visible' : 'Hidden',
          }))}
          onSelect={(value) =>
            onFiltersChange({
              ...filters,
              visibleOnTelegram: value === undefined ? undefined : value === 'true',
            })
          }
        />

        {hasFilters && (
          <Button
            variant="ghost"
            onClick={onReset}
            className="h-8 px-2 text-sm leading-5 font-medium lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Network filter with search and multi-select
interface NetworkFilterProps {
  networks: string[];
  selectedNetworks: string[];
  onSelect: (networks: string[]) => void;
}

function NetworkFilter({ networks, selectedNetworks, onSelect }: NetworkFilterProps) {
  const handleSelect = (network: string) => {
    if (selectedNetworks.includes(network)) {
      onSelect(selectedNetworks.filter((n) => n !== network));
    } else {
      onSelect([...selectedNetworks, network]);
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
          Network
          {selectedNetworks.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selectedNetworks.length}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedNetworks.length > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedNetworks.length} selected
                  </Badge>
                ) : (
                  selectedNetworks.map((network) => (
                    <Badge key={network} variant="secondary" className="rounded-sm px-1 font-normal">
                      {getNetworkLabel(network)}
                    </Badge>
                  ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search network..." />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No network found.</CommandEmpty>
            <CommandGroup>
              {networks.map((network) => {
                const isSelected = selectedNetworks.includes(network);
                const isSupported = isCustodySupported(network);
                return (
                  <CommandItem
                    key={network}
                    onSelect={() => handleSelect(network)}
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
                    <span className="flex-1">{getNetworkLabel(network)}</span>
                    {isSupported && (
                      <IconCheck className="h-3 w-3 text-green-500" />
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedNetworks.length > 0 && (
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

// Simple faceted filter
interface FacetedFilterProps {
  title: string;
  value?: string;
  options: { value: string; label: string }[];
  onSelect: (value: string | undefined) => void;
}

function FacetedFilter({ title, value, options, onSelect }: FacetedFilterProps) {
  const selectedOption = options.find((o) => o.value === value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          {title}
          {selectedOption && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                {selectedOption.label}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[150px] p-0" align="start">
        <Command>
          <CommandList>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value === option.value;
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => onSelect(isSelected ? undefined : option.value)}
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
