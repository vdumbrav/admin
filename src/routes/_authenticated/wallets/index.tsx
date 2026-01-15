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
  IconCoins,
  IconSettings,
} from '@tabler/icons-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
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

// Token imports
import {
  useTokenStatistics,
  useTokenList,
  useTokenNetworks,
  useUpdateToken,
  useBulkPlatformVisibility,
  useBulkFeatureUpdate,
  useSyncFromChangeNow,
} from '@/features/tokens/api/admin-tokens';
import { TokenStatsCards, TokensTable, TokenBulkActions, TokenFiltersToolbar } from '@/features/tokens/components';
import type { TokenFilterParams, UpdateTokenRequest } from '@/features/tokens/types';
import { useBotFeatures, useUpdateBotFeature } from '@/features/bot/api/admin-bot';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/_authenticated/wallets/')({
  component: WalletsPage,
});

function WalletsPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Wallet state
  const [page, setPage] = useState(1);
  const [txPage, setTxPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [txFilters, setTxFilters] = useState<TransactionFilterParams>({});
  const limit = 20;
  const txLimit = 50;

  // Token state
  const [tokenPage, setTokenPage] = useState(1);
  const [tokenFilters, setTokenFilters] = useState<TokenFilterParams>({});
  const [selectedTokenIds, setSelectedTokenIds] = useState<number[]>([]);
  const tokenLimit = 50;

  // Debounce search inputs
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const debouncedTokenSearch = useDebouncedValue(tokenFilters.search || '', 300);

  // Wallet filters
  const filters: WalletFilterParams = {};
  if (debouncedSearch) {
    filters.search = debouncedSearch;
  }

  // Token filters with debounced search
  const effectiveTokenFilters: TokenFilterParams = {
    ...tokenFilters,
    search: debouncedTokenSearch || undefined,
  };

  // Wallet API hooks
  const { data: statistics, isLoading: statsLoading, refetch: refetchStats } = useWalletStatistics();
  const { data: extendedStats, isLoading: extendedStatsLoading, refetch: refetchExtendedStats } = useExtendedWalletStatistics();
  const { data: walletsData, isLoading: walletsLoading, refetch: refetchWallets } = useWalletList(page, limit, filters);
  const { data: transactionsData, isLoading: txLoading, refetch: refetchTransactions } = useGlobalTransactions(txPage, txLimit, txFilters);

  // Token API hooks
  const { data: tokenStats, isLoading: tokenStatsLoading, refetch: refetchTokenStats } = useTokenStatistics();
  const { data: tokensData, isLoading: tokensLoading, refetch: refetchTokens } = useTokenList(tokenPage, tokenLimit, effectiveTokenFilters);
  const { data: networks } = useTokenNetworks();
  const updateTokenMutation = useUpdateToken();
  const bulkPlatformMutation = useBulkPlatformVisibility();
  const bulkFeatureMutation = useBulkFeatureUpdate();
  const syncMutation = useSyncFromChangeNow();

  // Bot features
  const { data: botFeatures, isLoading: botFeaturesLoading, refetch: refetchBotFeatures } = useBotFeatures();
  const updateBotFeatureMutation = useUpdateBotFeature();

  // Wallet data
  const wallets = walletsData?.items || [];
  const total = walletsData?.total || 0;
  const totalPages = walletsData?.totalPages || 1;

  const transactions = transactionsData?.items || [];
  const txTotal = transactionsData?.total || 0;
  const txTotalPages = transactionsData?.totalPages || 1;

  // Token data
  const tokens = tokensData?.items || [];
  const tokenTotal = tokensData?.total || 0;
  const tokenTotalPages = tokensData?.totalPages || 1;

  // Wallet handlers
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
    refetchTokenStats();
    refetchTokens();
    refetchBotFeatures();
  }, [refetchStats, refetchExtendedStats, refetchWallets, refetchTransactions, refetchTokenStats, refetchTokens, refetchBotFeatures]);

  const handleToggleWalletFeature = useCallback(async (enabled: boolean) => {
    try {
      await updateBotFeatureMutation.mutateAsync({ feature: 'wallet', enabled });
      toast.success(`Wallet feature ${enabled ? 'enabled' : 'disabled'} in bot`);
    } catch (error) {
      toast.error('Failed to update wallet feature');
    }
  }, [updateBotFeatureMutation]);

  const handleToggleBuySellFeature = useCallback(async (enabled: boolean) => {
    try {
      await updateBotFeatureMutation.mutateAsync({ feature: 'buySell', enabled });
      toast.success(`Buy/Sell feature ${enabled ? 'enabled' : 'disabled'} in bot`);
    } catch (error) {
      toast.error('Failed to update Buy/Sell feature');
    }
  }, [updateBotFeatureMutation]);

  const handleToggleIconSource = useCallback(async (useCdn: boolean) => {
    try {
      const newSource = useCdn ? 'cdn' : 'changenow';
      await updateBotFeatureMutation.mutateAsync({ feature: 'iconSource', value: newSource });
      toast.success(`Icon source changed to ${useCdn ? 'Walme CDN' : 'ChangeNow'}`);
    } catch (error) {
      toast.error('Failed to update icon source');
    }
  }, [updateBotFeatureMutation]);

  const handleToggleWithdrawViaMaster = useCallback(async (enabled: boolean) => {
    try {
      await updateBotFeatureMutation.mutateAsync({ feature: 'withdrawViaMaster', enabled });
      toast.success(`Withdraw via Master Account ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update withdraw via master setting');
    }
  }, [updateBotFeatureMutation]);

  const handleTxFilterChange = useCallback((newFilters: TransactionFilterParams) => {
    setTxFilters(newFilters);
    setTxPage(1);
  }, []);

  // Token handlers
  const handleTokenFiltersChange = useCallback((newFilters: TokenFilterParams) => {
    setTokenFilters(newFilters);
    setTokenPage(1);
  }, []);

  const handleTokenReset = useCallback(() => {
    setTokenFilters({});
    setTokenPage(1);
    setSelectedTokenIds([]);
  }, []);

  const handleSelectToken = useCallback((id: number, selected: boolean) => {
    setSelectedTokenIds((prev) =>
      selected ? [...prev, id] : prev.filter((i) => i !== id)
    );
  }, []);

  const handleSelectAllTokens = useCallback(
    (selected: boolean) => {
      setSelectedTokenIds(selected ? tokens.map((t) => t.id) : []);
    },
    [tokens]
  );

  const handleUpdateToken = useCallback(
    async (id: number, data: UpdateTokenRequest) => {
      await updateTokenMutation.mutateAsync({ id, ...data });
    },
    [updateTokenMutation]
  );

  const handleBulkPlatformUpdate = useCallback(
    async (platform: 'web' | 'mobile' | 'telegram', visible: boolean) => {
      if (selectedTokenIds.length === 0) return;

      try {
        await bulkPlatformMutation.mutateAsync({
          tokenIds: selectedTokenIds,
          platform,
          visible,
        });
        toast.success(
          `${selectedTokenIds.length} tokens ${visible ? 'shown' : 'hidden'} on ${platform}`
        );
        setSelectedTokenIds([]);
      } catch (error) {
        toast.error('Failed to update tokens');
      }
    },
    [selectedTokenIds, bulkPlatformMutation]
  );

  const handleBulkFeatureUpdate = useCallback(
    async (feature: 'deposit' | 'withdraw' | 'exchange', enabled: boolean) => {
      if (selectedTokenIds.length === 0) return;

      try {
        await bulkFeatureMutation.mutateAsync({
          tokenIds: selectedTokenIds,
          feature,
          enabled,
        });
        toast.success(
          `${feature} ${enabled ? 'enabled' : 'disabled'} for ${selectedTokenIds.length} tokens`
        );
        setSelectedTokenIds([]);
      } catch (error) {
        toast.error('Failed to update tokens');
      }
    },
    [selectedTokenIds, bulkFeatureMutation]
  );

  const handleSyncTokens = useCallback(async () => {
    try {
      const result = await syncMutation.mutateAsync();
      toast.success(
        `Sync complete: ${result.data.added} added, ${result.data.updated} updated`
      );
    } catch (error) {
      toast.error('Failed to sync tokens from ChangeNow');
    }
  }, [syncMutation]);

  const isFiltered = searchInput.length > 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Custodial Wallets</h1>
          <p className="text-muted-foreground">
            Manage ChangeNow custodial wallets, balances, transactions and tokens
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <IconRefresh className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-xl grid-cols-5">
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
          <TabsTrigger value="tokens" className="gap-2">
            <IconCoins className="h-4 w-4" />
            Tokens
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <IconSettings className="h-4 w-4" />
            Settings
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

        {/* Tokens Tab */}
        <TabsContent value="tokens" className="mt-6">
          <div className="space-y-6">
            {/* Token Statistics */}
            <TokenStatsCards statistics={tokenStats} isLoading={tokenStatsLoading} />

            {/* Tokens Table */}
            <Card>
              <CardContent className="pt-6">
                {/* Filters Toolbar */}
                <TokenFiltersToolbar
                  filters={tokenFilters}
                  networks={networks || []}
                  onFiltersChange={handleTokenFiltersChange}
                  onReset={handleTokenReset}
                  onSync={handleSyncTokens}
                  isSyncing={syncMutation.isPending}
                >
                  <TokenBulkActions
                    selectedCount={selectedTokenIds.length}
                    onBulkPlatformUpdate={handleBulkPlatformUpdate}
                    onBulkFeatureUpdate={handleBulkFeatureUpdate}
                    disabled={bulkPlatformMutation.isPending || bulkFeatureMutation.isPending}
                  />
                </TokenFiltersToolbar>

                {/* Tokens Table */}
                {tokensLoading ? (
                  <div className="space-y-3">
                    {[...Array(10)].map((_, i) => (
                      <Skeleton key={i} className="h-14 w-full" />
                    ))}
                  </div>
                ) : (
                  <TokensTable
                    tokens={tokens}
                    page={tokenPage}
                    totalPages={tokenTotalPages}
                    total={tokenTotal}
                    selectedIds={selectedTokenIds}
                    onPageChange={setTokenPage}
                    onSelectToken={handleSelectToken}
                    onSelectAll={handleSelectAllTokens}
                    onUpdateToken={handleUpdateToken}
                    isUpdating={updateTokenMutation.isPending}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Bot Feature Toggles</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Enable or disable wallet features in the Telegram bot
                  </p>
                </div>

                {botFeaturesLoading ? (
                  <Skeleton className="h-12 w-full max-w-md" />
                ) : (
                  <div className="space-y-4">
                    {/* Wallet Toggle */}
                    <div className="flex items-center justify-between max-w-md p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="wallet-toggle" className="text-base font-medium">
                          Enable Wallet in Bot
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Allow users to access custodial wallet features in the Telegram bot
                        </p>
                      </div>
                      <Switch
                        id="wallet-toggle"
                        checked={botFeatures?.wallet ?? false}
                        onCheckedChange={handleToggleWalletFeature}
                        disabled={updateBotFeatureMutation.isPending}
                      />
                    </div>

                    {/* Buy/Sell Toggle */}
                    <div className="flex items-center justify-between max-w-md p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="buysell-toggle" className="text-base font-medium">
                          Enable Buy/Sell in Bot
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Allow users to buy and sell crypto via Onramper in the Telegram bot
                        </p>
                      </div>
                      <Switch
                        id="buysell-toggle"
                        checked={botFeatures?.buySell ?? false}
                        onCheckedChange={handleToggleBuySellFeature}
                        disabled={updateBotFeatureMutation.isPending}
                      />
                    </div>

                    {/* Icon Source Toggle */}
                    <div className="flex items-center justify-between max-w-md p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="icon-source-toggle" className="text-base font-medium">
                          Use Walme CDN for Icons
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Toggle between Walme CDN (PNG with network) and ChangeNow (SVG)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Current: <span className="font-medium">{botFeatures?.iconSource === 'cdn' ? 'Walme CDN' : 'ChangeNow'}</span>
                        </p>
                      </div>
                      <Switch
                        id="icon-source-toggle"
                        checked={botFeatures?.iconSource === 'cdn'}
                        onCheckedChange={handleToggleIconSource}
                        disabled={updateBotFeatureMutation.isPending}
                      />
                    </div>

                    {/* Withdraw via Master Account Toggle */}
                    <div className="flex items-center justify-between max-w-md p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="withdraw-master-toggle" className="text-base font-medium">
                          Withdraw via Master Account
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Route withdrawals through master account (for sub-partners without direct withdrawal permission)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Current: <span className="font-medium">{botFeatures?.withdrawViaMaster ? 'Enabled' : 'Disabled'}</span>
                        </p>
                      </div>
                      <Switch
                        id="withdraw-master-toggle"
                        checked={botFeatures?.withdrawViaMaster ?? false}
                        onCheckedChange={handleToggleWithdrawViaMaster}
                        disabled={updateBotFeatureMutation.isPending}
                      />
                    </div>

                    {botFeatures?.updatedAt && (
                      <p className="text-xs text-muted-foreground">
                        Last updated: {new Date(botFeatures.updatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
