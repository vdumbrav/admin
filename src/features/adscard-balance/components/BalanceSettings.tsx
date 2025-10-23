import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  IconCreditCard,
  IconPercentage,
  IconWallet,
  IconSettings,
  IconCheck,
} from '@tabler/icons-react';

interface BalanceSettingsProps {
  authToken?: string;
}

export function BalanceSettings({ authToken: _authToken }: BalanceSettingsProps) {
  // Topup Settings
  const [minTopupAmount, setMinTopupAmount] = useState('50');
  const [maxTopupAmount, setMaxTopupAmount] = useState('10000');
  const [autoTopupEnabled, setAutoTopupEnabled] = useState(false);
  const [autoTopupThreshold, setAutoTopupThreshold] = useState('1000');
  const [autoTopupAmount, setAutoTopupAmount] = useState('5000');

  // Fee Settings (ADScard cost is 3%)
  const [adscardFeePercent] = useState(3); // Fixed ADScard cost
  const [ourFeePercent, setOurFeePercent] = useState('5'); // Our additional fee
  const [minCardTopup, setMinCardTopup] = useState('10'); // Minimum card topup for users

  // Card Limits
  const [defaultDailyLimit, setDefaultDailyLimit] = useState('1000');
  const [defaultMonthlyLimit, setDefaultMonthlyLimit] = useState('10000');
  const [maxSingleTransaction, setMaxSingleTransaction] = useState('500');

  const totalFeePercent = adscardFeePercent + parseFloat(ourFeePercent || '0');

  const handleSaveTopupSettings = async () => {
    try {
      // TODO: Call API to save topup settings
      toast.success('Topup settings saved successfully');
    } catch (error) {
      toast.error('Failed to save topup settings');
    }
  };

  const handleSaveFeeSettings = async () => {
    try {
      // TODO: Call API to save fee settings
      toast.success('Fee settings saved successfully');
    } catch (error) {
      toast.error('Failed to save fee settings');
    }
  };

  const handleSaveCardLimits = async () => {
    try {
      // TODO: Call API to save card limit settings
      toast.success('Card limit settings saved successfully');
    } catch (error) {
      toast.error('Failed to save card limit settings');
    }
  };

  return (
    <div className="space-y-6">
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
              <Button
                variant={autoTopupEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAutoTopupEnabled(!autoTopupEnabled)}
              >
                {autoTopupEnabled ? (
                  <>
                    <IconCheck className="mr-2 h-4 w-4" />
                    Enabled
                  </>
                ) : (
                  'Enable'
                )}
              </Button>
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
            <Button onClick={handleSaveTopupSettings}>
              <IconSettings className="mr-2 h-4 w-4" />
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
            <Button onClick={handleSaveFeeSettings}>
              <IconSettings className="mr-2 h-4 w-4" />
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
            <Button onClick={handleSaveCardLimits}>
              <IconSettings className="mr-2 h-4 w-4" />
              Save Card Limits
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
