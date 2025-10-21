import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UsersTable } from '@/features/users/components/users-table';
import { useAdminUsers } from '@/features/users/api/admin-users';
import { Skeleton } from '@/components/ui/skeleton';
import { IconFilter, IconX, IconSearch } from '@tabler/icons-react';
import { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export const Route = createFileRoute('/_authenticated/users/')({
  component: UsersPage,
});

function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [emailVerified, setEmailVerified] = useState<'all' | 'verified' | 'unverified'>('all');
  const [premiumStatus, setPremiumStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [cardStatus, setCardStatus] = useState<'all' | 'has_cards' | 'no_cards'>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Build filters object with stable serialization
  const filters = useMemo(() => {
    const result: any = {};

    if (searchQuery.trim()) {
      result.search = searchQuery.trim();
    }

    if (selectedRoles.length > 0) {
      // Sort roles for stable serialization
      result.roles = [...selectedRoles].sort();
    }

    if (emailVerified !== 'all') {
      result.emailVerified = emailVerified === 'verified';
    }

    if (premiumStatus !== 'all') {
      result.premiumActive = premiumStatus === 'active';
    }

    if (cardStatus !== 'all') {
      result.hasCards = cardStatus === 'has_cards';
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }, [searchQuery, selectedRoles, emailVerified, premiumStatus, cardStatus]);

  const { data, isLoading } = useAdminUsers(1, 100, filters);

  const users = data?.users || [];
  const total = data?.total || 0;

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedRoles.length > 0) count++;
    if (emailVerified !== 'all') count++;
    if (premiumStatus !== 'all') count++;
    if (cardStatus !== 'all') count++;
    return count;
  }, [searchQuery, selectedRoles, emailVerified, premiumStatus, cardStatus]);

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedRoles([]);
    setEmailVerified('all');
    setPremiumStatus('all');
    setCardStatus('all');
  };

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Users Management</h1>
        <p className="text-muted-foreground">
          {total > 0 ? `Manage ${total} platform users and their data` : 'Manage platform users and their data'}
        </p>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Search and Filter Button */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[250px]">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email, nickname, or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <IconFilter className="h-4 w-4" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-1 px-1.5">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Filters</h4>
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllFilters}
                          className="h-auto py-1 px-2 text-xs"
                        >
                          Clear all
                        </Button>
                      )}
                    </div>

                    <Separator />

                    {/* Role Filter */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Role</Label>
                      <div className="space-y-2">
                        {['Client', 'Support', 'Administrator'].map((role) => (
                          <div key={role} className="flex items-center space-x-2">
                            <Checkbox
                              id={`role-${role}`}
                              checked={selectedRoles.includes(role)}
                              onCheckedChange={() => handleRoleToggle(role)}
                            />
                            <Label
                              htmlFor={`role-${role}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {role}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Email Verified Filter */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Email Status</Label>
                      <Select value={emailVerified} onValueChange={(value: any) => setEmailVerified(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="verified">Verified</SelectItem>
                          <SelectItem value="unverified">Unverified</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    {/* Premium Status Filter */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Premium Status</Label>
                      <Select value={premiumStatus} onValueChange={(value: any) => setPremiumStatus(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    {/* Card Status Filter */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Card Status</Label>
                      <Select value={cardStatus} onValueChange={(value: any) => setCardStatus(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="has_cards">Has Cards</SelectItem>
                          <SelectItem value="no_cards">No Cards</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="gap-2"
                >
                  <IconX className="h-4 w-4" />
                  Clear all
                </Button>
              )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {searchQuery.trim() && (
                  <Badge variant="secondary" className="gap-1.5">
                    Search: {searchQuery}
                    <IconX
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => setSearchQuery('')}
                    />
                  </Badge>
                )}
                {selectedRoles.map((role) => (
                  <Badge key={role} variant="secondary" className="gap-1.5">
                    Role: {role}
                    <IconX
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleRoleToggle(role)}
                    />
                  </Badge>
                ))}
                {emailVerified !== 'all' && (
                  <Badge variant="secondary" className="gap-1.5">
                    Email: {emailVerified === 'verified' ? 'Verified' : 'Unverified'}
                    <IconX
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => setEmailVerified('all')}
                    />
                  </Badge>
                )}
                {premiumStatus !== 'all' && (
                  <Badge variant="secondary" className="gap-1.5">
                    Premium: {premiumStatus === 'active' ? 'Active' : 'Inactive'}
                    <IconX
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => setPremiumStatus('all')}
                    />
                  </Badge>
                )}
                {cardStatus !== 'all' && (
                  <Badge variant="secondary" className="gap-1.5">
                    Cards: {cardStatus === 'has_cards' ? 'Has Cards' : 'No Cards'}
                    <IconX
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => setCardStatus('all')}
                    />
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : users.length > 0 ? (
            <UsersTable users={users} />
          ) : (
            <div className="flex flex-col h-32 items-center justify-center gap-2">
              {hasActiveFilters ? (
                <>
                  <p className="text-sm text-muted-foreground">No users match the selected filters</p>
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Clear filters
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No users data available</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
