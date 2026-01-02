import { useState, useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  IconSearch,
  IconX,
  IconRefresh,
  IconLayoutDashboard,
  IconWallet,
  IconActivity,
} from '@tabler/icons-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  useWalletStatistics,
  useWalletList,
  useExtendedWalletStatistics,
  useGlobalTransactions,
} from '@/features/wallet/api/admin-wallet';
import {
  WalletStatisticsCards,
  WalletsTable,
  WalletDashboard,
  GlobalTransactionsTable,
} from '@/features/wallet/components';
import type { WalletFilterParams, TransactionFilterParams } from '@/features/wallet/types';

export const Route = createFileRoute('/_authenticated/wallets/')({
  component: WalletsPage,
});

function WalletsPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [page, setPage] = useState(1);
  const [txPage, setTxPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [txFilters, setTxFilters] = useState<TransactionFilterParams>({});
  const limit = 20;
  const txLimit = 50;

  // Debounce search input
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  // Build filters object
  const filters: WalletFilterParams = {};
  if (debouncedSearch) {
    filters.search = debouncedSearch;
  }

  // API hooks
  const { data: statistics, isLoading: statsLoading, refetch: refetchStats } = useWalletStatistics();
  const { data: extendedStats, isLoading: extendedStatsLoading, refetch: refetchExtendedStats } = useExtendedWalletStatistics();
  const { data: walletsData, isLoading: walletsLoading, refetch: refetchWallets } = useWalletList(page, limit, filters);
  const { data: transactionsData, isLoading: txLoading, refetch: refetchTransactions } = useGlobalTransactions(txPage, txLimit, txFilters);

  const wallets = walletsData?.items || [];
  const total = walletsData?.total || 0;
  const totalPages = walletsData?.totalPages || 1;

  const transactions = transactionsData?.items || [];
  const txTotal = transactionsData?.total || 0;
  const txTotalPages = transactionsData?.totalPages || 1;

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
    refetchExtendedStats();
    refetchWallets();
    refetchTransactions();
  }, [refetchStats, refetchExtendedStats, refetchWallets, refetchTransactions]);

  const handleTxFilterChange = useCallback((newFilters: TransactionFilterParams) => {
    setTxFilters(newFilters);
    setTxPage(1);
  }, []);

  const isFiltered = searchInput.length > 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Custodial Wallets</h1>
          <p className="text-muted-foreground">
            Manage ChangeNow custodial wallets, balances and transactions
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <IconRefresh className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="dashboard" className="gap-2">
            <IconLayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="wallets" className="gap-2">
            <IconWallet className="h-4 w-4" />
            Wallets
          </TabsTrigger>
          <TabsTrigger value="transactions" className="gap-2">
            <IconActivity className="h-4 w-4" />
            Transactions
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-6">
          <WalletDashboard
            statistics={extendedStats}
            isLoading={extendedStatsLoading}
          />
        </TabsContent>

        {/* Wallets Tab */}
        <TabsContent value="wallets" className="mt-6">
          <div className="space-y-6">
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
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <GlobalTransactionsTable
                transactions={transactions}
                page={txPage}
                totalPages={txTotalPages}
                total={txTotal}
                isLoading={txLoading}
                filters={txFilters}
                onPageChange={setTxPage}
                onFilterChange={handleTxFilterChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
