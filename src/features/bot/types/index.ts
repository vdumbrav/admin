// Bot Admin Types

export interface BotStats {
  totalUsers: number;
  totalMessages: number;
  activeToday: number;
  matrixUsers: number;
  telegramUsers: number;
  bridgedUsers: number;
}

export interface BotUser {
  id: string;
  platform: 'matrix' | 'telegram' | 'bridged';
  matrixId?: string;
  telegramId?: string;
  username?: string;
  tier: string;
  language: string;
  messagesCount: number;
  lastActive: string;
  createdAt: string;
  bridgedFrom?: string; // Original ID if user is bridged
  linkedUsers?: string[]; // IDs of linked accounts
}

export interface BotLimits {
  free: number;
  level1: number;
  level2: number;
  level3: number;
  pro: number;
  premium: number;
}

export interface UserMapping {
  matrixId: string;
  telegramId: string;
  username?: string;
  displayName?: string;
  createdAt: string;
}

export interface UserContext {
  userId: string;
  platform: string;
  language: string;
  tier: string;
  messagesCount: number;
  lastActive: string;
  recentMessages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
}

export interface SystemPrompt {
  key: string;
  name: string;
  prompt: string;
  language?: string;
  description?: string;
  updatedAt?: string;
}

export interface KnowledgeEntry {
  key: string;
  name: string;
  content: string;
  category?: string;
  language?: string;
  updatedAt?: string;
}

export interface BannedConfig {
  words: string[];
  topics: string[];
  regex: string[];
}

export interface CustomInstructions {
  global: string;
  perLanguage: Record<string, string>;
}

export interface AIConfig {
  defaultModel: string;
  models: Record<string, string>;
  fallbackModel: string;
  maxTokens: number;
  temperature: number;
}

export interface ResponseTemplate {
  trigger: string;
  response: string;
  language?: string;
  exact?: boolean;
}

export interface ChatLog {
  id: string;
  userId: string;
  platform: string;
  message: string;
  response: string;
  model: string;
  cached: boolean;
  timestamp: string;
}

export interface TrainingExport {
  prompts: Record<string, SystemPrompt>;
  knowledge: Record<string, KnowledgeEntry>;
  templates: Record<string, ResponseTemplate>;
  instructions: CustomInstructions;
  banned: BannedConfig;
  aiConfig: AIConfig;
  exportedAt: string;
}
