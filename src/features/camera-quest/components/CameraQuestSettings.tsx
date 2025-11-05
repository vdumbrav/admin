import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import {
  useCameraQuestSettings,
  useUpdateCameraQuestSettings,
  useStatistics,
} from '../api/camera-quest-api';

export const CameraQuestSettings = () => {
  const { data: settings, isLoading } = useCameraQuestSettings();
  const { data: stats } = useStatistics();
  const updateSettings = useUpdateCameraQuestSettings();

  const [formData, setFormData] = useState({
    requiredPipes: settings?.requiredPipes || 10,
    isEnabled: settings?.isEnabled || false,
    sessionTimeoutMinutes: settings?.sessionTimeoutMinutes || 15,
    maxActiveSessions: settings?.maxActiveSessions || 1,
  });

  // Update form when settings load
  useState(() => {
    if (settings) {
      setFormData({
        requiredPipes: settings.requiredPipes,
        isEnabled: settings.isEnabled,
        sessionTimeoutMinutes: settings.sessionTimeoutMinutes,
        maxActiveSessions: settings.maxActiveSessions,
      });
    }
  });

  const handleSave = () => {
    updateSettings.mutate(formData);
  };

  const hasChanges =
    settings &&
    (formData.requiredPipes !== settings.requiredPipes ||
      formData.isEnabled !== settings.isEnabled ||
      formData.sessionTimeoutMinutes !== settings.sessionTimeoutMinutes ||
      formData.maxActiveSessions !== settings.maxActiveSessions);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Statistics Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats?.totalSessions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Active Now</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>{stats?.activeSessions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Won Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>{stats?.wonSessions || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Available Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-yellow-600'>{stats?.availableCardsCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle>Quest Settings</CardTitle>
          <CardDescription>Configure Camera Flappy Bird Quest parameters</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Enabled Switch */}
          <div className='flex items-center justify-between space-x-2'>
            <div className='space-y-0.5'>
              <Label htmlFor='enabled'>Quest Enabled</Label>
              <div className='text-sm text-muted-foreground'>
                Allow users to play Camera Quest
              </div>
            </div>
            <Switch
              id='enabled'
              checked={formData.isEnabled}
              onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
            />
          </div>

          {/* Required Pipes */}
          <div className='space-y-2'>
            <Label htmlFor='requiredPipes'>Required Pipes to Win</Label>
            <Input
              id='requiredPipes'
              type='number'
              min={1}
              max={100}
              value={formData.requiredPipes}
              onChange={(e) =>
                setFormData({ ...formData, requiredPipes: parseInt(e.target.value) || 10 })
              }
            />
            <p className='text-sm text-muted-foreground'>
              Number of pipes player must pass to win (1-100)
            </p>
          </div>

          {/* Session Timeout */}
          <div className='space-y-2'>
            <Label htmlFor='timeout'>Session Timeout (minutes)</Label>
            <Input
              id='timeout'
              type='number'
              min={5}
              max={120}
              value={formData.sessionTimeoutMinutes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sessionTimeoutMinutes: parseInt(e.target.value) || 15,
                })
              }
            />
            <p className='text-sm text-muted-foreground'>
              How long QR code stays valid (5-120 minutes)
            </p>
          </div>

          {/* Max Active Sessions */}
          <div className='space-y-2'>
            <Label htmlFor='maxSessions'>Max Active Sessions per User</Label>
            <Input
              id='maxSessions'
              type='number'
              min={1}
              max={10}
              value={formData.maxActiveSessions}
              onChange={(e) =>
                setFormData({ ...formData, maxActiveSessions: parseInt(e.target.value) || 1 })
              }
            />
            <p className='text-sm text-muted-foreground'>
              Maximum concurrent active sessions per user (1-10)
            </p>
          </div>

          {/* Save Button */}
          <div className='flex justify-end'>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateSettings.isPending}
              className='w-full sm:w-auto'
            >
              {updateSettings.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Saving...
                </>
              ) : (
                <>
                  <Save className='mr-2 h-4 w-4' />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
