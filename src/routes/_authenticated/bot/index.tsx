import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
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
import { PromptGenerator } from '@/features/bot/components/prompt-generator';
import { TopicsDashboard } from '@/features/bot/components/topics-dashboard';

export const Route = createFileRoute('/_authenticated/bot/')({
  component: BotAdminPage,
});

type PeriodOption = '7' | '30' | '90';

const PERIOD_OPTIONS = [
  { value: '7' as PeriodOption, label: '7 days' },
  { value: '30' as PeriodOption, label: '30 days' },
  { value: '90' as PeriodOption, label: '90 days' },
];

function BotAdminPage() {
  const [period, setPeriod] = useState<PeriodOption>('7');

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Walme AI Bot Management</h1>
          <p className="text-muted-foreground">
            Manage bot configuration, training, and user interactions
          </p>
        </div>
        <div className="flex gap-2">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setPeriod(option.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                period === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <BotStatsOverview period={period} />

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-10">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="limits">Limits</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="generator">Generator</TabsTrigger>
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
              <BotUsersTable period={period} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Topics & Insights</CardTitle>
              <CardDescription>
                AI-powered analysis of user conversations and interests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TopicsDashboard />
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

        <TabsContent value="generator" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Prompt Generator</CardTitle>
              <CardDescription>
                Generate professional prompts from ideas using AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PromptGenerator />
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
