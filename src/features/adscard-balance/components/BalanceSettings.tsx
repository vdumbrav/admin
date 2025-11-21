import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IconCreditCard,
  IconPercentage,
  IconWallet,
  IconSettings,
  IconCheck,
  IconLoader2,
  IconRefresh,
  IconAlertTriangle,
} from '@tabler/icons-react';
import {
  getBalanceSettings,
  updateBalanceSettings,
  getBalanceStatus,
  triggerAutoTopup,
  type BalanceSettingsData,
  type UpdateBalanceSettingsRequest,
} from '../api/adscard-balance';

interface BalanceSettingsProps {
  authToken?: string;
}

export function BalanceSettings({ authToken: _authToken }: BalanceSettingsProps) {
  const queryClient = useQueryClient();

  // Local state for form inputs
  const [minTopupAmount, setMinTopupAmount] = useState('50');
  const [maxTopupAmount, setMaxTopupAmount] = useState('10000');
  const [autoTopupEnabled, setAutoTopupEnabled] = useState(false);
  const [autoTopupThreshold, setAutoTopupThreshold] = useState('1000');
  const [autoTopupAmount, setAutoTopupAmount] = useState('5000');

  // Fee Settings (ADScard cost is 3%)
  const [adscardFeePercent] = useState(3); // Fixed ADScard cost
  const [ourFeePercent, setOurFeePercent] = useState('5');
  const [minCardTopup, setMinCardTopup] = useState('10');

  // Card Limits
  const [defaultDailyLimit, setDefaultDailyLimit] = useState('1000');
  const [defaultMonthlyLimit, setDefaultMonthlyLimit] = useState('10000');
  const [maxSingleTransaction, setMaxSingleTransaction] = useState('500');

  // Query for settings
  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ['admin', 'balance-settings'],
    queryFn: getBalanceSettings,
  });

  // Query for balance status
  const { data: balanceData, isLoading: balanceLoading, refetch: refetchBalance } = useQuery({
    queryKey: ['admin', 'balance-status'],
    queryFn: getBalanceStatus,
    refetchInterval: 60000, // Refresh every minute
  });

  // Update local state when settings are loaded
  useEffect(() => {
    if (settingsData?.data) {
      const s = settingsData.data;
      setMinTopupAmount(s.minTopupAmount.toString());
      setMaxTopupAmount(s.maxTopupAmount.toString());
      setAutoTopupEnabled(s.autoTopupEnabled);
      setAutoTopupThreshold(s.autoTopupThreshold.toString());
      setAutoTopupAmount(s.autoTopupAmount.toString());
      setOurFeePercent(s.ourFeePercent.toString());
      setMinCardTopup(s.minCardTopup.toString());
      setDefaultDailyLimit(s.defaultDailyLimit.toString());
      setDefaultMonthlyLimit(s.defaultMonthlyLimit.toString());
      setMaxSingleTransaction(s.maxSingleTransaction.toString());
    }
  }, [settingsData]);

  // Mutation for updating settings
  const updateMutation = useMutation({
    mutationFn: updateBalanceSettings,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'balance-settings'] });
      toast.success(data.message || 'Settings updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update settings');
    },
  });

  // Mutation for triggering auto-topup
  const triggerMutation = useMutation({
    mutationFn: triggerAutoTopup,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'balance-status'] });
      if (data.data.triggered) {
        toast.success(data.data.message);
      } else {
        toast.info(data.data.message);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to trigger auto-topup');
    },
  });

  const totalFeePercent = adscardFeePercent + parseFloat(ourFeePercent || '0');

  const handleSaveTopupSettings = async () => {
    const data: UpdateBalanceSettingsRequest = {
      minTopupAmount: parseFloat(minTopupAmount),
      maxTopupAmount: parseFloat(maxTopupAmount),
      autoTopupEnabled,
      autoTopupThreshold: parseFloat(autoTopupThreshold),
      autoTopupAmount: parseFloat(autoTopupAmount),
    };
    updateMutation.mutate(data);
  };

  const handleSaveFeeSettings = async () => {
    const data: UpdateBalanceSettingsRequest = {
      ourFeePercent: parseFloat(ourFeePercent),
      minCardTopup: parseFloat(minCardTopup),
    };
    updateMutation.mutate(data);
  };

  const handleSaveCardLimits = async () => {
    const data: UpdateBalanceSettingsRequest = {
      defaultDailyLimit: parseFloat(defaultDailyLimit),
      defaultMonthlyLimit: parseFloat(defaultMonthlyLimit),
      maxSingleTransaction: parseFloat(maxSingleTransaction),
    };
    updateMutation.mutate(data);
  };

  const handleTriggerAutoTopup = () => {
    triggerMutation.mutate();
  };

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Balance Status */}
      {balanceData?.data && (
        <Card className={balanceData.data.belowThreshold ? 'border-yellow-500' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconWallet className="h-5 w-5 text-blue-600" />
                <CardTitle>Current Balance Status</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchBalance()}
                disabled={balanceLoading}
              >
                <IconRefresh className={`mr-2 h-4 w-4 ${balanceLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Master Balance</p>
                <p className="text-2xl font-bold">${balanceData.data.currentBalance.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Auto-Topup</p>
                <p className={`text-lg font-bold ${balanceData.data.autoTopupEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                  {balanceData.data.autoTopupEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Threshold</p>
                <p className="text-lg font-bold">${balanceData.data.autoTopupThreshold.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className={`text-lg font-bold ${balanceData.data.belowThreshold ? 'text-yellow-600' : 'text-green-600'}`}>
                  {balanceData.data.belowThreshold ? (
                    <span className="flex items-center gap-1">
                      <IconAlertTriangle className="h-4 w-4" />
                      Below Threshold
                    </span>
                  ) : (
                    'OK'
                  )}
                </p>
              </div>
            </div>
            {balanceData.data.autoTopupEnabled && balanceData.data.belowThreshold && (
              <div className="mt-4">
                <Button
                  onClick={handleTriggerAutoTopup}
                  disabled={triggerMutation.isPending}
                  variant="outline"
                  className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                >
                  {triggerMutation.isPending && (
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Trigger Auto-Topup Now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Master Balance Topup Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconWallet className="h-5 w-5 text-blue-600" />
            <CardTitle>Master Balance Topup Settings</CardTitle>
          </div>
          <CardDescription>
            Configure automatic and manual topup limits for master wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Manual Topup Limits */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Manual Topup Limits</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="minTopup">Minimum Topup Amount ($)</Label>
                <Input
                  id="minTopup"
                  type="number"
                  value={minTopupAmount}
                  onChange={(e) => setMinTopupAmount(e.target.value)}
                  placeholder="50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxTopup">Maximum Topup Amount ($)</Label>
                <Input
                  id="maxTopup"
                  type="number"
                  value={maxTopupAmount}
                  onChange={(e) => setMaxTopupAmount(e.target.value)}
                  placeholder="10000"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Auto Topup Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Automatic Topup</h4>
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-topup"
                  checked={autoTopupEnabled}
                  onCheckedChange={setAutoTopupEnabled}
                />
                <Label htmlFor="auto-topup" className="text-sm">
                  {autoTopupEnabled ? 'Enabled' : 'Disabled'}
                </Label>
              </div>
            </div>

            {autoTopupEnabled && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="autoThreshold">
                    Auto-topup Threshold ($)
                  </Label>
                  <Input
                    id="autoThreshold"
                    type="number"
                    value={autoTopupThreshold}
                    onChange={(e) => setAutoTopupThreshold(e.target.value)}
                    placeholder="1000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Trigger topup when balance falls below this amount
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="autoAmount">Auto-topup Amount ($)</Label>
                  <Input
                    id="autoAmount"
                    type="number"
                    value={autoTopupAmount}
                    onChange={(e) => setAutoTopupAmount(e.target.value)}
                    placeholder="5000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Amount to topup when threshold is reached
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveTopupSettings} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <IconSettings className="mr-2 h-4 w-4" />
              )}
              Save Topup Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Fee Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconPercentage className="h-5 w-5 text-purple-600" />
            <CardTitle>Fee Structure</CardTitle>
          </div>
          <CardDescription>
            Configure fees for card operations (ADScard base cost: 3%)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">ADScard Base Fee</span>
              <span className="text-lg font-bold text-red-600">
                {adscardFeePercent}%
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Fixed cost from ADScard provider
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ourFee">Our Additional Fee (%)</Label>
            <Input
              id="ourFee"
              type="number"
              step="0.1"
              value={ourFeePercent}
              onChange={(e) => setOurFeePercent(e.target.value)}
              placeholder="5"
            />
            <p className="text-xs text-muted-foreground">
              Your profit margin on top of ADScard cost
            </p>
          </div>

          <div className="rounded-lg border bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Fee to Users</span>
              <span className="text-xl font-bold text-primary">
                {totalFeePercent.toFixed(1)}%
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {adscardFeePercent}% (ADScard) + {ourFeePercent}% (Our fee) ={' '}
              {totalFeePercent.toFixed(1)}%
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="minCardTopup">
              Minimum Card Topup for Users ($)
            </Label>
            <Input
              id="minCardTopup"
              type="number"
              value={minCardTopup}
              onChange={(e) => setMinCardTopup(e.target.value)}
              placeholder="10"
            />
            <p className="text-xs text-muted-foreground">
              Minimum amount users can topup their cards
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveFeeSettings} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <IconSettings className="mr-2 h-4 w-4" />
              )}
              Save Fee Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card Limits */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconCreditCard className="h-5 w-5 text-green-600" />
            <CardTitle>Default Card Limits</CardTitle>
          </div>
          <CardDescription>
            Set default spending limits for new cards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="dailyLimit">Daily Limit ($)</Label>
              <Input
                id="dailyLimit"
                type="number"
                value={defaultDailyLimit}
                onChange={(e) => setDefaultDailyLimit(e.target.value)}
                placeholder="1000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyLimit">Monthly Limit ($)</Label>
              <Input
                id="monthlyLimit"
                type="number"
                value={defaultMonthlyLimit}
                onChange={(e) => setDefaultMonthlyLimit(e.target.value)}
                placeholder="10000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="singleTx">Max Single Transaction ($)</Label>
              <Input
                id="singleTx"
                type="number"
                value={maxSingleTransaction}
                onChange={(e) => setMaxSingleTransaction(e.target.value)}
                placeholder="500"
              />
            </div>
          </div>

          <div className="rounded-lg border bg-blue-500/5 p-4">
            <h4 className="mb-2 text-sm font-semibold">Current Defaults</h4>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily:</span>
                <span className="font-medium">${defaultDailyLimit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly:</span>
                <span className="font-medium">${defaultMonthlyLimit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Per Transaction:</span>
                <span className="font-medium">${maxSingleTransaction}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveCardLimits} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <IconSettings className="mr-2 h-4 w-4" />
              )}
              Save Card Limits
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
