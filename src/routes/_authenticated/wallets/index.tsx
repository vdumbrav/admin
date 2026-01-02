import { useState, useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IconSearch, IconX, IconRefresh } from '@tabler/icons-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  useWalletStatistics,
  useWalletList,
} from '@/features/wallet/api/admin-wallet';
import {
  WalletStatisticsCards,
  WalletsTable,
} from '@/features/wallet/components';
import type { WalletFilterParams } from '@/features/wallet/types';

export const Route = createFileRoute('/_authenticated/wallets/')({
  component: WalletsPage,
});

function WalletsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const limit = 20;

  // Debounce search input
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  // Build filters object
  const filters: WalletFilterParams = {};
  if (debouncedSearch) {
    filters.search = debouncedSearch;
  }

  const { data: statistics, isLoading: statsLoading, refetch: refetchStats } = useWalletStatistics();
  const { data: walletsData, isLoading: walletsLoading, refetch: refetchWallets } = useWalletList(page, limit, filters);

  const wallets = walletsData?.items || [];
  const total = walletsData?.total || 0;
  const totalPages = walletsData?.totalPages || 1;

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setPage(1);
  }, []);

  const handleReset = useCallback(() => {
    setSearchInput('');
    setPage(1);
  }, []);

  const handleRefresh = useCallback(() => {
    refetchStats();
    refetchWallets();
  }, [refetchStats, refetchWallets]);

  const isFiltered = searchInput.length > 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Custodial Wallets</h1>
          <p className="text-muted-foreground">
            Manage ChangeNow custodial wallets and user balances
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <IconRefresh className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <WalletStatisticsCards statistics={statistics} isLoading={statsLoading} />

      {/* Wallets Table */}
      <Card>
        <CardContent className="pt-6">
          {/* Filters */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by partner ID, name, or user ID..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>

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
          {walletsLoading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <WalletsTable
              wallets={wallets}
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
