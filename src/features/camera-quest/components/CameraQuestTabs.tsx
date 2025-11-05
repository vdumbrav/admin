import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CameraQuestSettings } from './CameraQuestSettings';
import { Settings, Gamepad2 } from 'lucide-react';

export const CameraQuestTabs = () => {
  return (
    <Tabs defaultValue='settings' className='w-full'>
      <TabsList className='grid w-full grid-cols-2 lg:w-[400px]'>
        <TabsTrigger value='settings' className='flex items-center gap-2'>
          <Settings className='h-4 w-4' />
          Settings
        </TabsTrigger>
        <TabsTrigger value='management' className='flex items-center gap-2'>
          <Gamepad2 className='h-4 w-4' />
          Management
        </TabsTrigger>
      </TabsList>

      <TabsContent value='settings' className='mt-6'>
        <CameraQuestSettings />
      </TabsContent>

      <TabsContent value='management' className='mt-6'>
        <div className='text-muted-foreground text-center p-8'>
          Prize pool and sessions management coming soon...
        </div>
      </TabsContent>
    </Tabs>
  );
};
