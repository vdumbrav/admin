import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BalanceCards } from './BalanceCards';
import { CreateTopupDialog } from './CreateTopupDialog';
import { CreateCryptoTopupDialog } from './CreateCryptoTopupDialog';
import { TopupsTable } from './TopupsTable';
import { BalanceSettings } from './BalanceSettings';
import { useTrcTopups, useBalanceInfo } from '../hooks/useTrcTopups';

// TODO: Get actual auth token from your auth system
const MOCK_AUTH_TOKEN = 'your-auth-token-here';

export function AdscardBalancePage() {
  const [selectedTab, setSelectedTab] = useState('all');

  // Fetch data
  const balanceInfo = useBalanceInfo(MOCK_AUTH_TOKEN);
  const allTopups = useTrcTopups(MOCK_AUTH_TOKEN);
  const pendingTopups = useTrcTopups(MOCK_AUTH_TOKEN, { status: 'pending' });

  // Determine which topups to show based on selected tab
  const displayTopups =
    selectedTab === 'pending' ? pendingTopups.data : allTopups.data;
  const isLoading =
    selectedTab === 'pending' ? pendingTopups.isLoading : allTopups.isLoading;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ADScard Master Balance</h1>
          <p className="text-muted-foreground">
            Manage master wallet TRC topups and balance
          </p>
        </div>
        <div className="flex gap-2">
          <CreateCryptoTopupDialog />
          <CreateTopupDialog authToken={MOCK_AUTH_TOKEN} />
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
            <TabsTrigger value="all">All Topups</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingTopups.data?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <TopupsTable
              topups={displayTopups}
              isLoading={isLoading}
              authToken={MOCK_AUTH_TOKEN}
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <TopupsTable
              topups={displayTopups}
              isLoading={isLoading}
              authToken={MOCK_AUTH_TOKEN}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <BalanceSettings authToken={MOCK_AUTH_TOKEN} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
