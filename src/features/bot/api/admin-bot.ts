import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orvalMutator } from '@/lib/api/client/orvalMutator';
import { useAppAuth } from '@/auth/hooks';
import type {
  BotStats,
  BotUser,
  BotLimits,
  UserMapping,
  UserContext,
  SystemPrompt,
  KnowledgeEntry,
  BannedConfig,
  CustomInstructions,
  AIConfig,
  ResponseTemplate,
  ChatLog,
  TrainingExport,
} from '../types';

// ==================== Stats & Users ====================

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
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useBotUsers = (page = 1, limit = 50) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'bot', 'users', page, limit],
    queryFn: async (): Promise<{ users: BotUser[]; total: number }> => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/bot/users?page=${page}&limit=${limit}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });
};

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
        method: 'PUT',
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

export const useBotMappings = () => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'bot', 'mappings'],
    queryFn: async (): Promise<UserMapping[]> => {
      const token = await auth.getAccessToken();
      return orvalMutator<UserMapping[]>({
        url: '/admin/bot/mappings',
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });
};

export const useUserContext = (userId: string) => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'bot', 'context', userId],
    queryFn: async (): Promise<UserContext> => {
      const token = await auth.getAccessToken();
      return orvalMutator<UserContext>({
        url: `/admin/bot/users/${encodeURIComponent(userId)}/context`,
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    enabled: !!userId,
  });
};

// ==================== System Prompts ====================

export const useSystemPrompts = () => {
  const auth = useAppAuth();

  return useQuery({
    queryKey: ['admin', 'bot', 'prompts'],
    queryFn: async (): Promise<Record<string, SystemPrompt>> => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: '/admin/bot/training/prompts',
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
    mutationFn: async ({ key, prompt, language }: { key: string; prompt: string; language?: string }) => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: '/admin/bot/training/prompts',
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { key, prompt, language },
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
    queryFn: async (): Promise<Record<string, KnowledgeEntry>> => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: '/admin/bot/training/knowledge',
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
    mutationFn: async ({ key, name, content, category }: { key: string; name: string; content: string; category?: string }) => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: '/admin/bot/training/knowledge',
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { key, name, content, category },
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
    mutationFn: async (key: string) => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/bot/training/knowledge/${encodeURIComponent(key)}`,
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
        url: '/admin/bot/training/banned',
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
        url: '/admin/bot/training/banned',
        method: 'PUT',
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
        url: '/admin/bot/training/instructions',
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
        url: '/admin/bot/training/instructions',
        method: 'PUT',
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
        url: '/admin/bot/training/ai-config',
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
        url: '/admin/bot/training/ai-config',
        method: 'PUT',
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
    queryFn: async (): Promise<Record<string, ResponseTemplate>> => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: '/admin/bot/training/templates',
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
    mutationFn: async ({ trigger, response, language, exact }: ResponseTemplate) => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: '/admin/bot/training/templates',
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { trigger, response, language, exact },
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
        url: `/admin/bot/training/templates/${encodeURIComponent(trigger)}`,
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
    queryFn: async (): Promise<{ logs: ChatLog[]; total: number }> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (userId) params.append('userId', userId);

      const token = await auth.getAccessToken();
      return orvalMutator({
        url: `/admin/bot/training/logs?${params.toString()}`,
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
        url: '/admin/bot/training/export',
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });
};

export const useImportTrainingData = () => {
  const auth = useAppAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<TrainingExport>) => {
      const token = await auth.getAccessToken();
      return orvalMutator({
        url: '/admin/bot/training/import',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'bot'] });
    },
  });
};
