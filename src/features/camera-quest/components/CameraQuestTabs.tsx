import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CameraQuestSettings } from './CameraQuestSettings';
import { CameraQuestPrizeCards } from './CameraQuestPrizeCards';
import { CameraQuestSessions } from './CameraQuestSessions';
import { CameraQuestStatistics } from './CameraQuestStatistics';
import { Settings, Trophy, Users, BarChart3 } from 'lucide-react';

export const CameraQuestTabs = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Camera Quest Management</h3>
        <p className="text-sm text-muted-foreground">
          Manage Camera Flappy Bird Quest settings, prize pool, sessions, and statistics
        </p>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
          <TabsTrigger value="prizes" className="gap-2">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Prize Cards</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="statistics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Statistics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <CameraQuestSettings />
        </TabsContent>

        <TabsContent value="prizes" className="space-y-4">
          <CameraQuestPrizeCards />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <CameraQuestSessions />
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <CameraQuestStatistics />
        </TabsContent>
      </Tabs>
    </div>
  );
};
