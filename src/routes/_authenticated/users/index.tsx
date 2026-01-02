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
import { CheckIcon, PlusCircledIcon } from '@radix-ui/react-icons';
import { Cross2Icon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { useAdminUsers, type UsersFilterParams } from '@/features/users/api/admin-users';
import { Skeleton } from '@/components/ui/skeleton';
import { UsersTableServer } from '@/features/users/components/users-table-server';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

export const Route = createFileRoute('/_authenticated/users/')({
  component: UsersPage,
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

const roleOptions = [
  { value: 'Client', label: 'Client' },
  { value: 'Administrator', label: 'Administrator' },
  { value: 'Support', label: 'Support' },
];

const emailVerifiedOptions = [
  { value: 'verified', label: 'Verified' },
  { value: 'not-verified', label: 'Not Verified' },
];

const premiumOptions = [
  { value: 'active', label: 'Premium Active' },
  { value: 'inactive', label: 'No Premium' },
];

// Auth providers from EUserAuthIdentityProviders enum
const providerOptions = [
  { value: 'telegram', label: 'Telegram' },
  { value: 'google-oauth2', label: 'Google' },
  { value: 'apple', label: 'Apple' },
  { value: 'discord', label: 'Discord' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'matrix', label: 'Matrix' },
  { value: 'email', label: 'Email' },
  { value: 'keycloak', label: 'Keycloak' },
  { value: 'solana', label: 'Solana Wallet' },
  { value: 'evm', label: 'EVM Wallet' },
];

function UsersPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedEmailStatus, setSelectedEmailStatus] = useState<string[]>([]);
  const [selectedPremium, setSelectedPremium] = useState<string[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const limit = 20;

  // Debounce search input to avoid too many API calls
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  // Build filters object
  const filters: UsersFilterParams = {};
  if (debouncedSearch) {
    filters.search = debouncedSearch;
  }
  if (selectedRoles.length > 0) {
    filters.roles = selectedRoles;
  }
  if (selectedEmailStatus.includes('verified')) {
    filters.emailVerified = true;
  } else if (selectedEmailStatus.includes('not-verified')) {
    filters.emailVerified = false;
  }
  if (selectedPremium.includes('active')) {
    filters.premiumActive = true;
  } else if (selectedPremium.includes('inactive')) {
    filters.premiumActive = false;
  }
  if (selectedProviders.length > 0) {
    filters.providers = selectedProviders;
  }

  const { data, isLoading, error } = useAdminUsers(page, limit, filters);

  const users = data?.users || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setPage(1);
  }, []);

  const handleReset = useCallback(() => {
    setSearchInput('');
    setSelectedRoles([]);
    setSelectedEmailStatus([]);
    setSelectedPremium([]);
    setSelectedProviders([]);
    setPage(1);
  }, []);

  const isFiltered = searchInput || selectedRoles.length > 0 || selectedEmailStatus.length > 0 || selectedPremium.length > 0 || selectedProviders.length > 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Users Management</h1>
        <p className="text-muted-foreground">
          {total > 0 ? `Manage ${total.toLocaleString()} platform users and their data` : 'Manage platform users and their data'}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="relative">
              <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search email, name, ref code..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-8 w-[300px] pl-8"
              />
            </div>

            <FacetedFilter
              title="Role"
              options={roleOptions}
              selectedValues={selectedRoles}
              onSelect={(values) => {
                setSelectedRoles(values);
                setPage(1);
              }}
            />

            <FacetedFilter
              title="Email"
              options={emailVerifiedOptions}
              selectedValues={selectedEmailStatus}
              onSelect={(values) => {
                setSelectedEmailStatus(values);
                setPage(1);
              }}
              multiple={false}
            />

            <FacetedFilter
              title="Premium"
              options={premiumOptions}
              selectedValues={selectedPremium}
              onSelect={(values) => {
                setSelectedPremium(values);
                setPage(1);
              }}
              multiple={false}
            />

            <FacetedFilter
              title="Connected"
              options={providerOptions}
              selectedValues={selectedProviders}
              onSelect={(values) => {
                setSelectedProviders(values);
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
              Error loading users. Please try again.
            </div>
          ) : (
            <UsersTableServer
              users={users}
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
