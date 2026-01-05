import { useState, useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CardsTable } from '@/features/cards/components/cards-table';
import { useAdminCards } from '@/features/cards/api/admin-cards';
import { useBotFeatures, useUpdateBotFeature } from '@/features/bot/api/admin-bot';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { IconCreditCard, IconSettings, IconRefresh } from '@tabler/icons-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/cards/')({
  component: CardsPage,
});

function CardsPage() {
  const [activeTab, setActiveTab] = useState('cards');

  const { data, isLoading, refetch: refetchCards } = useAdminCards();
  const { data: botFeatures, isLoading: botFeaturesLoading, refetch: refetchBotFeatures } = useBotFeatures();
  const updateBotFeatureMutation = useUpdateBotFeature();

  const cards = data?.cards || [];
  const total = data?.total || 0;

  const handleRefresh = useCallback(() => {
    refetchCards();
    refetchBotFeatures();
  }, [refetchCards, refetchBotFeatures]);

  const handleToggleCardsFeature = useCallback(async (enabled: boolean) => {
    try {
      await updateBotFeatureMutation.mutateAsync({ feature: 'cards', enabled });
      toast.success(`Cards feature ${enabled ? 'enabled' : 'disabled'} in bot`);
    } catch (error) {
      toast.error('Failed to update cards feature');
    }
  }, [updateBotFeatureMutation]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cards Management</h1>
          <p className="text-muted-foreground">
            {total > 0
              ? `Manage ${total} user cards, topup balances, freeze/unfreeze, and block cards`
              : 'Manage user cards, topup balances, freeze/unfreeze, and block cards'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <IconRefresh className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="cards" className="gap-2">
            <IconCreditCard className="h-4 w-4" />
            Cards
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <IconSettings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Cards Tab */}
        <TabsContent value="cards" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <CardsTable cards={cards} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Bot Feature Toggles</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Enable or disable cards features in the Telegram bot
                  </p>
                </div>

                {botFeaturesLoading ? (
                  <Skeleton className="h-12 w-full max-w-md" />
                ) : (
                  <div className="flex items-center justify-between max-w-md p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="cards-toggle" className="text-base font-medium">
                        Enable Cards in Bot
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow users to access virtual card features in the Telegram bot
                      </p>
                      {botFeatures?.updatedAt && (
                        <p className="text-xs text-muted-foreground">
                          Last updated: {new Date(botFeatures.updatedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Switch
                      id="cards-toggle"
                      checked={botFeatures?.cards ?? false}
                      onCheckedChange={handleToggleCardsFeature}
                      disabled={updateBotFeatureMutation.isPending}
                    />
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
