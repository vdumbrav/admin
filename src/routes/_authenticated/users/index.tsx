import { useState, useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useAdminUsers, type UsersFilterParams } from '@/features/users/api/admin-users';
import { Skeleton } from '@/components/ui/skeleton';
import { UsersTableServer } from '@/features/users/components/users-table-server';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

export const Route = createFileRoute('/_authenticated/users/')({
  component: UsersPage,
});

function UsersPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<string>('all');
  const limit = 20;

  // Debounce search input to avoid too many API calls
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  // Build filters object
  const filters: UsersFilterParams = {};
  if (debouncedSearch) {
    filters.search = debouncedSearch;
  }
  if (roleFilter !== 'all') {
    filters.roles = [roleFilter];
  }
  if (emailVerifiedFilter === 'verified') {
    filters.emailVerified = true;
  } else if (emailVerifiedFilter === 'not-verified') {
    filters.emailVerified = false;
  }

  const { data, isLoading, error } = useAdminUsers(page, limit, filters);

  const users = data?.users || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setPage(1); // Reset to first page on search
  }, []);

  const handleRoleChange = useCallback((value: string) => {
    setRoleFilter(value);
    setPage(1);
  }, []);

  const handleEmailVerifiedChange = useCallback((value: string) => {
    setEmailVerifiedFilter(value);
    setPage(1);
  }, []);

  const handleReset = useCallback(() => {
    setSearchInput('');
    setRoleFilter('all');
    setEmailVerifiedFilter('all');
    setPage(1);
  }, []);

  const isFiltered = searchInput || roleFilter !== 'all' || emailVerifiedFilter !== 'all';

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
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, nickname, name..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={roleFilter} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Client">Client</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Moderator">Moderator</SelectItem>
              </SelectContent>
            </Select>

            <Select value={emailVerifiedFilter} onValueChange={handleEmailVerifiedChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Email Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="not-verified">Not Verified</SelectItem>
              </SelectContent>
            </Select>

            {isFiltered && (
              <Button
                variant="ghost"
                onClick={handleReset}
                className="h-9 px-2"
              >
                Reset
                <IconX className="ml-2 h-4 w-4" />
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
