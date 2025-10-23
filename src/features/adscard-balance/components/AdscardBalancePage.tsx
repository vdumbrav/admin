import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BalanceCards } from './BalanceCards';
import { CreateCryptoTopupDialog } from './CreateCryptoTopupDialog';
import { TopupsTable } from './TopupsTable';
import { BalanceSettings } from './BalanceSettings';
import { useTrcTopups, useBalanceInfo } from '../hooks/useTrcTopups';
import type { TrcTopupData } from '../types/api';

export function AdscardBalancePage() {
  const [selectedTab, setSelectedTab] = useState('all');

  // Fetch data (no auth token needed - backend uses config token)
  const balanceInfo = useBalanceInfo();
  const allTopups = useTrcTopups();
  const pendingTopups = useTrcTopups({ status: 'pending' });

  // Data is already an array from the hook
  const allTopupsArray = allTopups.data || [];
  const pendingTopupsArray = pendingTopups.data || [];

  // Determine which topups to show based on selected tab
  const displayTopups =
    selectedTab === 'pending' ? pendingTopupsArray : allTopupsArray;
  const isLoading =
    selectedTab === 'pending' ? pendingTopups.isLoading : allTopups.isLoading;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ADScard Master Balance</h1>
          <p className="text-muted-foreground">
            Manage master wallet TRC20/ERC20 topups and balance
          </p>
        </div>
        <div className="flex gap-2">
          <CreateCryptoTopupDialog />
        </div>
      </div>

      {/* Balance Cards */}
      <BalanceCards
        balance={balanceInfo.data}
        isLoading={balanceInfo.isLoading}
      />

      {/* Topups Table with Tabs */}
      <div>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="all">All Crypto Topups</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingTopupsArray?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <TopupsTable
              topups={displayTopups}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <TopupsTable
              topups={displayTopups}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <BalanceSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
