import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orvalMutator } from '@/lib/api/client/orvalMutator';
import { useAppAuth } from '@/auth/hooks';
import type {
  BotStats,
  BotUsersResponse,
  BotLimits,
  MappingsResponse,
  UserContext,
  PromptsResponse,
  KnowledgeResponse,
  BannedConfig,
  CustomInstructions,
  AIConfig,
  ChatLogsResponse,
  TrainingExport,
  UserSummary,
} from '../types';

// ==================== Stats ====================

export const useBotStats = () => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'bot', 'stats'],
    queryFn: async (): Promise<BotStats> => {
      const token = await auth.getAccessToken();
      return orvalMutator<BotStats>({
        url: '/admin/bot/stats',
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    refetchInterval: 30000,
  });
};

// ==================== Users ====================

export const useBotUsers = (page = 1, limit = 50) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'bot', 'users', page, limit],
    queryFn: async (): Promise<BotUsersResponse> => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/bot/users?page=${page}&limit=${limit}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });
};

export const useResetUserLimit = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ platform, userId }: { platform: string; userId: string }) => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/bot/users/${platform}/${encodeURIComponent(userId)}/reset-limit`,
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bot', 'users'] });
    },
  });
};

// ==================== Limits ====================

export const useBotLimits = () => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'bot', 'limits'],
    queryFn: async (): Promise<BotLimits> => {
      const token = await auth.getAccessToken();
      return orvalMutator<BotLimits>({
        url: '/admin/bot/limits',
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });
};

export const useUpdateBotLimits = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (limits: Partial<BotLimits>) => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: '/admin/bot/limits',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: limits,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bot', 'limits'] });
    },
  });
};

// ==================== Mappings ====================

export const useBotMappings = (page = 1, limit = 50) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'bot', 'mappings', page, limit],
    queryFn: async (): Promise<MappingsResponse> => {
      const token = await auth.getAccessToken();
      return orvalMutator<MappingsResponse>({
        url: `/admin/bot/mappings?page=${page}&limit=${limit}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });
};

export const useDeleteMapping = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (telegramChatId: string) => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/bot/mappings/${encodeURIComponent(telegramChatId)}`,
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bot', 'mappings'] });
    },
  });
};

// ==================== User Context ====================

export const useUserContext = (userId: string) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'bot', 'context', userId],
    queryFn: async (): Promise<UserContext | null> => {
      const token = await auth.getAccessToken();
      return orvalMutator<UserContext | null>({
        url: `/admin/bot/context/${encodeURIComponent(userId)}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    enabled: !!userId,
  });
};

export const useClearUserContext = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/bot/context/${encodeURIComponent(userId)}`,
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bot', 'context'] });
    },
  });
};

// ==================== System Prompts ====================

export const useSystemPrompts = () => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'bot', 'prompts'],
    queryFn: async (): Promise<PromptsResponse> => {
      const token = await auth.getAccessToken();
      return orvalMutator<PromptsResponse>({
        url: '/admin/bot/prompts',
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });
};

export const useUpdateSystemPrompt = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, prompt }: { key: string; prompt: string }) => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/bot/prompts/${encodeURIComponent(key)}`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { content: prompt },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bot', 'prompts'] });
    },
  });
};

export const useDeleteSystemPrompt = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promptType: string) => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/bot/prompts/${encodeURIComponent(promptType)}`,
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bot', 'prompts'] });
    },
  });
};

// ==================== Knowledge Base ====================

export const useKnowledgeBase = () => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'bot', 'knowledge'],
    queryFn: async (): Promise<KnowledgeResponse> => {
      const token = await auth.getAccessToken();
      return orvalMutator<KnowledgeResponse>({
        url: '/admin/bot/knowledge',
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });
};

export const useUpdateKnowledgeEntry = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, content }: { key: string; content: string }) => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/bot/knowledge/${encodeURIComponent(key)}`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { content },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bot', 'knowledge'] });
    },
  });
};

export const useDeleteKnowledgeEntry = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (topic: string) => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/bot/knowledge/${encodeURIComponent(topic)}`,
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bot', 'knowledge'] });
    },
  });
};

// ==================== Banned Words/Topics ====================

export const useBannedConfig = () => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'bot', 'banned'],
    queryFn: async (): Promise<BannedConfig> => {
      const token = await auth.getAccessToken();
      return orvalMutator<BannedConfig>({
        url: '/admin/bot/banned',
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });
};

export const useUpdateBannedConfig = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: Partial<BannedConfig>) => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: '/admin/bot/banned',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: config,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bot', 'banned'] });
    },
  });
};

// ==================== Custom Instructions ====================

export const useCustomInstructions = () => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'bot', 'instructions'],
    queryFn: async (): Promise<CustomInstructions> => {
      const token = await auth.getAccessToken();
      return orvalMutator<CustomInstructions>({
        url: '/admin/bot/instructions',
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });
};

export const useUpdateCustomInstructions = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (instructions: Partial<CustomInstructions>) => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: '/admin/bot/instructions',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: instructions,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bot', 'instructions'] });
    },
  });
};

// ==================== AI Config ====================

export const useAIConfig = () => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'bot', 'ai-config'],
    queryFn: async (): Promise<AIConfig> => {
      const token = await auth.getAccessToken();
      return orvalMutator<AIConfig>({
        url: '/admin/bot/ai-config',
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });
};

export const useUpdateAIConfig = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: Partial<AIConfig>) => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: '/admin/bot/ai-config',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: config,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bot', 'ai-config'] });
    },
  });
};

// ==================== Response Templates ====================

export const useResponseTemplates = () => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'bot', 'templates'],
    queryFn: async (): Promise<Record<string, { response: string; language?: string; exact?: boolean; updatedAt?: string }>> => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: '/admin/bot/templates',
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });
};

export const useUpdateResponseTemplate = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ trigger, response, language, exact }: { trigger: string; response: string; language?: string; exact?: boolean }) => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/bot/templates/${encodeURIComponent(trigger)}`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { response, language, exact },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bot', 'templates'] });
    },
  });
};

export const useDeleteResponseTemplate = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trigger: string) => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/bot/templates/${encodeURIComponent(trigger)}`,
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bot', 'templates'] });
    },
  });
};

// ==================== Chat Logs ====================

export const useChatLogs = (page = 1, limit = 50, userId?: string) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'bot', 'logs', page, limit, userId],
    queryFn: async (): Promise<ChatLogsResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (userId) params.append('userId', userId);

      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/bot/logs?${params.toString()}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });
};

// ==================== Training Export ====================

export const useExportTrainingData = () => {
  const auth = useAppAuth();

  return useMutation({
    mutationFn: async (): Promise<TrainingExport> => {
      const token = await auth.getAccessToken();
      return orvalMutator<TrainingExport>({
        url: '/admin/bot/export-training',
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });
};

// ==================== Prompt Generator ====================

export interface GeneratePromptRequest {
  idea: string;
  context?: string;
  type?: 'system' | 'user' | 'assistant';
}

export interface GeneratePromptResponse {
  success: boolean;
  prompt: string;
  type: string;
  idea: string;
}

export interface TestPromptRequest {
  prompt: string;
  testMessage?: string;
}

export interface TestPromptResponse {
  success: boolean;
  testMessage: string;
  result: string;
  tokensUsed: number;
}

export const useGeneratePrompt = () => {
  const auth = useAppAuth();

  return useMutation({
    mutationFn: async (data: GeneratePromptRequest): Promise<GeneratePromptResponse> => {
      const token = await auth.getAccessToken();
      return orvalMutator<GeneratePromptResponse>({
        url: '/admin/bot/generate-prompt',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data,
      });
    },
  });
};

export const useTestPrompt = () => {
  const auth = useAppAuth();

  return useMutation({
    mutationFn: async (data: TestPromptRequest): Promise<TestPromptResponse> => {
      const token = await auth.getAccessToken();
      return orvalMutator<TestPromptResponse>({
        url: '/admin/bot/test-prompt',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data,
      });
    },
  });
};

// ==================== User Summary ====================

export const useSummarizeUser = () => {
  const auth = useAppAuth();

  return useMutation({
    mutationFn: async ({ userId, lang = 'ru' }: { userId: string; lang?: string }): Promise<UserSummary> => {
      const token = await auth.getAccessToken();
      return orvalMutator<UserSummary>({
        url: `/admin/bot/summarize-user/${encodeURIComponent(userId)}?lang=${lang}`,
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });
};

// ==================== Topics Analytics ====================

export interface TopicsAnalytics {
  topTopics: Array<{ topic: string; count: number; trend: 'up' | 'down' | 'stable' }>;
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  userInterests: Array<{ interest: string; userCount: number }>;
  recentQuestions: string[];
  lastUpdated: string;
}

export const useTopicsAnalytics = () => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'bot', 'topics-analytics'],
    queryFn: async (): Promise<TopicsAnalytics> => {
      const token = await auth.getAccessToken();
      return orvalMutator<TopicsAnalytics>({
        url: '/admin/bot/topics-analytics',
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useGenerateTopicsAnalytics = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lang = 'ru' }: { lang?: string } = {}): Promise<TopicsAnalytics> => {
      const token = await auth.getAccessToken();
      return orvalMutator<TopicsAnalytics>({
        url: `/admin/bot/topics-analytics/generate?lang=${lang}`,
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bot', 'topics-analytics'] });
    },
  });
};

// ==================== User Profiles ====================

export const useSaveUserProfile = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, profile }: { userId: string; profile: UserSummary }) => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/bot/save-user-profile/${encodeURIComponent(userId)}`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: profile,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bot', 'user-profiles'] });
    },
  });
};

export const useUserProfiles = (page = 1, limit = 50) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'bot', 'user-profiles', page, limit],
    queryFn: async () => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/bot/user-profiles?page=${page}&limit=${limit}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });
};
