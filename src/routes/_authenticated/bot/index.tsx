import { createFileRoute } from '@tanstack/react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BotStatsOverview } from '@/features/bot/components/bot-stats-overview';
import { BotUsersTable } from '@/features/bot/components/bot-users-table';
import { BotLimitsEditor } from '@/features/bot/components/bot-limits-editor';
import { SystemPromptsEditor } from '@/features/bot/components/system-prompts-editor';
import { KnowledgeBaseEditor } from '@/features/bot/components/knowledge-base-editor';
import { BannedContentEditor } from '@/features/bot/components/banned-content-editor';
import { AIConfigEditor } from '@/features/bot/components/ai-config-editor';
import { ResponseTemplatesEditor } from '@/features/bot/components/response-templates-editor';
import { ChatLogsViewer } from '@/features/bot/components/chat-logs-viewer';

export const Route = createFileRoute('/_authenticated/bot/')({
  component: BotAdminPage,
});

function BotAdminPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Walme AI Bot Management</h1>
        <p className="text-muted-foreground">
          Manage bot configuration, training, and user interactions
        </p>
      </div>

      <BotStatsOverview />

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="limits">Limits</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
          <TabsTrigger value="banned">Banned</TabsTrigger>
          <TabsTrigger value="ai">AI Config</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Bot Users</CardTitle>
              <CardDescription>
                View and manage bot users across Matrix and Telegram
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BotUsersTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limits</CardTitle>
              <CardDescription>
                Configure daily request limits per subscription tier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BotLimitsEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Prompts</CardTitle>
              <CardDescription>
                Customize AI system prompts for different contexts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemPromptsEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
              <CardDescription>
                Add custom knowledge entries for the AI to reference
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KnowledgeBaseEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banned" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Banned Content</CardTitle>
              <CardDescription>
                Configure words, topics, and patterns to block
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BannedContentEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
              <CardDescription>
                Configure AI models and generation parameters per tier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AIConfigEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Response Templates</CardTitle>
              <CardDescription>
                Create automatic responses for specific triggers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponseTemplatesEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Chat Logs</CardTitle>
              <CardDescription>
                View conversation history for training and debugging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChatLogsViewer />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
